import React, { useState, useEffect } from 'react'
import { X, User, Phone, Lock, ShieldCheck, Loader2 } from 'lucide-react'

export default function AccountFormModal({ isOpen, onClose, onSave, editingAccount, isSubmitting }) {
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [role, setRole] = useState('ROLE_CASHIER')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name || '')
      setMobileNumber(editingAccount.mobileNumber || '')
      setRole(editingAccount.role || 'ROLE_CASHIER')
      setPassword('')
      setError('')
    } else {
      setName('')
      setMobileNumber('')
      setRole('ROLE_CASHIER')
      setPassword('')
      setError('')
    }
  }, [editingAccount, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedMobile = mobileNumber.trim()

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      setError('Name must be between 2 and 120 characters')
      return
    }

    if (!trimmedMobile) {
      setError('Mobile number is required')
      return
    }

    if (!editingAccount && (!password || password.length < 8)) {
      setError('Password must be at least 8 characters')
      return
    }

    if (editingAccount && password && password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    const payload = {
      name: trimmedName,
      mobileNumber: trimmedMobile,
      role
    }

    if (password) {
      payload.password = password
    }

    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              {editingAccount ? 'Edit Staff Account' : 'Add New Staff Member'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {editingAccount ? 'Update profile credentials and station permissions.' : 'Create station login credentials for staff.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:border-[#FF5C39] outline-none transition"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Mobile Number (Login ID) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 09123456789"
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:border-[#FF5C39] outline-none transition font-mono"
              />
            </div>
          </div>

          {/* Role Picker */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Station Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('ROLE_CASHIER')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  role === 'ROLE_CASHIER'
                    ? 'bg-orange-50 border-[#FF5C39] text-[#FF5C39] shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>Cashier</span>
                <span className="text-[10px] font-normal text-zinc-400">POS Counter</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_CHEF')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  role === 'ROLE_CHEF'
                    ? 'bg-orange-50 border-[#FF5C39] text-[#FF5C39] shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>Chef</span>
                <span className="text-[10px] font-normal text-zinc-400">Kitchen KDS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_ADMIN')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  role === 'ROLE_ADMIN'
                    ? 'bg-orange-50 border-[#FF5C39] text-[#FF5C39] shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>Admin</span>
                <span className="text-[10px] font-normal text-zinc-400">Full Access</span>
              </button>

            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {editingAccount ? 'New Password (Optional)' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required={!editingAccount}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingAccount ? 'Leave blank to keep unchanged' : 'Min 8 characters'}
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:border-[#FF5C39] outline-none transition"
              />
            </div>
            {editingAccount && (
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Changing credentials will terminate existing active sessions for this account.
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex gap-2 justify-end border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#FF5C39] hover:bg-[#F04D28] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
              <span>{editingAccount ? 'Save Changes' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
