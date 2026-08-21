import { apiClient } from '../../../api/apiClient'

export const orderApi = {
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
