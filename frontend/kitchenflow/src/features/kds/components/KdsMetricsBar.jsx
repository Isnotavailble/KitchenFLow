import React from 'react'
import { Clock, ListOrdered, AlertTriangle } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import Badge from '../../../components/Badge'

export default function KdsMetricsBar() {
  const { metrics } = useKds()

  return (
    <section className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
      {/* Counters */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <ListOrdered className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">In Queue:</span>
          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-xs">
            {metrics.totalQueue}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Avg Prep Time:</span>
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 rounded-md text-xs">
            {metrics.avgPrepTime}
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Heavy Orders:</span>
          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-xs">
            {metrics.heavyOrders}
          </span>
        </div>
      </div>

      {/* Clean Workload Legend (Formula Hidden) */}
      <div className="flex items-center space-x-2">
        <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium mr-1">
          Workload Rating:
        </span>
        <Badge variant="light" size="sm">Light</Badge>
        <Badge variant="medium" size="sm">Medium</Badge>
        <Badge variant="heavy" size="sm">Heavy</Badge>
      </div>
    </section>
  )
}
