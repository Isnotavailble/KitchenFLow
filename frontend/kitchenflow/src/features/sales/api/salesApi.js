import { apiClient } from '../../../api/apiClient'

export const salesApi = {
  // GET /api/admin/sales/summary
  getSummary: async () => {
    return apiClient.get('/admin/sales/summary')
  },

  // GET /api/admin/sales/trends?period=DAILY|WEEKLY|MONTHLY&interval=15|30|60&date=YYYY-MM-DD
  getTrends: async (period = 'DAILY', interval = 60, date = null) => {
    const params = new URLSearchParams()
    if (period) params.append('period', period)
    if (interval) params.append('interval', interval)
    if (date) params.append('date', date)
    return apiClient.get('/admin/sales/trends?' + params.toString())
  },


  // GET /api/admin/sales/menu-performance?period=DAILY|WEEKLY|MONTHLY&date=YYYY-MM-DD
  getMenuPerformance: async (period = 'DAILY', date = null) => {
    const params = new URLSearchParams()
    if (period) params.append('period', period)
    if (date) params.append('date', date)
    return apiClient.get('/admin/sales/menu-performance?' + params.toString())
  },

  // GET /api/admin/sales/cashier-balances?date=YYYY-MM-DD
  getCashierBalances: async (date = null) => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    const qs = params.toString()
    return apiClient.get('/admin/sales/cashier-balances' + (qs ? '?' + qs : ''))
  }
}

export default salesApi
