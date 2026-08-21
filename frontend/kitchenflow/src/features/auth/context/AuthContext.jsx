import React, { useState, useEffect } from 'react'
import { AuthContext } from './authContextDef'
import { apiClient } from '../../../api/apiClient'
import { stopGlobalStream } from '../../../services/sseService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kitchenflow_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('kitchenflow_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('kitchenflow_user')
        localStorage.removeItem('kf_access_token')
        localStorage.removeItem('kf_refresh_token')
        stopGlobalStream()
      }
    } catch {
      // ignore storage errors
    }
  }, [user])

  const login = async (mobileNumber, password) => {
    try {
      const response = await apiClient.post('/auth/login', { mobileNumber, password })
      if (response && response.token) {
        const userData = {
          id: response.userId,
          username: response.username || (response.role === 'ROLE_ADMIN' ? 'Owner / Admin' : response.role === 'ROLE_CHEF' ? 'Chef' : 'Cashier'),
          mobileNumber: response.mobileNumber || mobileNumber,
          role: response.role,
          token: response.token
        }
        localStorage.setItem('kf_access_token', response.token.accessToken)
        localStorage.setItem('kf_refresh_token', response.token.refreshToken)
        setUser(userData)
        return { success: true, user: userData }
      }
      return { success: false, error: 'Invalid response from server' }
    } catch (err) {
      console.error('API login error:', err)
      return { success: false, error: err?.data?.error || err?.message || 'Invalid credentials' }
    }
  }

  const logout = () => {
    stopGlobalStream()
    setUser(null)
    localStorage.removeItem('kitchenflow_user')
    localStorage.removeItem('kf_access_token')
    localStorage.removeItem('kf_refresh_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated: !!user,
        role: user?.role
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
