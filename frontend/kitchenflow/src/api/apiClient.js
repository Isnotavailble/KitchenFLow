const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const token = localStorage.getItem('kf_access_token')

  const headers = {
    ...(options.headers || {})
  }

  // Automatically attach Bearer token if present
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Automatically set Content-Type to JSON if not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const config = {
    ...options,
    headers
  }

  try {
    const response = await fetch(url, config)

    if (response.status === 401) {
      // Unauthorized or token expired
      console.warn('API 401 Unauthorized:', endpoint)
    }

    // Try parsing JSON response
    const contentType = response.headers.get('content-type')
    let data = null
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const errorMessage = (typeof data === 'object' && (data?.error || data?.message)) || response.statusText
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  } catch (error) {
    console.error(`API Request Error [${config.method || 'GET'} ${endpoint}]:`, error)
    throw error
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
  }),
  put: (endpoint, body, options = {}) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body)
  }),
  patch: (endpoint, body, options = {}) => request(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined
  }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
}
