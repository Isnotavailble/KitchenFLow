import React, { useState } from 'react'
import { Plus, ImageOff, ShoppingBag, Utensils, X, Loader2 } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import { useAuth } from '../../auth/hooks/useAuth'
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
  const { markComplete, cancelOrder, processingOrderIds } = useKds()
  const { user } = useAuth()
  const elapsed = useElapsedTime(ticket.created_at)
  const isCompleted = ticket.status === 'Completed'
  const isCancelled = ticket.status === 'Cancelled'
  const isTakeaway = ticket.orderType === 'takeaway'
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isProcessing = processingOrderIds?.has(ticket.id) || processingOrderIds?.has(ticket.rawId) || processingOrderIds?.has(ticket.orderNumberInt)

  return (
    <div className={`bg-white rounded-2xl border ${isCancelled ? 'border-rose-200 bg-rose-50/10' : isCompleted ? 'border-zinc-200/60' : 'border-zinc-200/80'} shadow-xs p-4 sm:p-5 flex flex-col h-[440px] select-none hover:shadow-sm transition-shadow min-w-[280px]`}>
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

          <div className="flex flex-col items-end space-y-1">
            <span className="text-xs font-semibold text-zinc-400">
              {elapsed}
            </span>
            <WorkloadBadge tier={ticket.workloadTier} />
          </div>
        </div>

        {/* Bottom Row: Badges aligned cleanly */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100/80">
          <Badge
            variant={isTakeaway ? 'info' : 'brand'}
            size="sm"
            icon={isTakeaway ? ShoppingBag : Utensils}
          >
            {isTakeaway ? 'Takeaway' : 'Dine In'}
          </Badge>

          {isCancelled ? (
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[11px] font-bold">
              Cancelled
            </span>
          ) : isCompleted ? (
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[11px] font-bold">
              Ready
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200/50">
              In Kitchen
            </span>
          )}
        </div>
      </div>

      {/* 2. Scrollable Items Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 pr-1">
        {ticket.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start space-x-3 p-2 rounded-xl hover:bg-zinc-50/70 transition-colors"
          >
            {/* Food Thumbnail Photo with Fallback */}
            <ItemThumbnail image={item.image} name={item.name} />

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-black text-[#FF5C39] font-sans">
                  {item.qty}×
                </span>
                <span className="text-sm font-bold text-zinc-800 truncate">
                  {item.name}
                </span>
              </div>

              {/* Customization Notes */}
              {item.itemCustomization && (
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200/60 leading-tight">
                    Note: {item.itemCustomization}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Action Footer */}
      <div className="pt-3 border-t border-zinc-100 shrink-0">
        {isCancelled ? (
          <div className="py-2.5 text-center text-xs font-semibold text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
            Order Cancelled
          </div>
        ) : isCompleted ? (
          <div className="py-2.5 text-center text-xs font-semibold text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
            Completed Order
          </div>
        ) : isAdmin ? (
          /* Owner: Both Cancel and Mark Complete Actions */
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (window.confirm(`Are you sure you want to cancel order ${ticket.order_number}?`)) {
                  cancelOrder(ticket.rawId || ticket.orderNumberInt || ticket.id)
                }
              }}
              className="flex-1 py-2.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.96] flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
              title="Cancel this order (Owner authority)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => markComplete(ticket.rawId || ticket.orderNumberInt || ticket.id)}
              className="flex-[1.4] py-2.5 bg-[#FF5C39] hover:bg-[#F04D28] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.96] flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Complete</span>
                  <Plus className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Chef: Single-Touch Complete */
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => markComplete(ticket.rawId || ticket.orderNumberInt || ticket.id)}
            className="group w-full py-3 bg-[#FF5C39] hover:bg-[#F04D28] text-white font-bold text-sm rounded-xl shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-500/25 active:translate-y-0 active:scale-[0.95] flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Mark Complete</span>
                <Plus className="w-4 h-4 transition-transform duration-200 ease-out group-hover:rotate-90 group-hover:scale-110" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
