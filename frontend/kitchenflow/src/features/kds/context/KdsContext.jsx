import React, { useState, useEffect, useCallback } from 'react'
import { KdsContext } from './kdsContextDef'
import { kdsApi } from '../api/kdsApi'
import { categoryApi } from '../../category/api/categoryApi'
import { useKitchenChime } from '../hooks/useKitchenChime'
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
  const [orders, setOrders] = useState([])
  const [completedPickupQueue, setCompletedPickupQueue] = useState([])
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Waiting' | 'Priority' | 'Complete'
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [menuFilter, setMenuFilter] = useState('ALL')
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const { playChime } = useKitchenChime()
  const { addToast } = useToast()

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
        itemCustomization: i.itemNote || null
      }))
    }
  }, [])

  // Manual refresh callback
  const refreshOrders = useCallback(async () => {
    try {
      setLoading(true)
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

      const completedRes = await kdsApi.getOrders({ status: 'Complete', page: 0, size: 20 })
      const readSet = getReadNotificationIds()
      const unreadCompleted = (completedRes.items || []).filter(
        (o) => !readSet.has(o.id) && !readSet.has(String(o.id))
      )
      setCompletedPickupQueue(unreadCompleted)
    } catch (err) {
      console.error('Failed to load live orders from backend:', err)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, searchOrderNumber, menuFilter])

  // Synchronize state on filter/search change with page 0
  useEffect(() => {
    let isMounted = true

    async function loadInitial() {
      try {
        const res = await kdsApi.getOrders({
          status: activeFilter,
          searchOrderNumber,
          menuFilter,
          page: 0,
          size: 20
        })
        if (!isMounted) return
        setOrders(res.items)
        setTotalCount(res.totalCount)
        setHasMore(res.hasMore)
        setPage(0)

        const completedRes = await kdsApi.getOrders({ status: 'Complete', page: 0, size: 20 })
        if (!isMounted) return
        const readSet = getReadNotificationIds()
        const unreadCompleted = (completedRes.items || []).filter(
          (o) => !readSet.has(o.id) && !readSet.has(String(o.id))
        )
        setCompletedPickupQueue(unreadCompleted)
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load orders from backend:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInitial()

    return () => {
      isMounted = false
    }
  }, [activeFilter, searchOrderNumber, menuFilter])

  // Listen to Global Real-Time SSE Order Events
  useEffect(() => {
    const handleOrderCreated = (e) => {
      const rawOrder = e.detail
      if (!rawOrder) return
      const ticket = mapOrderToTicket(rawOrder)

      setOrders((prev) => {
        if (prev.some((o) => o.id === ticket.id)) return prev
        return [ticket, ...prev]
      })
      setTotalCount((prev) => prev + 1)
      playChime(true)
      addToast(`New order ${ticket.order_number} arrived`, 'new_order')
    }

    const handleOrderUpdated = (e) => {
      const rawOrder = e.detail
      if (!rawOrder) return
      const ticket = mapOrderToTicket(rawOrder)

      setOrders((prev) =>
        prev
          .map((o) => (o.id === ticket.id ? ticket : o))
          .filter((o) => activeFilter === 'Complete' || o.status !== 'Completed')
      )

      if (ticket.status === 'Completed') {
        const readSet = getReadNotificationIds()
        if (!readSet.has(ticket.id) && !readSet.has(String(ticket.id))) {
          setCompletedPickupQueue((prev) => [ticket, ...prev.filter((o) => o.id !== ticket.id)])
        }
      } else if (ticket.status === 'Cancelled') {
        setCompletedPickupQueue((prev) => prev.filter((o) => o.id !== ticket.id))
      }
    }

    window.addEventListener('kf:order-created', handleOrderCreated)
    window.addEventListener('kf:order-updated', handleOrderUpdated)

    return () => {
      window.removeEventListener('kf:order-created', handleOrderCreated)
      window.removeEventListener('kf:order-updated', handleOrderUpdated)
    }
  }, [activeFilter, mapOrderToTicket, playChime, addToast])

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
      playChime(true)
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
      addToast('Failed to update order status on server', 'error')
    } finally {
      setProcessingOrderIds((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }, [processingOrderIds, orders, activeFilter, playChime, addToast])

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
      addToast('Failed to cancel order', 'error')
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
