import React from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import { formatTimeOnly } from '../utils/timeFormatter'
import { calculateOrderComplexity } from '../utils/complexity'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'

export default function HistoryTable() {
  const { completedTickets, restoreOrder, clearHistory } = useKds()

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs select-none">
      {/* Table Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            Completed Orders Shift Log
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tickets bumped from this session. Click &quot;Restore&quot; to return an order to the active queue.
          </p>
        </div>

        {completedTickets.length > 0 && (
          <Button
            onClick={clearHistory}
            variant="outline"
            size="sm"
            icon={Trash2}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Table Content */}
      {completedTickets.length === 0 ? (
        <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 text-xs font-medium">
          No completed orders in shift history yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-950 uppercase font-mono text-[11px] text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3.5 pl-4">Order #</th>
                <th className="p-3.5">Created</th>
                <th className="p-3.5">Completed At</th>
                <th className="p-3.5">Total Items</th>
                <th className="p-3.5">Workload</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {completedTickets.map((ticket) => {
                const complexity = calculateOrderComplexity(ticket.items)
                const totalItems = ticket.items.reduce((acc, i) => acc + i.qty, 0)

                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="p-3.5 pl-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {ticket.order_number}
                    </td>
                    <td className="p-3.5 font-mono text-zinc-500 dark:text-zinc-400">
                      {formatTimeOnly(ticket.created_at)}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {ticket.completed_at ? formatTimeOnly(ticket.completed_at) : '--:--'}
                    </td>
                    <td className="p-3.5 font-medium text-zinc-800 dark:text-zinc-200">
                      {totalItems} items
                    </td>
                    <td className="p-3.5">
                      <Badge variant={complexity.variant} size="sm">
                        {complexity.category}
                      </Badge>
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      <Button
                        onClick={() => restoreOrder(ticket.id)}
                        variant="outline"
                        size="sm"
                        icon={RotateCcw}
                        className="text-xs"
                      >
                        Restore
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
