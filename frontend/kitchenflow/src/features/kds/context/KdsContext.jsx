import React, { useState, useEffect, useCallback } from 'react'
import { KdsContext } from './kdsContextDef'
import { kdsApi } from '../api/kdsApi'
import { INITIAL_ORDERS } from '../api/seedData'
import { useKitchenChime } from '../hooks/useKitchenChime'
import { useToast } from '../../../hooks/useToast'

export function KdsProvider({ children }) {
  const [orders, setOrders] = useState([])
  // Pre-seed completed pickup queue with the 3 completed seed orders
  const [completedPickupQueue, setCompletedPickupQueue] = useState(() => {
    return INITIAL_ORDERS.filter(o => o.status === 'Completed').sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )
  })
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Waiting' | 'Priority' | 'Complete'
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [menuFilter, setMenuFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const { playChime } = useKitchenChime()
  const { addToast } = useToast()

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
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load orders:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInitial()

    return () => {
      isMounted = false
    }
  }, [activeFilter, searchOrderNumber, menuFilter])

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
      setOrders(res.items)
      setTotalCount(res.totalCount)
      setHasMore(res.hasMore)
      setPage(nextPage)
    } catch (err) {
      console.error('Failed to load more orders:', err)
    }
  }, [hasMore, loading, page, activeFilter, searchOrderNumber, menuFilter])

  // Single-touch transition: Waiting -> Completed
  const markComplete = useCallback(async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order || order.status === 'Completed') return

      const completedOrder = {
        ...order,
        status: 'Completed',
        completed_at: new Date().toISOString()
      }

      setOrders(prev =>
        prev
          .map(o => (o.id === orderId ? completedOrder : o))
          .filter(o => activeFilter === 'Complete' || o.status !== 'Completed')
      )

      // Add to ready pickup queue for Cashier POS
      setCompletedPickupQueue(prev => [completedOrder, ...prev.filter(o => o.id !== orderId)])

      playChime(true)
      const orderTypeName = order.orderType === 'takeaway' ? 'Takeaway' : 'Dine-In'
      addToast(`Order ${order.order_number} (${orderTypeName}) is Ready for Pickup!`, 'success')
    } catch (err) {
      console.error('Failed to mark complete:', err)
    }
  }, [orders, activeFilter, playChime, addToast])

  // Cashier Notification Actions
  const markHandedOver = useCallback((orderId) => {
    setCompletedPickupQueue(prev => prev.filter(o => o.id !== orderId))
  }, [])

  const markAllHandedOver = useCallback(() => {
    setCompletedPickupQueue([])
  }, [])

  const simulateOrder = useCallback(async () => {
    try {
      const newOrder = await kdsApi.simulateIncomingOrder()
      setOrders(prev => [newOrder, ...prev])
      setTotalCount(prev => prev + 1)
      playChime(true)
      addToast(`New order ${newOrder.order_number} arrived`, 'new_order')
    } catch (err) {
      console.error('Failed to simulate order:', err)
    }
  }, [playChime, addToast])

  const addCreatedOrder = useCallback((newOrder) => {
    setOrders(prev => [newOrder, ...prev])
    setTotalCount(prev => prev + 1)
    playChime(true)
    addToast(`New order ${newOrder.order_number} created from POS`, 'new_order')
  }, [playChime, addToast])

  const value = {
    orders,
    completedPickupQueue,
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
    simulateOrder,
    addCreatedOrder
  }

  return (
    <KdsContext.Provider value={value}>
      {children}
    </KdsContext.Provider>
  )
}
