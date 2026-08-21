import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Phone, ArrowRight, Eye, EyeOff, ShieldCheck, ChefHat, Store } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { DEMO_USERS } from './types/demoUsers'
import pageLogo from '../../assets/page_logo.png'

export default function LoginPage() {
  const { login, loginAs } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileNumber, setMobileNumber] = useState('09123456789')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname

  const redirectByRole = (user) => {
    if (from) {
      navigate(from, { replace: true })
      return
    }
    if (user.role === 'ROLE_CHEF') {
      navigate('/kds', { replace: true })
    } else {
      navigate('/pos', { replace: true })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const res = login(mobileNumber, password)
    if (res.success) {
      redirectByRole(res.user)
    } else {
      setError(res.error || 'Authentication failed.')
    }
  }

  const handleQuickDemo = (roleKey) => {
    const user = loginAs(roleKey)
    if (user) {
      redirectByRole(user)
    }
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-[#ECEEF1] p-4 select-none">
      {/* Centered Login Card */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-orange-200/80 mb-3 flex items-center justify-center bg-[#FF5C39]">
            <img
              src={pageLogo}
              alt="KitchenFlow"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight font-sans">
            Kitchen<span className="text-[#FF5C39]">Flow</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Integrated POS & Kitchen Display System
          </p>
        </div>

        {/* Quick Demo Role Switcher Bar */}
        <div className="mb-5 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block text-center mb-1.5">
            Quick One-Click Demo Logins
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('cashier')}
              className="py-2 px-1.5 bg-white hover:bg-orange-50/60 border border-zinc-200/80 hover:border-[#FF5C39] rounded-xl text-[11px] font-bold text-zinc-800 transition active:scale-[0.95] flex flex-col items-center justify-center cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#FF5C39] mb-0.5" />
              <span>Cashier</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('chef')}
              className="py-2 px-1.5 bg-white hover:bg-orange-50/60 border border-zinc-200/80 hover:border-[#FF5C39] rounded-xl text-[11px] font-bold text-zinc-800 transition active:scale-[0.95] flex flex-col items-center justify-center cursor-pointer"
            >
              <ChefHat className="w-3.5 h-3.5 text-zinc-700 mb-0.5" />
              <span>Chef</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-1.5 bg-white hover:bg-orange-50/60 border border-zinc-200/80 hover:border-[#FF5C39] rounded-xl text-[11px] font-bold text-zinc-800 transition active:scale-[0.95] flex flex-col items-center justify-center cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
              <span>Owner</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="09123456789"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-[#FF5C39] transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-[#FF5C39] transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-[#FF5C39] hover:bg-[#F04D28] text-white font-bold text-sm rounded-xl shadow-xs transition-all duration-150 active:scale-[0.96] flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-zinc-100 text-center">
          <p className="text-[11px] text-zinc-400">
            Current Demo User: <span className="font-bold text-zinc-700">{DEMO_USERS.cashier.username}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
