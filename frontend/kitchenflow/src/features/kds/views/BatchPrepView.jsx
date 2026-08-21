import React from 'react'
import { Layers } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import BatchPrepCard from '../components/BatchPrepCard'

export default function BatchPrepView() {
  const { consolidatedBatchItems } = useKds()

  if (consolidatedBatchItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center select-none">
        <Layers className="w-14 h-14 text-zinc-300 dark:text-zinc-700 mb-3" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          No Active Recipe Items
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
          When orders are waiting in the queue, consolidated batch prep quantities will aggregate here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Sub-header description */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Consolidated Recipe Batch Quantities
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Aggregated item totals across all open waiting tickets to expedite batch cooking.
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
          Auto-Aggregated
        </span>
      </div>

      {/* Grid of Batch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {consolidatedBatchItems.map((item, idx) => (
          <BatchPrepCard key={idx} item={item} />
        ))}
      </div>
    </div>
  )
}
