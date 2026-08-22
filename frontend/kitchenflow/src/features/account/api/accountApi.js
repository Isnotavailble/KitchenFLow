import { apiClient } from '../../../api/apiClient'

export const accountApi = {
  // GET /api/accounts
  getAllAccounts: async () => {
    return apiClient.get('/accounts')
  },

  // GET /api/accounts/:id
  getAccountById: async (id) => {
    return apiClient.get(`/accounts/${id}`)
  },

  // POST /api/accounts
  createAccount: async (payload) => {
    return apiClient.post('/accounts', payload)
  },

  // PUT /api/accounts/:id
  updateAccount: async (id, payload) => {
    return apiClient.put(`/accounts/${id}`, payload)
  },

  // PATCH /api/accounts/:id/deactivate
  deactivateAccount: async (id) => {
    return apiClient.patch(`/accounts/${id}/deactivate`)
  },

  // PATCH /api/accounts/:id/reactivate
  reactivateAccount: async (id) => {
    return apiClient.patch(`/accounts/${id}/reactivate`)
  },

  // PATCH /api/accounts/:id/change-password
  changePassword: async (id, newPassword) => {
    return apiClient.patch(`/accounts/${id}/change-password`, { newPassword })
  }

}

export default accountApi
