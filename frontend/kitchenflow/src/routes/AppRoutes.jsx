import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth'
import PosPage from '../features/pos'
import KdsPage from '../features/kds'
import MenuPage from '../features/menu'
import {
  AdminLayout,
  DashboardPage,
  AccountsPage,
  ReportsPage
} from '../features/admin'
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

  if (user?.role === 'ROLE_ADMIN') {
    return <Navigate to="/menu" replace />
  }

  return <Navigate to="/pos" replace />
}

export default function AppRoutes() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <Routes>
      {/* Public Guest Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* When logged in as Owner (ROLE_ADMIN): ALL views preserve the persistent Admin Sidebar */}
      {isAdmin ? (
        <Route
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/kds" element={<KdsPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/accounts" element={<AccountsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
        </Route>
      ) : (
        <>
          {/* Standalone Cashier POS Station Route */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CASHIER']}>
                <PosPage />
              </ProtectedRoute>
            }
          />

          {/* Standalone Kitchen KDS Station Route */}
          <Route
            path="/kds"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CHEF']}>
                <KdsPage />
              </ProtectedRoute>
            }
          />
        </>
      )}

      {/* Root Index Redirect */}
      <Route path="/" element={<IndexRedirect />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
