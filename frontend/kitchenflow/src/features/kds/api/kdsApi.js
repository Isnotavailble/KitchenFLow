import { orderApi } from '../../order/api/orderApi'
import { getElapsedTime } from '../utils/timeFormatter'

export const kdsApi = {
  async getOrders({ status = 'All', searchOrderNumber = '', menuFilter = 'ALL', page = 0, size = 20 } = {}) {
    // 1. Fetch live orders from backend
    const rawOrders = await orderApi.viewAllOrders()
    let list = Array.isArray(rawOrders)
      ? rawOrders.map((o) => {
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
        })
      : []

    // 2. Status Filter
    if (status === 'All') {
      list = list.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled')
    } else if (status === 'Waiting') {
      list = list.filter((o) => o.status === 'Waiting')
    } else if (status === 'Priority') {
      list = list.filter((o) => o.status === 'Waiting' && getElapsedTime(o.created_at).isPriority)
    } else if (status === 'Complete') {
      list = list.filter((o) => o.status === 'Completed')
    }

    // 3. Search Filter
    if (searchOrderNumber && String(searchOrderNumber).trim() !== '') {
      const targetStr = String(searchOrderNumber).trim()
      list = list.filter((o) => {
        const orderNum = o.orderNumberInt ? String(o.orderNumberInt) : o.order_number.replace(/[^0-9]/g, '')
        return orderNum.includes(targetStr)
      })
    }

    // 4. Menu Item Filter
    if (menuFilter && menuFilter !== 'ALL') {
      list = list.filter((o) =>
        o.items.some((item) => item.name.toLowerCase() === menuFilter.toLowerCase())
      )
    }

    // Sort FIFO or Newest Completed
    if (status === 'Complete') {
      list.sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())
    } else {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }

    const totalCount = list.length
    const startIndex = page * size
    const paginatedItems = list.slice(0, startIndex + size)
    const hasMore = startIndex + size < totalCount

    return {
      items: paginatedItems,
      totalCount,
      page,
      size,
      hasMore
    }
  },

  async markComplete(orderId) {
    const rawId = typeof orderId === 'number' ? orderId : parseInt(String(orderId).replace(/\D/g, '') || '0', 10)
    return orderApi.updateOrderStatus(rawId, 'completed')
  },

  async cancelOrder(orderId) {
    const rawId = typeof orderId === 'number' ? orderId : parseInt(String(orderId).replace(/\D/g, '') || '0', 10)
    return orderApi.updateOrderStatus(rawId, 'cancelled')
  }
}
