import { Users, UserPlus } from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'

export default function AccountsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 1. Page Header */}
      <AdminPageHeader title="Staff & Accounts">
        <button
          type="button"
          className="h-8 px-3.5 bg-[#FF5C39] hover:bg-[#F04D28] text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff Member</span>
        </button>
      </AdminPageHeader>

      {/* 2. Main Body Workspace */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-4 flex-1">
        <div className="py-24 bg-white rounded-2xl border border-zinc-200/80 flex flex-col items-center justify-center text-center px-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C39] mb-3">
            <Users className="w-6 h-6 text-[#FF5C39]" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">Staff & Account Management Module</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Create, update roles, and manage PIN credentials for Cashiers and Chefs.
          </p>
        </div>
      </div>
    </div>
  )
}
