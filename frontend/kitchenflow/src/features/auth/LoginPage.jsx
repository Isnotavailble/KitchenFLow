import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Phone, ArrowRight, Eye, EyeOff, ShieldCheck, ChefHat, Store, Loader2 } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import pageLogo from '../../assets/page_logo.png'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Clean empty inputs by default (no hardcoded credentials)
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!mobileNumber.trim() || !password) {
      setError('Please enter your mobile number and password.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const res = await login(mobileNumber.trim(), password)
      if (res && res.success) {
        redirectByRole(res.user)
      } else {
        setError(res?.error || 'Authentication failed. Please verify your credentials.')
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please check network connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (mobile, pass) => {
    setMobileNumber(mobile)
    setPassword(pass)
    setError('')
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

        {/* Quick Fill Role Helper */}
        <div className="mb-5 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block text-center mb-1.5">
            Quick Fill Test Accounts
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('09111111111', 'Cashier123#')}
              className={`py-2 px-1.5 border rounded-xl text-[11px] font-bold transition active:scale-[0.95] flex flex-col items-center justify-center cursor-pointer ${
                mobileNumber === '09111111111'
                  ? 'bg-orange-50/80 border-[#FF5C39] text-zinc-900 shadow-2xs'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200/80 text-zinc-700'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#FF5C39] mb-0.5" />
              <span>Cashier</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('09333333333', 'Chef123#')}
              className={`py-2 px-1.5 border rounded-xl text-[11px] font-bold transition active:scale-[0.95] flex flex-col items-center justify-center cursor-pointer ${
                mobileNumber === '09333333333'
                  ? 'bg-orange-50/80 border-[#FF5C39] text-zinc-900 shadow-2xs'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200/80 text-zinc-700'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-zinc-700 mb-0.5" />
              <span>Chef</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('09123456789', 'Kk722005#')}
              className={`py-2 px-1.5 border rounded-xl text-[11px] font-bold transition active:scale-[0.95] flex flex-col items-center justify-center cursor-pointer ${
                mobileNumber === '09123456789'
                  ? 'bg-orange-50/80 border-[#FF5C39] text-zinc-900 shadow-2xs'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200/80 text-zinc-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
              <span>Owner</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile Number Field */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-zinc-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number (e.g. 09123456789)"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:border-[#FF5C39] outline-none transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:border-[#FF5C39] outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#FF5C39] hover:bg-[#F04D28] text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-[0.97] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Station</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
