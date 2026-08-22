import { useState, useEffect, useCallback } from 'react'
import { KdsContext } from './kdsContextDef'
import { kdsApi } from '../api/kdsApi'
import { orderApi } from '../../order/api/orderApi'
import { categoryApi } from '../../category/api/categoryApi'
import { menuApi } from '../../menu/api/menuApi'
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

export function KdsProvider({ children }) {
  const { addToast } = useToast()

  const [orders, setOrders] = useState([])
  const [completedPickupQueue, setCompletedPickupQueue] = useState([])
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Waiting' | 'Priority' | 'Complete'
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [menuFilter, setMenuFilter] = useState('ALL')
  const [categories, setCategories] = useState([])
  const [unavailableMenuItems, setUnavailableMenuItems] = useState([])
  const [isAlertBannerDismissed, setIsAlertBannerDismissed] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load initial unavailable menu items from Menu catalog
  useEffect(() => {
    let isMounted = true
    async function fetchInitialUnavailable() {
      try {
        const res = await menuApi.getAllMenu({ size: 100 })
        const items = Array.isArray(res) ? res : (res?.items || [])
        const unavail = items.filter((m) => m.isAvailable === false)
        if (isMounted) {
          setUnavailableMenuItems(unavail)
        }
      } catch (err) {
        console.error('Failed to load menu availability in KDS:', err)
      }
    }
    fetchInitialUnavailable()
    return () => {
      isMounted = false
    }
  }, [])

  // Load categories directly from Category database table
  useEffect(() => {
    let isMounted = true
    async function fetchCategories() {
      try {
        const catList = await categoryApi.getAllCategories()
        if (Array.isArray(catList) && isMounted) {
          setCategories(catList.map((c) => c.name || c))
        }
      } catch (err) {
        console.error('Failed to load categories from database:', err)
      }
    }
    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [])


  // Helper to map backend OrderResponse to UI Ticket
  const mapOrderToTicket = useCallback((o) => {
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
        itemNote: i.itemNote || null
      }))
    }
  }, [])


  const fetchUnreadCompletedPickups = useCallback(async () => {
    try {
      const rawList = await orderApi.getCompletedPickups()
      const mapped = Array.isArray(rawList) ? rawList.map(mapOrderToTicket) : []
      const readSet = getReadNotificationIds()
      return mapped.filter((o) => !readSet.has(o.id) && !readSet.has(String(o.id)))
    } catch (err) {
      console.error('Failed to load completed pickups:', err)
      return []
    }
  }, [mapOrderToTicket])

  // Manual refresh callback
  const refreshOrders = useCallback(async () => {
    try {
      setLoading(true)
      try {
        const res = await kdsApi.getOrders({
          status: activeFilter,
          searchOrderNumber,
          menuFilter,
          page: 0,
          size: 20
        })
        setOrders(res.items)
        setTotalCount(res.totalCount)
        setHasMore(res.hasMore)
        setPage(0)
      } catch {
        // Ignore if forbidden for role
      }

      const unreadCompleted = await fetchUnreadCompletedPickups()
      setCompletedPickupQueue(unreadCompleted)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, searchOrderNumber, menuFilter, fetchUnreadCompletedPickups])

  // Synchronize state on filter/search change with page 0
  useEffect(() => {
    let isMounted = true

    async function loadInitial() {
      try {
        try {
          const res = await kdsApi.getOrders({
            status: activeFilter,
            searchOrderNumber,
            menuFilter,
            page: 0,
            size: 20
          })
          if (isMounted) {
            setOrders(res.items)
            setTotalCount(res.totalCount)
            setHasMore(res.hasMore)
            setPage(0)
          }
        } catch {
          // Ignore if forbidden for non-chef role
        }

        const unreadCompleted = await fetchUnreadCompletedPickups()
        if (isMounted) {
          setCompletedPickupQueue(unreadCompleted)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInitial()

    return () => {
      isMounted = false
    }
  }, [activeFilter, searchOrderNumber, menuFilter, fetchUnreadCompletedPickups])


  // Listen to Global Real-Time SSE Order Events
  useEffect(() => {
    const handleOrderCreated = (e) => {
      const rawOrder = e.detail
      if (!rawOrder) return
      const ticket = mapOrderToTicket(rawOrder)

      // Do NOT display new waiting orders if currently viewing Complete or Cancelled tab
      if (
        activeFilter === 'Complete' ||
        activeFilter === 'Completed' ||
        activeFilter === 'Cancelled' ||
        activeFilter === 'Canceled'
      ) {
        return
      }

      // Check if search order number filter matches
      if (searchOrderNumber && String(ticket.orderNumberInt) !== searchOrderNumber && String(ticket.id) !== searchOrderNumber) {
        return
      }

      // Check if category filter matches
      if (menuFilter && menuFilter !== 'ALL') {
        const matchesCategory = ticket.items.some((item) => item.category === menuFilter)
        if (!matchesCategory) return
      }

      setOrders((prev) => {
        if (prev.some((o) => o.id === ticket.id)) return prev
        return [ticket, ...prev]
      })
      setTotalCount((prev) => prev + 1)
    }

    const handleOrderUpdated = (e) => {
      const rawOrder = e.detail
      if (!rawOrder) return
      const ticket = mapOrderToTicket(rawOrder)

      if (activeFilter === 'Complete' || activeFilter === 'Completed') {
        if (ticket.status === 'Completed') {
          setOrders((prev) => {
            if (prev.some((o) => o.id === ticket.id)) {
              return prev.map((o) => (o.id === ticket.id ? ticket : o))
            }
            return [ticket, ...prev]
          })
        } else {
          setOrders((prev) => prev.filter((o) => o.id !== ticket.id))
        }
      } else if (activeFilter === 'Cancelled' || activeFilter === 'Canceled') {
        if (ticket.status === 'Cancelled') {
          // Check if search order number matches
          if (searchOrderNumber && String(ticket.orderNumberInt) !== searchOrderNumber && String(ticket.id) !== searchOrderNumber) {
            return
          }
          // Check if category filter matches
          if (menuFilter && menuFilter !== 'ALL') {
            const matchesCategory = ticket.items.some((item) => item.category === menuFilter)
            if (!matchesCategory) return
          }

          setOrders((prev) => {
            if (prev.some((o) => o.id === ticket.id)) {
              return prev.map((o) => (o.id === ticket.id ? ticket : o))
            }
            return [ticket, ...prev]
          })
        } else {
          setOrders((prev) => prev.filter((o) => o.id !== ticket.id))
        }
      } else {
        setOrders((prev) =>
          prev
            .map((o) => (o.id === ticket.id ? ticket : o))
            .filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled')
        )
      }
    }


    const handleMenuUpdated = (e) => {
      const menuData = e.detail
      if (!menuData) return

      setUnavailableMenuItems((prev) => {
        if (menuData.deleted || menuData.isAvailable === true) {
          return prev.filter((m) => m.id !== menuData.id && m.name !== menuData.name)
        }
        if (menuData.isAvailable === false) {
          setIsAlertBannerDismissed(false)
          const exists = prev.some((m) => m.id === menuData.id)
          if (exists) {
            return prev.map((m) => (m.id === menuData.id ? { ...m, ...menuData } : m))
          }
          return [...prev, menuData]
        }
        return prev
      })
    }

    window.addEventListener('kf:order-created', handleOrderCreated)
    window.addEventListener('kf:order-updated', handleOrderUpdated)
    window.addEventListener('kf:menu-updated', handleMenuUpdated)

    return () => {
      window.removeEventListener('kf:order-created', handleOrderCreated)
      window.removeEventListener('kf:order-updated', handleOrderUpdated)
      window.removeEventListener('kf:menu-updated', handleMenuUpdated)
    }
  }, [activeFilter, searchOrderNumber, menuFilter, mapOrderToTicket])




  // Load next page of 20 orders for infinite scroll
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    const nextPage = page + 1
    try {
      const res = await kdsApi.getOrders({
        status: activeFilter,
        searchOrderNumber,
        menuFilter,
        page: nextPage,
        size: 20
      })
      setOrders((prev) => [...prev, ...res.items])
      setTotalCount(res.totalCount)
      setHasMore(res.hasMore)
      setPage(nextPage)
    } catch (err) {
      console.error('Failed to load more orders from backend:', err)
    }
  }, [hasMore, loading, page, activeFilter, searchOrderNumber, menuFilter])

  const [processingOrderIds, setProcessingOrderIds] = useState(new Set())

  // Single-touch transition: Waiting -> Completed
  const markComplete = useCallback(async (orderId) => {
    if (processingOrderIds.has(orderId)) return
    setProcessingOrderIds((prev) => new Set(prev).add(orderId))
    try {
      await kdsApi.markComplete(orderId)
      const order = orders.find((o) => o.id === orderId || o.rawId === orderId)
      const orderNum = order?.order_number || `#${orderId}`
      addToast(`Order ${orderNum} Completed`, 'success')

      setOrders((prev) =>
        prev
          .map((o) => (o.id === orderId ? { ...o, status: 'Completed', completed_at: new Date().toISOString() } : o))
          .filter((o) => activeFilter === 'Complete' || o.status !== 'Completed')
      )
    } catch (err) {
      console.error('Failed to mark complete on server:', err)
      addToast(err?.message || 'Failed to update order status on server', 'error')
    } finally {
      setProcessingOrderIds((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }, [processingOrderIds, orders, activeFilter, addToast])

  // Owner Order Cancellation: Waiting -> Cancelled
  const cancelOrder = useCallback(async (orderId) => {
    if (processingOrderIds.has(orderId)) return
    setProcessingOrderIds((prev) => new Set(prev).add(orderId))
    try {
      await kdsApi.cancelOrder(orderId)
      addToast('Order cancelled', 'info')
      setOrders((prev) => prev.filter((o) => o.id !== orderId && o.rawId !== orderId))
    } catch (err) {
      console.error('Failed to cancel order on server:', err)
      addToast(err?.message || 'Failed to cancel order', 'error')
    } finally {
      setProcessingOrderIds((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }, [processingOrderIds, addToast])


  // Cashier Notification Actions
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

  const value = {
    orders,
    completedPickupQueue,
    refreshOrders,
    markHandedOver,
    markAllHandedOver,
    activeFilter,
    setActiveFilter,
    searchOrderNumber,
    setSearchOrderNumber,
    menuFilter,
    setMenuFilter,
    categories,
    unavailableMenuItems,
    isAlertBannerDismissed,
    setIsAlertBannerDismissed,
    page,
    hasMore,
    totalCount,
    loading,
    loadMore,
    markComplete,
    cancelOrder,
    processingOrderIds
  }

  return (
    <KdsContext.Provider value={value}>
      {children}
    </KdsContext.Provider>
  )
}

