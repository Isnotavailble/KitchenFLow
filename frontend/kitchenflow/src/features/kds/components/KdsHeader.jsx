import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, LogOut, User } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import pageLogo from '../../../assets/page_logo.png'

export default function KdsHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <header className="bg-white border-b border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-3.5 flex items-center justify-between select-none shrink-0 z-10">
      {/* Left: Station Title (Chef) for Admin or Brand Logo for Standalone Chef */}
      <div className="flex items-center space-x-3">
        {!isAdmin && (
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-orange-200/80 shrink-0 flex items-center justify-center bg-[#FF5C39]">
            <img
              src={pageLogo}
              alt="KitchenFlow Logo"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 font-sans">
          {isAdmin ? (
            <>Chef</>
          ) : (
            <>Kitchen<span className="text-[#FF5C39]">Flow</span></>
          )}
        </h1>
      </div>

      {/* Right: Standalone Chef Controls (When not in Admin Sidebar mode) */}
      {!isAdmin && (
        <div className="flex items-center space-x-2.5">
          {user?.role === 'ROLE_CASHIER' && (
            <Link
              to="/pos"
              className="h-8 flex items-center space-x-1.5 px-3.5 bg-zinc-100 hover:bg-zinc-200/80 rounded-xl text-xs font-semibold text-zinc-700 transition active:scale-[0.96] shrink-0"
            >
              <Store className="w-3.5 h-3.5 text-zinc-600" />
              <span>Cashier POS</span>
            </Link>
          )}

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-600 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-zinc-800 block leading-tight">
                {user?.username || 'Chef'}
              </span>
              <span className="text-[10px] text-zinc-400 block font-medium">
                Chef
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  )
}
