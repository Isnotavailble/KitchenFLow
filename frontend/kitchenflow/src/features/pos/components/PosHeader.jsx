import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { QrCode, LogOut, ChefHat, User, Bell, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { usePos } from '../hooks/usePos'
import ReadyPickupModal from './ReadyPickupModal'
import pageLogo from '../../../assets/page_logo.png'

export default function PosHeader() {
  const { user, logout } = useAuth()
  const { setIsPreOrderModalOpen, completedPickupQueue } = usePos()
  const [isPickupOpen, setIsPickupOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ROLE_ADMIN'
  const readyCount = completedPickupQueue?.length || 0

  return (
    <>
      <header className="bg-white border-b border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-3.5 flex items-center justify-between select-none shrink-0 z-10">
        {/* Left: Brand or Station Title */}
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
              <>Cashier</>
            ) : (
              <>Kitchen<span className="text-[#FF5C39]">Flow</span></>
            )}
          </h1>
        </div>

        {/* Right: Actions & Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Notifications Bell Trigger */}
          <button
            type="button"
            onClick={() => setIsPickupOpen(prev => !prev)}
            className="relative w-8 h-8 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-zinc-700 shadow-2xs transition active:scale-[0.96] cursor-pointer flex items-center justify-center shrink-0"
            title="Kitchen completion notifications"
          >
            <Bell className="w-4 h-4 text-zinc-700" />
            {readyCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-center bg-[#FF5C39] text-white text-[10px] font-black rounded-full shadow-xs">
                {readyCount}
              </span>
            )}
          </button>

          {/* QR Pre-Order Code Lookup Button */}
          <button
            type="button"
            onClick={() => setIsPreOrderModalOpen(true)}
            className="h-8 flex items-center space-x-1.5 px-3.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-all duration-150 active:scale-[0.96] cursor-pointer shrink-0"
            title="Lookup in-store mobile pre-order code"
          >
            <QrCode className="w-3.5 h-3.5 text-[#FF5C39]" />
            <span>Scan Pre-Order</span>
          </button>

          {/* Standalone Cashier Controls (When not in Admin Sidebar mode) */}
          {!isAdmin && (
            <>
              {user?.role === 'ROLE_CHEF' && (
                <Link
                  to="/kds"
                  className="h-8 flex items-center space-x-1.5 px-3.5 bg-zinc-100 hover:bg-zinc-200/80 rounded-xl text-xs font-semibold text-zinc-700 transition active:scale-[0.96] shrink-0"
                >
                  <ChefHat className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Kitchen KDS</span>
                </Link>
              )}

              <div className="flex items-center space-x-2 pl-2 border-l border-zinc-200/80">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-600 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-zinc-800 block leading-tight">
                    {user?.username || 'Cashier'}
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-medium">
                    Cashier
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
            </>
          )}
        </div>
      </header>

      {/* Ready for Pickup Modal */}
      <ReadyPickupModal
        isOpen={isPickupOpen}
        onClose={() => setIsPickupOpen(false)}
      />
    </>
  )
}
