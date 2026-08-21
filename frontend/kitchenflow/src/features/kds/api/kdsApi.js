import { orderApi } from '../../order/api/orderApi'
import { getElapsedTime } from '../utils/timeFormatter'

export const kdsApi = {
  async getOrders({ status = 'All', searchOrderNumber = '', menuFilter = 'ALL', page = 0, size = 20 } = {}) {
    // 1. Fetch live orders from backend API
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

    // 3. Integer Order Number Search Filter
    if (searchOrderNumber && String(searchOrderNumber).trim() !== '') {
      const targetStr = String(searchOrderNumber).trim()
      list = list.filter((o) => {
        const orderNum = o.orderNumberInt ? String(o.orderNumberInt) : o.order_number.replace(/[^0-9]/g, '')
        return orderNum.includes(targetStr)
      })
    }

    // 4. Category & Menu Item Filter
    if (menuFilter && menuFilter !== 'ALL') {
      list = list.filter((o) =>
        o.items.some((item) => {
          const itemCat = (item.category || '').toLowerCase()
          const itemName = (item.name || '').toLowerCase()
          const filterLower = menuFilter.toLowerCase()
          return itemCat === filterLower || itemName === filterLower
        })
      )
    }

    // Sort FIFO (or newest completed first for complete tab)
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
