import { apiClient } from '../../../api/apiClient'

export const categoryApi = {
  // GET /api/categories
  async getAllCategories() {
    return apiClient.get('/categories')
  }
}
