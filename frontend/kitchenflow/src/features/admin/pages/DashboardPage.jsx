import { LayoutDashboard, Calendar, RefreshCw } from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 1. Page Header */}
      <AdminPageHeader title="Dashboard">
        <button
          type="button"
          className="h-8 px-3 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-2xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#FF5C39]" />
          <span>Today</span>
        </button>
        <button
          type="button"
          className="h-8 w-8 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-zinc-700 shadow-2xs transition active:scale-[0.96] flex items-center justify-center cursor-pointer"
          title="Refresh metrics"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </AdminPageHeader>

      {/* 2. Main Body Workspace */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-4 flex-1">
        <div className="py-24 bg-white rounded-2xl border border-zinc-200/80 flex flex-col items-center justify-center text-center px-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C39] mb-3">
            <LayoutDashboard className="w-6 h-6 text-[#FF5C39]" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">Executive Dashboard Module</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Live kitchen analytics, sales metrics, and top-selling menu items will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
