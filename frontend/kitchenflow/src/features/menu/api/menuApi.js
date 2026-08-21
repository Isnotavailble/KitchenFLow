import { apiClient } from '../../../api/apiClient'

export const menuApi = {
  // GET /api/menu
  async getAllMenu() {
    return apiClient.get('/menu')
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
