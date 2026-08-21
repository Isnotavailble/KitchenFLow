import React from 'react'
import { Search, ArrowUpDown, Filter } from 'lucide-react'
import { useKds } from '../hooks/useKds'

export default function KdsToolbar() {
  const {
    workloadFilter,
    setWorkloadFilter,
    searchQuery,
    setSearchQuery,
    sortAscending,
    setSortAscending
  } = useKds()

  const filterOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Light', value: 'LIGHT' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Heavy', value: 'HEAVY' }
  ]

  return (
    <div className="bg-zinc-100/70 dark:bg-zinc-950 px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
      {/* Workload Filter Pills */}
      <div className="flex items-center space-x-1.5">
        <Filter className="w-3.5 h-3.5 text-zinc-400 mr-1" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mr-1">Filter:</span>
        <div className="flex items-center bg-zinc-200 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-300 dark:border-zinc-800">
          {filterOptions.map((opt) => {
            const isActive = workloadFilter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setWorkloadFilter(opt.value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Input & Sort Order Switcher */}
      <div className="flex items-center space-x-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search #order, table, notes..."
            className="w-48 md:w-64 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:border-zinc-500 transition shadow-xs"
          />
        </div>

        {/* Sort Order */}
        <button
          onClick={() => setSortAscending(prev => !prev)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          title="Toggle Chronological Sorting"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{sortAscending ? 'Oldest First' : 'Newest First'}</span>
        </button>
      </div>
    </div>
  )
}
