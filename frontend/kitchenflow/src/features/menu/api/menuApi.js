import { apiClient } from '../../../api/apiClient'

export const menuApi = {
  // GET /api/menu?category=...&search=...&page=0&size=20
  async getAllMenu(params = {}) {
    const query = new URLSearchParams()
    if (params.category && params.category !== 'All' && params.category !== 'ALL') {
      query.append('category', params.category)
    }
    if (params.search != null && params.search.trim() !== '') {
      query.append('search', params.search.trim())
    }
    if (params.page != null) query.append('page', params.page)
    if (params.size != null) query.append('size', params.size)

    const queryString = query.toString()
    return apiClient.get(`/menu${queryString ? `?${queryString}` : ''}`)
  },


  // GET /api/menu/{id}
  async getMenuById(id) {
    return apiClient.get(`/menu/${id}`)
  },

  // POST /api/menu (ROLE_ADMIN)
  async createMenu(data) {
    return apiClient.post('/menu', data)
  },

  // PUT /api/menu/{id} (ROLE_ADMIN)
  async updateMenu(id, data) {
    return apiClient.put(`/menu/${id}`, data)
  },

  // DELETE /api/menu/{id} (ROLE_ADMIN)
  async deleteMenu(id) {
    return apiClient.delete(`/menu/${id}`)
  },

  // PATCH /api/menu/{id}/toggle?value={bool} (ROLE_ADMIN)
  async toggleAvailability(id, value) {
    return apiClient.patch(`/menu/${id}/toggle?value=${value}`)
  }
}
