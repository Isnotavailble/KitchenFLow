import React from 'react'
import { Bell, X, CheckCircle2 } from 'lucide-react'
import { useKds } from '../../kds/hooks/useKds'
import { useElapsedTime } from '../../kds/hooks/useElapsedTime'

function NotificationItem({ order, onMarkAsRead }) {
  const elapsed = useElapsedTime(order.completed_at || order.created_at)
  const isTakeaway = order.orderType === 'takeaway'

  return (
    <div className="p-3.5 hover:bg-zinc-50/80 transition flex items-center justify-between gap-3 select-none border-b border-zinc-100 last:border-b-0">
      <div className="flex items-start space-x-2.5 min-w-0 flex-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-800 leading-snug font-medium">
            <strong className="text-zinc-900 font-bold font-sans">{order.order_number}</strong>{' '}
            <span className="text-zinc-500">({isTakeaway ? 'Takeaway' : 'Dine-In'})</span>{' '}
            has been completed.
          </p>
          <span className="text-[11px] text-zinc-400 font-normal block mt-0.5">
            {elapsed.formatted}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onMarkAsRead(order.id)}
        className="px-2.5 py-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition active:scale-[0.95] cursor-pointer shrink-0"
        title="Mark this notification as read"
      >
        Mark as read
      </button>
    </div>
  )
}

export default function ReadyPickupModal({ isOpen, onClose }) {
  const { completedPickupQueue, markHandedOver, markAllHandedOver } = useKds() || {}

  if (!isOpen) return null

  const notifications = completedPickupQueue || []

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs flex items-start justify-end p-4 sm:p-6 select-none animate-in fade-in duration-150">
      {/* Click outside to dismiss backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Floating Notifications Popover */}
      <div className="relative mt-12 w-full max-w-sm sm:max-w-md bg-white border border-zinc-200/90 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-150 z-10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-zinc-800" />
            <h2 className="text-sm font-bold text-zinc-900 leading-none">
              Notifications
            </h2>
            {notifications.length > 0 && (
              <span className="text-xs text-zinc-400 font-semibold leading-none">
                ({notifications.length})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllHandedOver}
                className="text-[11px] font-bold text-[#FF5C39] hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-zinc-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-zinc-800">No new notifications</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                All order completions have been marked as read.
              </p>
            </div>
          ) : (
            notifications.map((order) => (
              <NotificationItem
                key={order.id}
                order={order}
                onMarkAsRead={markHandedOver}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
