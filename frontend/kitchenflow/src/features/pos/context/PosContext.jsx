import React, { useState, useMemo } from 'react'
import { PosContext } from './posContextDef'
import { POS_MENU_ITEMS, POS_CATEGORIES } from '../api/menuData'
import { useKds } from '../../kds/hooks/useKds'

let nextPosOrderNumber = 5350

export function PosProvider({ children }) {
  const { addCreatedOrder } = useKds() || {}

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [orderType, setOrderType] = useState('dine_in') // 'dine_in' | 'takeaway'
  const [paymentMethod, setPaymentMethod] = useState('cash') // 'cash' | 'card'
  const [recentOrders, setRecentOrders] = useState([])
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false)

  // Filtered menu items by category and search
  const filteredMenuItems = useMemo(() => {
    return POS_MENU_ITEMS.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory
      const matchSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [selectedCategory, searchQuery])

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

  // Minimum quantity clamped to 1 (cannot be decremented below 1; use trash to delete)
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
  const checkout = (cashTendered = null) => {
    if (cart.length === 0) return null

    nextPosOrderNumber++
    const orderNum = nextPosOrderNumber

    // Calculate workload points
    const totalPoints = cart.reduce((sum, item) => sum + (item.prepPoints || 1) * item.qty, 0)
    let workloadTier = 'light'
    if (totalPoints >= 10) workloadTier = 'heavy'
    else if (totalPoints >= 5) workloadTier = 'medium'

    const newOrder = {
      id: `ord-${orderNum}`,
      order_number: `#${orderNum}`,
      orderNumberInt: orderNum,
      orderType, // 'dine_in' | 'takeaway'
      created_at: new Date().toISOString(),
      status: 'Waiting',
      workloadTier,
      items: cart.map((i) => ({
        name: i.name,
        qty: i.qty,
        desc: i.desc,
        image: i.image,
        price: i.price,
        itemCustomization: i.note ? i.note.trim() : null
      })),
      financials: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        paymentMethod,
        cashTendered: cashTendered || total,
        change: cashTendered ? Math.max(0, cashTendered - total) : 0
      }
    }

    // Add to kitchen queue if provider available
    if (addCreatedOrder) {
      addCreatedOrder(newOrder)
    }

    // Add to recent cashier orders
    setRecentOrders((prev) => [newOrder, ...prev.slice(0, 19)])
    setActiveReceipt(newOrder)
    clearCart()

    return newOrder
  }

  // Load in-store QR pre-order code
  const loadPreOrder = (code) => {
    if (!code || code.trim().length === 0) return { success: false, error: 'Enter a valid 6-digit code' }

    // Mock QR lookup: Add a sample combo cart
    const sampleItems = [
      POS_MENU_ITEMS[0], // Spicy Zinger Burger
      POS_MENU_ITEMS[4], // Mediterranzer Pizza
      POS_MENU_ITEMS[8]  // Iced Citrus Lemonade
    ]

    setCart(sampleItems.map((item) => ({ ...item, qty: 1, note: '' })))
    setIsPreOrderModalOpen(false)
    return { success: true }
  }

  const value = {
    categories: POS_CATEGORIES,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    menuItems: filteredMenuItems,
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
