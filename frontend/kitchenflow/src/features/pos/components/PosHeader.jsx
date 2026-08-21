import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { QrCode, LogOut, ChefHat, User } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { usePos } from '../hooks/usePos'
import pageLogo from '../../../assets/page_logo.png'

export default function PosHeader() {
  const { user, logout } = useAuth()
  const { setIsPreOrderModalOpen } = usePos()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <header className="bg-white border-b border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-3.5 flex items-center justify-between select-none shrink-0 z-10">
      {/* Left: Clean Brand Logo & Title (No subtitle, no badge) */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-orange-200/80 shrink-0 flex items-center justify-center bg-[#FF5C39]">
          <img
            src={pageLogo}
            alt="KitchenFlow Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 font-sans">
          Kitchen<span className="text-[#FF5C39]">Flow</span>
        </h1>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center space-x-3">
        {/* QR Pre-Order Code Lookup Button */}
        <button
          type="button"
          onClick={() => setIsPreOrderModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-all duration-150 active:scale-[0.96] cursor-pointer"
          title="Lookup in-store mobile pre-order code"
        >
          <QrCode className="w-3.5 h-3.5 text-[#FF5C39]" />
          <span>Scan Pre-Order</span>
        </button>

        {/* Link to KDS Kitchen (Available for Admin or quick testing) */}
        {(isAdmin || user?.role === 'ROLE_CHEF') && (
          <Link
            to="/kds"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 rounded-xl text-xs font-semibold text-zinc-700 transition active:scale-[0.96]"
            title="Switch to Kitchen Display System"
          >
            <ChefHat className="w-3.5 h-3.5 text-zinc-600" />
            <span>Kitchen KDS</span>
          </Link>
        )}

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-zinc-200/80">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-600">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold text-zinc-800 block leading-tight">
              {user?.username || 'Cashier'}
            </span>
            <span className="text-[10px] text-zinc-400 block font-medium">
              {user?.role === 'ROLE_ADMIN' ? 'Owner / Admin' : 'Cashier'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
