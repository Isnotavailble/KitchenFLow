import React, { useState, useEffect, useCallback } from 'react'
import { KdsContext } from './kdsContextDef'
import { kdsApi } from '../api/kdsApi'

export function KdsProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [completedPickupQueue, setCompletedPickupQueue] = useState([])
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Waiting' | 'Priority' | 'Complete'
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [menuFilter, setMenuFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

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
      created_at: o.createdAt || new Date().toISOString(),
      completed_at: isCompleted ? (o.updatedAt || new Date().toISOString()) : null,
      cancelled_at: isCancelled ? (o.updatedAt || new Date().toISOString()) : null,
      status: isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Waiting',
      workloadTier: o.workloadTier === '1' || o.workloadTier === 1 || o.workloadTier === 'light' ? 'light' :
                    o.workloadTier === '3' || o.workloadTier === 3 || o.workloadTier === 'heavy' ? 'heavy' : 'medium',
      items: (o.orderItems || []).map((i) => ({
        name: i.menuName || 'Item',
        qty: i.quantity || 1,
        desc: '',
        price: i.unitPrice ? i.unitPrice / 100 : 0,
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
      setCompletedPickupQueue(completedRes.items || [])
    } catch (err) {
      console.error('Failed to load live orders from backend:', err)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, searchOrderNumber, menuFilter])

  // Initial and filter-change synchronization effect
  useEffect(() => {
    let isMounted = true

    async function load() {
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
        setCompletedPickupQueue(completedRes.items || [])
      } catch (err) {
        if (!isMounted) return
        console.error('Initial KDS load error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

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
        setCompletedPickupQueue((prev) => [ticket, ...prev.filter((o) => o.id !== ticket.id)])
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
  }, [activeFilter, mapOrderToTicket])

  // Load next page of orders
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
      console.error('Failed to load more orders:', err)
    }
  }, [hasMore, loading, page, activeFilter, searchOrderNumber, menuFilter])

  const [processingOrderIds, setProcessingOrderIds] = useState(new Set())

  // Single-touch transition: Waiting -> Completed (Chef / Admin)
  const markComplete = useCallback(async (orderId) => {
    if (processingOrderIds.has(orderId)) return
    setProcessingOrderIds((prev) => new Set(prev).add(orderId))
    try {
      await Promise.all([
        kdsApi.markComplete(orderId),
        new Promise((resolve) => setTimeout(resolve, 600))
      ])
    } catch (err) {
      console.error('Failed to mark complete on server:', err)
    } finally {
      setProcessingOrderIds((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }, [processingOrderIds])

  // Owner Order Cancellation: Waiting -> Cancelled (ROLE_ADMIN only)
  const cancelOrder = useCallback(async (orderId) => {
    if (processingOrderIds.has(orderId)) return
    setProcessingOrderIds((prev) => new Set(prev).add(orderId))
    try {
      await Promise.all([
        kdsApi.cancelOrder(orderId),
        new Promise((resolve) => setTimeout(resolve, 600))
      ])
    } catch (err) {
      console.error('Failed to cancel order on server:', err)
    } finally {
      setProcessingOrderIds((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }, [processingOrderIds])

  // Cashier Notification Actions
  const markHandedOver = useCallback((orderId) => {
    setCompletedPickupQueue((prev) => prev.filter((o) => o.id !== orderId))
  }, [])

  const markAllHandedOver = useCallback(() => {
    setCompletedPickupQueue([])
  }, [])

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
