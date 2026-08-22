import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Edit2,
  PowerOff,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  ChefHat,
  Receipt,
  ShieldCheck,
  UserX,
  Phone
} from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'
import { accountApi } from '../../account/api/accountApi'
import { useAuth } from '../../auth/hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import AccountFormModal from '../../account/components/AccountFormModal'
import ChangePasswordModal from '../../account/components/ChangePasswordModal'
import DeactivateAccountModal from '../../account/components/DeactivateAccountModal'

export default function AccountsPage() {
  const { user: currentUser } = useAuth()
  const { addToast } = useToast()

  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL') // 'ALL' | 'ROLE_ADMIN' | 'ROLE_CASHIER' | 'ROLE_CHEF' | 'INACTIVE'

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordTargetAccount, setPasswordTargetAccount] = useState(null)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [deactivateTargetAccount, setDeactivateTargetAccount] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all accounts from backend
  const fetchAccounts = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      const data = await accountApi.getAllAccounts()
      setAccounts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load accounts:', err)
      addToast('Failed to load staff accounts', 'warning')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchAccounts(true)
  }, [fetchAccounts])

  // Summary Metrics
  const stats = useMemo(() => {
    const total = accounts.length
    const activeCashiers = accounts.filter((a) => a.role === 'ROLE_CASHIER' && !a.isDeleted).length
    const activeChefs = accounts.filter((a) => a.role === 'ROLE_CHEF' && !a.isDeleted).length
    const activeAdmins = accounts.filter((a) => a.role === 'ROLE_ADMIN' && !a.isDeleted).length
    const inactive = accounts.filter((a) => a.isDeleted).length

    return { total, activeCashiers, activeChefs, activeAdmins, inactive }
  }, [accounts])

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      // Search match
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        a.name?.toLowerCase().includes(query) ||
        a.mobileNumber?.includes(query)

      if (!matchesSearch) return false

      // Role filter match
      if (roleFilter === 'INACTIVE') return a.isDeleted
      if (roleFilter !== 'ALL') return a.role === roleFilter && !a.isDeleted
      return true
    })
  }, [accounts, searchQuery, roleFilter])

  // Save Account (Create or Update)
  const handleSaveAccount = async (payload) => {
    setIsSubmitting(true)
    try {
      if (editingAccount) {
        const updated = await accountApi.updateAccount(editingAccount.id, payload)
        addToast(`Staff member "${payload.name}" updated successfully`, 'success')
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === editingAccount.id ? (updated || { ...acc, ...payload }) : acc))
        )
      } else {
        const created = await accountApi.createAccount(payload)
        addToast(`Staff member "${payload.name}" created successfully`, 'success')
        if (created) {
          setAccounts((prev) => [created, ...prev])
        } else {
          fetchAccounts(false)
        }
      }
      setIsFormModalOpen(false)
      setEditingAccount(null)
    } catch (err) {
      console.error('Account save error:', err)
      addToast(err?.data?.error || err?.message || 'Failed to save account', 'warning')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Change Password
  const handleChangePassword = async (id, newPassword) => {
    setIsSubmitting(true)
    try {
      await accountApi.changePassword(id, newPassword)
      addToast('Password updated successfully and active sessions revoked', 'success')
      setIsPasswordModalOpen(false)
      setPasswordTargetAccount(null)
    } catch (err) {
      console.error('Change password error:', err)
      addToast(err?.data?.error || err?.message || 'Failed to update password', 'warning')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Deactivate / Reactivate
  const handleToggleActive = async (id, isDeactivating) => {
    setIsSubmitting(true)
    try {
      let updated
      if (isDeactivating) {
        updated = await accountApi.deactivateAccount(id)
        addToast('Account deactivated successfully', 'success')
      } else {
        updated = await accountApi.reactivateAccount(id)
        addToast('Account reactivated successfully', 'success')
      }
      setIsDeactivateModalOpen(false)
      setDeactivateTargetAccount(null)
      // Smooth in-place update without full table re-render or loading spinner
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === id ? (updated || { ...acc, isDeleted: isDeactivating }) : acc))
      )
    } catch (err) {
      console.error('Toggle status error:', err)
      addToast(err?.data?.error || err?.message || 'Failed to update account status', 'warning')
    } finally {
      setIsSubmitting(false)
    }
  }


  const getRoleText = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Admin'
      case 'ROLE_CHEF':
        return 'Chef'
      case 'ROLE_CASHIER':
      default:
        return 'Cashier'
    }
  }

  // Google Account style dynamic avatar color based on initial letter
  const getAvatarColor = (name = '') => {
    const palette = [
      'bg-blue-500 text-white',
      'bg-emerald-500 text-white',
      'bg-purple-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
      'bg-indigo-500 text-white',
      'bg-teal-500 text-white',
      'bg-pink-500 text-white',
      'bg-cyan-600 text-white',
      'bg-orange-500 text-white',
      'bg-violet-500 text-white',
      'bg-red-500 text-white'
    ]
    if (!name || name.trim().length === 0) return 'bg-zinc-500 text-white'
    const charCode = name.trim().toUpperCase().charCodeAt(0)
    return palette[charCode % palette.length]
  }



  return (
    <div className="flex-1 flex flex-col min-h-0 select-none bg-[#ECEEF1]">
      {/* 1. Page Header */}
      <AdminPageHeader title="Staff & Accounts">
        <button
          type="button"
          onClick={() => {
            setEditingAccount(null)
            setIsFormModalOpen(true)
          }}
          className="h-8 px-3.5 bg-[#FF5C39] hover:bg-[#F04D28] text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff Member</span>
        </button>
      </AdminPageHeader>

      {/* 2. Main Workspace */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex flex-col space-y-4 flex-1 min-h-0 overflow-hidden">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Total Staff
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-900 font-sans block mt-0.5">
                {stats.total}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5C39] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                POS Cashiers
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 font-sans block mt-0.5">
                {stats.activeCashiers}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Kitchen Chefs
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 font-sans block mt-0.5">
                {stats.activeChefs}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Inactive Staff
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-400 font-sans block mt-0.5">
                {stats.inactive}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Toolbar: Search + Role Pills (Seamless no-box row) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Role Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {[
              { label: 'All Staff', value: 'ALL' },
              { label: 'Admins', value: 'ROLE_ADMIN' },
              { label: 'Cashiers', value: 'ROLE_CASHIER' },
              { label: 'Chefs', value: 'ROLE_CHEF' },
              { label: 'Inactive', value: 'INACTIVE' }
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRoleFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  roleFilter === tab.value
                    ? 'bg-[#FF5C39] text-white shadow-xs'
                    : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/80 shadow-2xs'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or mobile..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200/80 rounded-xl text-xs font-medium text-zinc-800 shadow-2xs focus:border-[#FF5C39] outline-none transition"
            />
          </div>
        </div>

        {/* Staff Table Container (Fixed Height + Internal Scroll) */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex-1 min-h-0 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF5C39] mb-2" />
              <span className="text-xs font-medium">Loading staff accounts...</span>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-zinc-700">No staff members found</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Try adjusting your search query or role filter.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 sticky top-0 z-10 border-b border-zinc-200/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 text-xs">
                  {filteredAccounts.map((account) => {
                    const isSelf = currentUser && (currentUser.id === account.id || currentUser.mobileNumber === account.mobileNumber)
                    const isDeactivated = account.isDeleted

                    return (
                      <tr
                        key={account.id}
                        className={`border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors ${
                          isDeactivated ? 'opacity-60 bg-zinc-50/30' : ''
                        }`}
                      >

                        {/* Member Avatar & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 select-none ${getAvatarColor(account.name)}`}>
                              {account.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">

                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-zinc-900 truncate block">
                                  {account.name}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 text-[10px] font-black">
                                    YOU
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>


                        {/* Role Pure Text */}
                        <td className="py-3 px-4 font-semibold text-zinc-700">
                          {getRoleText(account.role)}
                        </td>


                        {/* Mobile Number */}
                        <td className="py-3 px-4 font-mono font-medium text-zinc-700">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{account.mobileNumber}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          {isDeactivated ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold inline-block">
                              Inactive
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold inline-block">
                              Active
                            </span>
                          )}
                        </td>


                        {/* Action Controls */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordTargetAccount(account)
                                setIsPasswordModalOpen(true)
                              }}
                              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition active:scale-[0.96] cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Details */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAccount(account)
                                setIsFormModalOpen(true)
                              }}
                              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition active:scale-[0.96] cursor-pointer"
                              title="Edit Staff Member"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Deactivate / Reactivate Toggle */}
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => {
                                if (isSelf) return
                                setDeactivateTargetAccount(account)
                                setIsDeactivateModalOpen(true)
                              }}
                              className={`p-1.5 rounded-lg transition active:scale-[0.96] ${
                                isSelf
                                  ? 'opacity-30 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                  : isDeactivated
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 cursor-pointer'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer'
                              }`}
                              title={
                                isSelf
                                  ? 'Cannot deactivate your own admin account'
                                  : isDeactivated
                                  ? 'Reactivate Account'
                                  : 'Deactivate Account'
                              }
                            >
                              {isDeactivated ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <PowerOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AccountFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingAccount(null)
        }}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
        isSubmitting={isSubmitting}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false)
          setPasswordTargetAccount(null)
        }}
        onSave={handleChangePassword}
        account={passwordTargetAccount}
        isSubmitting={isSubmitting}
      />

      <DeactivateAccountModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false)
          setDeactivateTargetAccount(null)
        }}
        onConfirm={handleToggleActive}
        account={deactivateTargetAccount}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

