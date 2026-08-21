import React, { useState, useEffect } from 'react'
import { AuthContext } from './authContextDef'
import { DEMO_USERS } from '../types/demoUsers'

export function AuthProvider({ children }) {
  // Initialize with Cashier as default or persisted user
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kitchenflow_user')
      return saved ? JSON.parse(saved) : DEMO_USERS.cashier
    } catch {
      return DEMO_USERS.cashier
    }
  })

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('kitchenflow_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('kitchenflow_user')
      }
    } catch {
      // ignore storage errors
    }
  }, [user])

  const login = (mobileNumber, password) => {
    const found = Object.values(DEMO_USERS).find((u) => u.mobileNumber === mobileNumber)
    if (found) {
      setUser(found)
      return { success: true, user: found }
    }

    if (mobileNumber && password) {
      const newUser = {
        id: Date.now(),
        username: `User ${mobileNumber.slice(-4)}`,
        mobileNumber,
        role: 'ROLE_CASHIER',
        shift: 'Main Counter'
      }
      setUser(newUser)
      return { success: true, user: newUser }
    }

    return { success: false, error: 'Invalid mobile number or password' }
  }

  const loginAs = (roleKey) => {
    const target = DEMO_USERS[roleKey]
    if (target) {
      setUser(target)
      return target
    }
    return null
  }

  const logout = () => {
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role: user?.role || null,
        login,
        loginAs,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
