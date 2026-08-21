import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-[#ECEEF1] font-sans antialiased">
      {/* Fixed Left Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Back-Office Content Area */}
      <main className="flex-1 h-full overflow-y-auto min-w-0 bg-[#ECEEF1] flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
