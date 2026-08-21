import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin has universal access
  if (user?.role === 'ROLE_ADMIN') {
    return children
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If chef tries to access POS, redirect to KDS
    if (user?.role === 'ROLE_CHEF') {
      return <Navigate to="/kds" replace />
    }
    // If cashier tries to access KDS, redirect to POS
    if (user?.role === 'ROLE_CASHIER') {
      return <Navigate to="/pos" replace />
    }
    return <Navigate to="/login" replace />
  }

  return children
}
