import { useState, useMemo, useEffect, useCallback } from 'react'
import { PosContext } from './posContextDef'
import { menuApi } from '../../menu/api/menuApi'
import { categoryApi } from '../../category/api/categoryApi'
import { orderApi } from '../../order/api/orderApi'
import { useToast } from '../../../hooks/useToast'


const READ_NOTIFICATIONS_KEY = 'kf_read_notification_ids'

function getReadNotificationIds() {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadNotificationIds(idsSet) {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(idsSet)))
  } catch {
    // ignore
  }
}

const mapOrderToTicket = (o) => {
  const isCompleted = o.status === 'completed' || o.status === 'COMPLETED'
  const isCancelled = o.status === 'cancelled' || o.status === 'CANCELLED'

  return {
    id: o.id || o.orderNumber,
    rawId: o.id,
    order_number: `#${o.orderNumber || o.id}`,
    orderNumberInt: o.orderNumber || o.id,
    orderType: o.orderType || 'takeaway',
    created_at: o.createdAt || o.created_at || null,
    completed_at: isCompleted ? (o.updatedAt || o.updated_at || null) : null,
    cancelled_at: isCancelled ? (o.updatedAt || o.updated_at || null) : null,
    status: isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Waiting',
    workloadTier: o.workloadTier === '1' || o.workloadTier === 1 || o.workloadTier === 'light' ? 'light' :
                  o.workloadTier === '3' || o.workloadTier === 3 || o.workloadTier === 'heavy' ? 'heavy' : 'medium',
    items: (o.orderItems || []).map((i) => ({
      name: i.menuName || 'Item',
      category: i.categoryName || i.category || 'General',
      qty: i.quantity || 1,
      desc: '',
      price: i.unitPrice ? i.unitPrice / 100 : 0,
      image: i.imageUrl || i.image || i.menuImageUrl || null,
      itemCustomization: i.itemNote || null
    }))
  }
}

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
  const [completedPickupQueue, setCompletedPickupQueue] = useState([])

  const reloadCompletedPickups = useCallback(async () => {
    try {
      const rawList = await orderApi.getCompletedPickups()
      const mapped = Array.isArray(rawList) ? rawList.map(mapOrderToTicket) : []
      const readSet = getReadNotificationIds()
      const unread = mapped.filter((o) => !readSet.has(o.id) && !readSet.has(String(o.id)))
      setCompletedPickupQueue(unread)
    } catch (err) {
      console.error('Failed to load completed pickups:', err)
    }
  }, [])

  const markHandedOver = useCallback((orderId) => {
    const readSet = getReadNotificationIds()
    readSet.add(orderId)
    readSet.add(String(orderId))
    saveReadNotificationIds(readSet)
    setCompletedPickupQueue((prev) => prev.filter((o) => o.id !== orderId && String(o.id) !== String(orderId)))
  }, [])

  const markAllHandedOver = useCallback(() => {
    const readSet = getReadNotificationIds()
    completedPickupQueue.forEach((o) => {
      readSet.add(o.id)
      readSet.add(String(o.id))
    })
    saveReadNotificationIds(readSet)
    setCompletedPickupQueue([])
  }, [completedPickupQueue])

  // Listen to Global Real-Time SSE Order Events for Cashier Pickup Notifications
  useEffect(() => {
    const handleOrderUpdated = (e) => {
      const rawOrder = e.detail
      if (!rawOrder) return
      const ticket = mapOrderToTicket(rawOrder)

      if (ticket.status === 'Completed') {
        const readSet = getReadNotificationIds()
        if (!readSet.has(ticket.id) && !readSet.has(String(ticket.id))) {
          setCompletedPickupQueue((prev) => [ticket, ...prev.filter((o) => o.id !== ticket.id)])
        }
      } else if (ticket.status === 'Cancelled') {
        setCompletedPickupQueue((prev) => prev.filter((o) => o.id !== ticket.id))
      }
    }

    window.addEventListener('kf:order-updated', handleOrderUpdated)
    return () => window.removeEventListener('kf:order-updated', handleOrderUpdated)
  }, [])


  const [categories, setCategories] = useState(['All'])

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getAllCategories()
      if (Array.isArray(data)) {
        setCategories(['All', ...data.map((c) => c.name || c)])
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }, [])

  // Fetch live menu items from backend matching selected category and search query
  const reloadMenu = useCallback(async () => {
    try {
      setLoadingMenu(true)
      const res = await menuApi.getAllMenu({
        category: selectedCategory,
        search: searchQuery,
        page: 0,
        size: 20
      })
      const rawList = Array.isArray(res) ? res : (res?.items || [])
      const mapped = rawList.map((item) => ({
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
    } catch (err) {
      console.error('Failed to load menu from backend:', err)
    } finally {
      setLoadingMenu(false)
    }
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    reloadMenu()
  }, [reloadMenu])

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

  // Direct server-filtered menu items
  const filteredMenuItems = menuList


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

      const backendResponse = await orderApi.createOrder({
        orderType: orderType === 'takeaway' ? 'takeaway' : 'dine_in',
        orderItems
      })
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
    loadPreOrder,
    completedPickupQueue,
    reloadCompletedPickups,
    markHandedOver,
    markAllHandedOver
  }

  return (
    <PosContext.Provider value={value}>
      {children}
    </PosContext.Provider>
  )
}
