import { apiClient } from '../../../api/apiClient'

export const orderApi = {
  // GET /api/orders (ROLE_CHEF, ROLE_ADMIN)
  async getOrders(params = {}) {
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    if (params.orderNumber != null && params.orderNumber !== '') query.append('orderNumber', params.orderNumber)
    if (params.category && params.category !== 'ALL') query.append('category', params.category)
    if (params.page != null) query.append('page', params.page)
    if (params.size != null) query.append('size', params.size)

    const queryString = query.toString()
    return apiClient.get(`/orders${queryString ? `?${queryString}` : ''}`)
  },

  // GET /api/orders/completed_pickups (ROLE_CASHIER, ROLE_ADMIN, ROLE_CHEF)
  async getCompletedPickups() {
    return apiClient.get('/orders/completed_pickups')
  },

  // GET /api/orders/view_orders
  async viewAllOrders() {
    return apiClient.get('/orders/view_orders')
  },

  // POST /api/orders/create_order (ROLE_CASHIER, ROLE_ADMIN)
  async createOrder(orderRequest) {
    return apiClient.post('/orders/create_order', orderRequest)
  },

  // PATCH /api/orders/update_order_status/{orderId} (ROLE_CHEF, ROLE_ADMIN)
  async updateOrderStatus(orderId, status) {
    return apiClient.patch(`/orders/update_order_status/${orderId}`, { status })
  },

  // GET /api/pre-orders/{code}
  async getPreOrder(code) {
    return apiClient.get(`/pre-orders/${code}`)
  }
}
