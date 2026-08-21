import React, { useState } from 'react'
import { Plus, ImageOff, ShoppingBag, Utensils } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import { useElapsedTime } from '../hooks/useElapsedTime'
import Badge from '../../../components/Badge'
import WorkloadBadge from './WorkloadBadge'

function ItemThumbnail({ image, name }) {
  const [hasError, setHasError] = useState(false)

  if (!image || hasError) {
    return (
      <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/70 shrink-0 mt-0.5 flex items-center justify-center text-zinc-400 shadow-2xs">
        <ImageOff className="w-4 h-4 text-zinc-400" />
      </div>
    )
  }

  return (
    <img
      src={image}
      alt={name}
      className="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0 mt-0.5 border border-zinc-100 shadow-2xs transition-transform duration-200 hover:scale-105"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}

export default function TicketCard({ ticket }) {
  const { markComplete } = useKds()
  const elapsed = useElapsedTime(ticket.created_at)
  const isCompleted = ticket.status === 'Completed'
  const isTakeaway = ticket.orderType === 'takeaway'

  return (
    <div className={`bg-white rounded-2xl border ${isCompleted ? 'border-zinc-200/60' : 'border-zinc-200/80'} shadow-xs p-4 sm:p-5 flex flex-col h-[440px] select-none hover:shadow-sm transition-shadow min-w-[280px]`}>
      {/* 1. Fixed Card Header */}
      <div className="pb-3 border-b border-zinc-100 shrink-0">
        {/* Top Row: Order Number label & number on left, Subtle relative time on right */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 font-medium block">
              Order Number
            </span>
            <span className="text-2xl font-black tracking-tight text-zinc-900 font-sans block mt-0.5">
              {ticket.order_number}
            </span>
          </div>

          {!isCompleted && (
            <div className="text-right pt-0.5">
              <span className={`text-[11px] font-medium block transition-colors duration-300 ${elapsed.colorClass}`}>
                {elapsed.formatted}
              </span>
            </div>
          )}
        </div>

        {/* Badges Row: Status, Order Type (Dine-In/Takeaway), and Workload */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <Badge status={ticket.status} className="text-xs px-2 py-0.5" />
          {ticket.orderType && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center space-x-1">
              {isTakeaway ? (
                <>
                  <ShoppingBag className="w-3 h-3 text-zinc-500" />
                  <span>Takeaway</span>
                </>
              ) : (
                <>
                  <Utensils className="w-3 h-3 text-zinc-500" />
                  <span>Dine-In</span>
                </>
              )}
            </span>
          )}
          {ticket.workloadTier && (
            <WorkloadBadge tier={ticket.workloadTier} />
          )}
        </div>
      </div>

      {/* 2. Scrollable Order Items List */}
      <div className="flex-1 min-h-0 py-3.5 pr-1.5 space-y-3.5 overflow-y-auto">
        {ticket.items.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-3 text-xs">
            {/* Thumbnail Image or Empty State Icon Placeholder */}
            <ItemThumbnail image={item.image} name={item.name} />

            {/* Title, Description & Customization Note */}
            <div className="flex-1 min-w-0 pr-1">
              <span className="font-bold text-zinc-900 text-xs sm:text-sm leading-snug block">
                {item.qty}x {item.name}
              </span>
              {item.desc && (
                <p className="text-[11px] sm:text-xs text-zinc-500 leading-tight mt-0.5 font-normal">
                  {item.desc}
                </p>
              )}
              {item.itemCustomization && (
                <div className="mt-1 inline-block bg-orange-50 border border-orange-200/80 text-amber-900 px-2 py-0.5 rounded text-[11px] font-medium">
                  <span className="font-bold text-[#FF5C39]">Note:</span> {item.itemCustomization}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Fixed Card Footer */}
      <div className="pt-2 shrink-0">
        {!isCompleted ? (
          <button
            type="button"
            onClick={() => markComplete(ticket.id)}
            className="group w-full py-3 bg-[#FF5C39] hover:bg-[#F04D28] text-white font-bold text-sm rounded-xl shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-500/25 active:translate-y-0 active:scale-[0.95] flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Mark Complete</span>
            <Plus className="w-4 h-4 transition-transform duration-200 ease-out group-hover:rotate-90 group-hover:scale-110" />
          </button>
        ) : (
          <div className="py-2.5 text-center text-xs font-semibold text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
            Completed Order
          </div>
        )}
      </div>
    </div>
  )
}
