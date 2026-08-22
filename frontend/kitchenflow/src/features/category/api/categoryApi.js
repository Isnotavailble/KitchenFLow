import { apiClient } from '../../../api/apiClient'

export const categoryApi = {
  // GET /api/categories (Active categories for POS/KDS/Menu)
  async getAllCategories() {
    return apiClient.get('/categories')
  },

  // GET /api/categories/admin (All categories with isDeleted and itemCount)
  async getAllCategoriesAdmin() {
    return apiClient.get('/categories/admin')
  },

  // POST /api/categories (Create category)
  async createCategory(data) {
    return apiClient.post('/categories', data)
  },

  // PUT /api/categories/{id} (Update/Rename category)
  async updateCategory(id, data) {
    return apiClient.put(`/categories/${id}`, data)
  },

  // PATCH /api/categories/{id}/toggle?deleted={bool} (Soft delete / Toggle active)
  async toggleCategory(id, deleted) {
    const query = deleted !== undefined ? `?deleted=${deleted}` : ''
    return apiClient.patch(`/categories/${id}/toggle${query}`)
  },

  // DELETE /api/categories/{id}?targetCategoryId={id}&deleteChildItems={bool} (Hard delete)
  async deleteCategory(id, { targetCategoryId, deleteChildItems } = {}) {
    const params = new URLSearchParams()
    if (targetCategoryId != null) params.append('targetCategoryId', targetCategoryId)
    if (deleteChildItems != null) params.append('deleteChildItems', deleteChildItems)
    const queryString = params.toString()
    return apiClient.delete(`/categories/${id}${queryString ? `?${queryString}` : ''}`)
  }
}

