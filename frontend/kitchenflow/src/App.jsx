import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './features/auth/context/AuthContext'
import { KdsProvider } from './features/kds/context/KdsContext'
import { PosProvider } from './features/pos/context/PosContext'
import SseGlobalListener from './components/SseGlobalListener'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SseGlobalListener />
            <KdsProvider>
              <PosProvider>
                <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#ECEEF1] font-sans antialiased">
                  <AppRoutes />
                </div>
              </PosProvider>
            </KdsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
