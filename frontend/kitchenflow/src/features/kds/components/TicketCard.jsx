import { useState } from 'react'
import { Plus, ImageOff, ShoppingBag, Utensils, X, Loader2, AlertTriangle } from 'lucide-react'
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
  const { markComplete, cancelOrder, processingOrderIds, unavailableMenuItems } = useKds()
  const { user } = useAuth()
  const elapsed = useElapsedTime(ticket.created_at)
  const isCompleted = ticket.status === 'Completed'
  const isCancelled = ticket.status === 'Cancelled'
  const isTakeaway = ticket.orderType === 'takeaway'
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isProcessing = processingOrderIds?.has(ticket.id) || processingOrderIds?.has(ticket.rawId) || processingOrderIds?.has(ticket.orderNumberInt)

  const disabledItemsInTicket = (ticket.items || []).filter((item) =>
    (unavailableMenuItems || []).some(
      (u) => u.name?.toLowerCase() === item.name?.toLowerCase() || u.id === item.menuId
    )
  )

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

          <div className="text-right pt-0.5">
            <span className={`text-[11px] font-medium block transition-colors duration-300 ${isCompleted ? 'text-zinc-400' : (elapsed?.colorClass || 'text-zinc-400')}`}>
              {elapsed?.formatted || 'Just now'}
            </span>
          </div>
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

        {/* In-Card Warning for 86'd / Disabled Items */}
        {!isCompleted && !isCancelled && disabledItemsInTicket.length > 0 && (
          <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center space-x-1.5 text-amber-800 text-[11px] font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Unavailable order contain!</span>
          </div>
        )}
      </div>

      {/* 2. Scrollable Order Items List */}
      <div className="flex-1 min-h-0 py-3.5 pr-1.5 space-y-3.5 overflow-y-auto">
        {ticket.items.map((item, idx) => {
          const isItemUnavailable =
            !isCompleted &&
            !isCancelled &&
            (unavailableMenuItems || []).some(
              (u) =>
                u.name?.toLowerCase() === item.name?.toLowerCase() ||
                u.id === item.menuId
            )

          return (
            <div key={idx} className="flex items-start space-x-3 text-xs">
              {/* Thumbnail Image or Empty State Icon Placeholder */}
              <ItemThumbnail image={item.image} name={item.name} />

              {/* Title & Customization Note */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="font-bold text-zinc-900 text-xs sm:text-sm leading-snug">
                    {item.qty}x {item.name}
                  </span>
                  {isItemUnavailable && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold shrink-0">
                      Unavailable
                    </span>
                  )}
                </div>
                {item.itemNote && (
                  <div className="mt-1 inline-block bg-white border border-zinc-200/90 text-zinc-800 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-2xs">
                    <span className="font-bold text-[#FF5C39]">Note:</span> {item.itemNote}
                  </div>
                )}

              </div>


            </div>
          )
        })}
      </div>


      {/* 3. Fixed Card Footer */}
      <div className="pt-2 shrink-0">
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
