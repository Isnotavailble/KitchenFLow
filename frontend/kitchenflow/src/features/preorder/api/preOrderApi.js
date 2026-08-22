import { apiClient } from '../../../api/apiClient'

export const preOrderApi = {
  // Public - GET /api/categories
  async getCategories() {
    return apiClient.get('/categories')
  },

  // Public - GET /api/menu
  async getMenu(params = {}) {
    const query = new URLSearchParams()
    if (params.category && params.category !== 'ALL') {
      query.append('category', params.category)
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim())
    }
    if (params.page != null) query.append('page', params.page)
    if (params.size != null) query.append('size', params.size)

    const qs = query.toString()
    return apiClient.get(`/menu${qs ? `?${qs}` : ''}`)
  },

  // Public - POST /api/pre-orders
  async createPreOrder(items) {
    return apiClient.post('/pre-orders', { items })
  },

  // Protected / Cashier - GET /api/pre-orders/{code}
  async getPreOrderByCode(code) {
    return apiClient.get(`/pre-orders/${encodeURIComponent(code)}`)
  },

  // Protected / Cashier - DELETE /api/pre-orders/{code}
  async deletePreOrder(code) {
    return apiClient.delete(`/pre-orders/${encodeURIComponent(code)}`)
  }
}

export default preOrderApi
