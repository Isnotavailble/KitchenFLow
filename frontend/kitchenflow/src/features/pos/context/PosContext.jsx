import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { PosContext } from './posContextDef'
import { menuApi } from '../../menu/api/menuApi'
import { orderApi } from '../../order/api/orderApi'
import { useToast } from '../../../hooks/useToast'

export function PosProvider({ children }) {
  const { addToast } = useToast()

  const [menuList, setMenuList] = useState([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [orderType, setOrderType] = useState('dine_in') // 'dine_in' | 'takeaway'
  const [paymentMethod, setPaymentMethod] = useState('cash') // 'cash' | 'card'
  const [recentOrders, setRecentOrders] = useState([])
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false)

  // Fetch live menu items from backend
  const reloadMenu = useCallback(async () => {
    try {
      setLoadingMenu(true)
      const data = await menuApi.getAllMenu()
      if (Array.isArray(data)) {
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.categoryName || item.category || 'General',
          price: item.price ? item.price / 100 : 0,
          workloadTier: item.workloadTier === 1 ? 'light' : item.workloadTier === 3 ? 'heavy' : 'medium',
          prepPoints: item.workloadTier === 1 ? 1 : item.workloadTier === 3 ? 10 : 4,
          desc: item.desc || '',
          image: item.imageUrl || null,
          imageUrl: item.imageUrl || null,
          imageId: item.imageId || null,
          isAvailable: item.isAvailable ?? true
        }))
        setMenuList(mapped)
      }
    } catch (err) {
      console.error('Failed to load menu from backend:', err)
    } finally {
      setLoadingMenu(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function initialLoad() {
      try {
        const data = await menuApi.getAllMenu()
        if (Array.isArray(data) && isMounted) {
          const mapped = data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.categoryName || item.category || 'General',
            price: item.price ? item.price / 100 : 0,
            workloadTier: item.workloadTier === 1 ? 'light' : item.workloadTier === 3 ? 'heavy' : 'medium',
            prepPoints: item.workloadTier === 1 ? 1 : item.workloadTier === 3 ? 10 : 4,
            desc: item.desc || '',
            image: item.imageUrl || null,
            imageUrl: item.imageUrl || null,
            imageId: item.imageId || null,
            isAvailable: item.isAvailable ?? true
          }))
          setMenuList(mapped)
        }
      } catch (err) {
        console.error('Initial menu load error:', err)
      } finally {
        if (isMounted) setLoadingMenu(false)
      }
    }

    initialLoad()

    return () => {
      isMounted = false
    }
  }, [])

  // Listen for live real-time menu updates over SSE
  useEffect(() => {
    const handleMenuUpdate = (e) => {
      const detail = e.detail
      if (!detail) return

      if (detail.deleted) {
        setMenuList((prev) => prev.filter((m) => m.id !== detail.id))
      } else {
        setMenuList((prev) => {
          const exists = prev.some((m) => m.id === detail.id)
          if (!exists) {
            reloadMenu()
            return prev
          }
          return prev.map((m) =>
            m.id === detail.id
              ? {
                  ...m,
                  name: detail.name || m.name,
                  price: detail.price ? detail.price / 100 : m.price,
                  category: detail.categoryName || detail.category || m.category,
                  isAvailable: detail.isAvailable ?? m.isAvailable,
                  image: detail.imageUrl || m.image,
                  imageUrl: detail.imageUrl || m.imageUrl
                }
              : m
          )
        })
      }
    }

    window.addEventListener('kf:menu-updated', handleMenuUpdate)
    return () => {
      window.removeEventListener('kf:menu-updated', handleMenuUpdate)
    }
  }, [reloadMenu])

  // Extract categories dynamically
  const categories = useMemo(() => {
    const unique = Array.from(new Set(menuList.map((m) => m.category))).filter(Boolean)
    return ['All', ...unique]
  }, [menuList])

  // Filtered menu items by category and search
  const filteredMenuItems = useMemo(() => {
    return menuList.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory
      const matchSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [menuList, selectedCategory, searchQuery])

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...item, qty: 1, note: '' }]
    })
  }

  // Minimum quantity clamped to 1
  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      return prev.map((i) => {
        if (i.id === itemId) {
          const newQty = Math.max(1, i.qty + delta)
          return { ...i, qty: newQty }
        }
        return i
      })
    })
  }

  const updateItemNote = (itemId, note) => {
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, note } : i))
    )
  }

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
  }

  // Financial computations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  }, [cart])

  const taxRate = 0.05 // 5% default tax
  const taxAmount = useMemo(() => subtotal * taxRate, [subtotal])
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount])
  const totalItemCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart])

  // Checkout & Submit order to Kitchen
  const checkout = async (cashTendered = null) => {
    if (cart.length === 0) return null

    try {
      const orderItems = cart.map((i) => ({
        menuId: i.id,
        quantity: i.qty,
        itemNote: i.note ? i.note.trim() : null
      }))

      const backendResponse = await orderApi.createOrder({ orderItems })
      const orderNum = backendResponse?.orderNumber || Math.floor(1000 + Math.random() * 9000)

      const totalPoints = cart.reduce((sum, item) => sum + (item.prepPoints || 1) * item.qty, 0)
      let workloadTier = 'light'
      if (totalPoints >= 10) workloadTier = 'heavy'
      else if (totalPoints >= 5) workloadTier = 'medium'

      const newOrder = {
        id: backendResponse?.id ? `ord-${backendResponse.id}` : `ord-${orderNum}`,
        order_number: `#${orderNum}`,
        orderNumberInt: orderNum,
        orderType,
        created_at: new Date().toISOString(),
        status: 'Waiting',
        workloadTier: backendResponse?.workloadTier || workloadTier,
        items: cart.map((i) => ({
          name: i.name,
          qty: i.qty,
          desc: i.desc,
          image: i.image || i.imageUrl,
          price: i.price,
          itemCustomization: i.note ? i.note.trim() : null
        })),
        financials: {
          subtotal: backendResponse?.totalPriceBeforeTax ? backendResponse.totalPriceBeforeTax / 100 : parseFloat(subtotal.toFixed(2)),
          tax: backendResponse?.taxAmount ? backendResponse.taxAmount / 100 : parseFloat(taxAmount.toFixed(2)),
          total: backendResponse?.totalPriceAfterTax ? backendResponse.totalPriceAfterTax / 100 : parseFloat(total.toFixed(2)),
          paymentMethod,
          cashTendered: cashTendered || total,
          change: cashTendered ? Math.max(0, cashTendered - total) : 0
        }
      }

      setRecentOrders((prev) => [newOrder, ...prev.slice(0, 19)])
      setActiveReceipt(newOrder)
      clearCart()

      return newOrder
    } catch (err) {
      console.error('Order creation error:', err)
      addToast(err?.message || 'Failed to submit order to kitchen', 'warning')
      return null
    }
  }

  // Load in-store QR pre-order code
  const loadPreOrder = async (code) => {
    if (!code || code.trim().length === 0) return { success: false, error: 'Enter a valid 6-digit code' }

    try {
      const res = await orderApi.getPreOrder(code.trim())
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        setCart(res.items.map((item) => ({ ...item, qty: item.qty || 1, note: item.note || '' })))
        setIsPreOrderModalOpen(false)
        addToast('Pre-order cart loaded successfully', 'success')
        return { success: true }
      }
    } catch (err) {
      console.error('Pre-order lookup error:', err)
      addToast('Pre-order code expired or invalid', 'warning')
    }

    return { success: false, error: 'Pre-order not found' }
  }

  const value = {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    menuItems: filteredMenuItems,
    loadingMenu,
    reloadMenu,
    cart,
    addToCart,
    updateQuantity,
    updateItemNote,
    removeFromCart,
    clearCart,
    orderType,
    setOrderType,
    subtotal,
    taxAmount,
    total,
    totalItemCount,
    paymentMethod,
    setPaymentMethod,
    checkout,
    recentOrders,
    activeReceipt,
    setActiveReceipt,
    isPreOrderModalOpen,
    setIsPreOrderModalOpen,
    loadPreOrder
  }

  return (
    <PosContext.Provider value={value}>
      {children}
    </PosContext.Provider>
  )
}
