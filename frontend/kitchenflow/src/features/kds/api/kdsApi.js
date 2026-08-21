import { INITIAL_ORDERS, generateSimulatedOrder } from './seedData'
import { getElapsedTime } from '../utils/timeFormatter'

export const kdsApi = {
  async getOrders({ status = 'All', searchOrderNumber = '', menuFilter = 'ALL', page = 0, size = 20 } = {}) {
    let list = [...INITIAL_ORDERS]

    // 1. Status Filter
    if (status === 'All') {
      list = list.filter(o => o.status !== 'Completed')
    } else if (status === 'Waiting') {
      list = list.filter(o => o.status === 'Waiting')
    } else if (status === 'Priority') {
      list = list.filter(o => o.status === 'Waiting' && getElapsedTime(o.created_at).isPriority)
    } else if (status === 'Complete') {
      list = list.filter(o => o.status === 'Completed')
    }

    // 2. Integer Order Number Search Filter
    if (searchOrderNumber && String(searchOrderNumber).trim() !== '') {
      const targetStr = String(searchOrderNumber).trim()
      list = list.filter(o => {
        const orderNum = o.orderNumberInt ? String(o.orderNumberInt) : o.order_number.replace(/[^0-9]/g, '')
        return orderNum.includes(targetStr)
      })
    }

    // 3. Menu Item Filter
    if (menuFilter && menuFilter !== 'ALL') {
      list = list.filter(o =>
        o.items.some(item => item.name.toLowerCase() === menuFilter.toLowerCase())
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
    const paginatedItems = list.slice(0, startIndex + size) // cumulative for infinite scroll
    const hasMore = startIndex + size < totalCount

    return Promise.resolve({
      items: paginatedItems,
      totalCount,
      page,
      size,
      hasMore
    })
  },

  async markComplete(orderId, currentOrders) {
    const target = currentOrders.find(o => o.id === orderId)
    if (!target) throw new Error('Order not found')

    const updated = {
      ...target,
      status: 'Completed',
      completed_at: new Date().toISOString()
    }
    return Promise.resolve(updated)
  },

  async simulateIncomingOrder() {
    return Promise.resolve(generateSimulatedOrder())
  }
}
