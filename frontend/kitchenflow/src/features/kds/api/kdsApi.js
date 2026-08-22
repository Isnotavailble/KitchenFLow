import { orderApi } from '../../order/api/orderApi'
import { getElapsedTime } from '../utils/timeFormatter'

export const kdsApi = {
  async getOrders({ status = 'All', searchOrderNumber = '', menuFilter = 'ALL', page = 0, size = 20 } = {}) {
    // 1. Fetch filtered and paginated orders from backend API
    const response = await orderApi.getOrders({
      status,
      orderNumber: searchOrderNumber || undefined,
      category: menuFilter !== 'ALL' ? menuFilter : undefined,
      page,
      size
    })

    const rawList = response?.items || (Array.isArray(response) ? response : [])
    const totalCount = response?.totalCount != null ? response.totalCount : rawList.length
    const hasMore = response?.hasMore != null ? response.hasMore : false

    const items = rawList.map((o) => {
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
    })

    return {
      items,
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
