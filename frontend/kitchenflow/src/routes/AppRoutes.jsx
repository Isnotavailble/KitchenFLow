import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth'
import PosPage from '../features/pos'
import KdsPage from '../features/kds'
import MenuPage from '../features/menu'
import NotFoundPage from '../components/NotFoundPage'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../features/auth/hooks/useAuth'

function IndexRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === 'ROLE_CHEF') {
    return <Navigate to="/kds" replace />
  }

  return <Navigate to="/pos" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Guest Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Cashier POS Route */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CASHIER', 'ROLE_ADMIN']}>
            <PosPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Kitchen KDS Route */}
      <Route
        path="/kds"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CHEF', 'ROLE_ADMIN']}>
            <KdsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Owner Menu Management Dedicated Route */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <MenuPage />
          </ProtectedRoute>
        }
      />

      {/* Root Index Redirect */}
      <Route path="/" element={<IndexRedirect />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
