import React from 'react'
import { WORKLOAD_TIERS } from '../constants/kdsConstants'
import Badge from '../../../components/Badge'

export default function BatchPrepCard({ item }) {
  let tierVariant = 'light'
  let tierCategory = 'Light'

  if (item.tier === WORKLOAD_TIERS.MEDIUM) {
    tierVariant = 'medium'
    tierCategory = 'Medium'
  } else if (item.tier === WORKLOAD_TIERS.HEAVY) {
    tierVariant = 'heavy'
    tierCategory = 'Heavy'
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between select-none">
      <div>
        {/* Header: Item Name, Tier & Large Total Count */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
              {item.name}
            </h3>
            <div className="mt-1.5">
              <Badge variant={tierVariant} size="sm">
                {tierCategory}
              </Badge>
            </div>
          </div>

          <div className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-mono font-black text-2xl px-3.5 py-1 rounded-xl shadow-xs shrink-0">
            {item.totalQty}
          </div>
        </div>

        {/* Contributing Orders Breakdown */}
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 block mb-2">
            Active Orders Requesting:
          </span>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {item.tickets.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60"
              >
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {t.orderNumber}
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.qty}x
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[11px] truncate max-w-[130px]">
                  {t.notes || 'Standard'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
