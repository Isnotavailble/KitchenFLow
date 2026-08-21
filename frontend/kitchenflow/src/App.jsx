import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import KdsFeature from './features/kds/index.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#ECEEF1] font-sans antialiased">
          <KdsFeature />
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
