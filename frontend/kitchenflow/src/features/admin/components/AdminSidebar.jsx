import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  BarChart3,
  Store,
  ChefHat,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import pageLogo from '../../../assets/page_logo.png'

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('kf_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('kf_sidebar_collapsed', String(next))
      } catch {
        // ignore storage error
      }
      return next
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const managementNav = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/menu', label: 'Menu Catalog', icon: UtensilsCrossed },
    { to: '/admin/accounts', label: 'Staff & Accounts', icon: Users },
    { to: '/admin/reports', label: 'Reports & Sales', icon: BarChart3 }
  ]

  const liveStations = [
    { to: '/pos', label: 'Cashier', icon: Store },
    { to: '/kds', label: 'Chef', icon: ChefHat }
  ]

  return (
    <aside
      className={`h-full bg-white border-r border-zinc-200/80 flex flex-col justify-between shrink-0 select-none z-20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-56'
      }`}
    >
      {/* Top Section: Brand Header & Navigation */}
      <div className="flex flex-col min-h-0">
        {/* 1. Brand Header */}
        <div className="px-3 py-3 border-b border-zinc-100 flex flex-col space-y-2 shrink-0 overflow-hidden">

          {/* Top Row: Logo & Brand Title + Collapse Button */}
          <div className="flex items-center h-11 w-full overflow-hidden shrink-0">
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs flex items-center justify-center bg-[#FF5C39]">
                <img
                  src={pageLogo}
                  alt="KitchenFlow"
                  className="w-full h-full object-cover scale-[1.12]"
                />
              </div>
            </div>

            {/* Title Text */}
            <div
              className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? 'max-w-0 opacity-0 pointer-events-none ml-0' : 'max-w-[130px] opacity-100 ml-3'
              }`}
            >
              <h1 className="text-base font-black tracking-tight text-zinc-900 leading-none font-sans truncate">
                Kitchen<span className="text-[#FF5C39]">Flow</span>
              </h1>
            </div>

            {/* Collapse Button */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[40px] opacity-100 ml-auto'
              }`}
            >
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 text-zinc-400 hover:text-[#FF5C39] hover:bg-zinc-100/80 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Expand Button */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isCollapsed ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <button
                type="button"
                onClick={toggleCollapse}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#FF5C39] hover:bg-orange-50/80 transition active:scale-95 cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-[#FF5C39]" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Navigation Items */}
        <div className="px-3 py-3 space-y-3.5 overflow-y-auto no-scrollbar">

          {/* Management Section */}
          <div>
            <span
              className={`px-1 text-[11px] font-semibold text-zinc-400 block transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-5 opacity-100 mb-1.5'
              }`}
            >
              Management
            </span>

            <nav className="space-y-1">
              {managementNav.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `w-full h-11 flex items-center rounded-xl text-xs font-bold transition-colors duration-150 overflow-hidden ${
                        isCollapsed
                          ? 'justify-start'
                          : isActive
                            ? 'bg-[#FF5C39] text-white shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`w-11 h-11 flex items-center justify-center shrink-0 rounded-xl transition-colors ${
                            isCollapsed
                              ? isActive
                                ? 'bg-[#FF5C39] text-white shadow-xs'
                                : 'text-[#FF5C39] hover:bg-zinc-100/80'
                              : ''
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors ${
                              isCollapsed
                                ? isActive
                                  ? 'text-white'
                                  : 'text-[#FF5C39]'
                                : isActive
                                  ? 'text-white'
                                  : 'text-[#FF5C39]'
                            }`}
                          />
                        </div>
                        <span
                          className={`truncate whitespace-nowrap transition-all duration-300 font-bold ${
                            isCollapsed
                              ? 'max-w-0 opacity-0 pointer-events-none ml-0'
                              : 'max-w-[150px] opacity-100 ml-2'
                          } ${isActive ? 'text-white' : 'text-zinc-600'}`}
                        >
                          {item.label}
                        </span>

                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Section Break Thin Line */}
          <div className="border-t border-zinc-100 my-1 shrink-0" />

          {/* Stations Section */}
          <div>
            <span
              className={`px-1 text-[11px] font-semibold text-zinc-400 block transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-5 opacity-100 mb-1.5'
              }`}
            >
              Stations
            </span>

            <nav className="space-y-1">
              {liveStations.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `w-full h-11 flex items-center rounded-xl text-xs font-bold transition-colors duration-150 overflow-hidden ${
                        isCollapsed
                          ? 'justify-start'
                          : isActive
                            ? 'bg-[#FF5C39] text-white shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`w-11 h-11 flex items-center justify-center shrink-0 rounded-xl transition-colors ${
                            isCollapsed
                              ? isActive
                                ? 'bg-[#FF5C39] text-white shadow-xs'
                                : 'text-[#FF5C39] hover:bg-zinc-100/80'
                              : ''
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors ${
                              isCollapsed
                                ? isActive
                                  ? 'text-white'
                                  : 'text-[#FF5C39]'
                                : isActive
                                  ? 'text-white'
                                  : 'text-[#FF5C39]'
                            }`}
                          />
                        </div>
                        <span
                          className={`truncate whitespace-nowrap transition-all duration-300 font-bold ${
                            isCollapsed
                              ? 'max-w-0 opacity-0 pointer-events-none ml-0'
                              : 'max-w-[150px] opacity-100 ml-2'
                          } ${isActive ? 'text-white' : 'text-zinc-600'}`}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>

          </div>
        </div>
      </div>

      {/* 3. Bottom Section: User Profile */}
      <div className="px-3 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between overflow-hidden shrink-0">

        <div className="flex items-center min-w-0">
          <div className="w-11 h-11 flex items-center justify-center shrink-0">
            <div
              className="w-10 h-10 rounded-xl bg-white border border-zinc-200/80 shadow-2xs flex items-center justify-center text-[#FF5C39] shrink-0"
              title={`${user?.username || 'Owner'} (Admin)`}
            >
              <User className="w-4.5 h-4.5 text-[#FF5C39]" />
            </div>
          </div>

          <div
            className={`min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap ${
              isCollapsed ? 'max-w-0 opacity-0 pointer-events-none ml-0' : 'max-w-[120px] opacity-100 ml-3'
            }`}
          >
            <span className="text-xs font-bold text-zinc-900 block truncate leading-tight">
              {user?.username || 'Owner Admin'}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400 block truncate">
              Admin
            </span>
          </div>
        </div>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[40px] opacity-100 ml-auto'
          }`}
        >
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition active:scale-95 cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

