import React from 'react'
import { CheckCircle2, X, Printer, Utensils, ShoppingBag } from 'lucide-react'
import { usePos } from '../hooks/usePos'
import WorkloadBadge from '../../kds/components/WorkloadBadge'
import { formatMMK } from '../../../utils/formatPrice'

export default function ReceiptModal() {
  const { activeReceipt, setActiveReceipt } = usePos()

  if (!activeReceipt) return null

  const isTakeaway = activeReceipt.orderType === 'takeaway'

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Capitalized Title */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center space-x-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold capitalize tracking-wide">Order Created</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveReceipt(null)}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Ticket Info with Capitalized Subtitle */}
        <div className="text-center py-5 border-b border-dashed border-zinc-200">
          <span className="text-xs text-zinc-400 font-medium capitalize block">
            Order Number
          </span>
          <span className="text-4xl font-black text-zinc-900 font-sans tracking-tight block mt-1">
            {activeReceipt.order_number}
          </span>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Waiting
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center space-x-1">
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
            {activeReceipt.workloadTier && (
              <WorkloadBadge tier={activeReceipt.workloadTier} size="md" />
            )}
          </div>
        </div>

        {/* Items Summary with Multi-Line Notes (No Background Color) */}
        <div className="py-4 space-y-2.5 max-h-48 overflow-y-auto text-xs border-b border-zinc-100">
          {activeReceipt.items.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between items-center text-zinc-700">
                <span className="font-semibold">
                  {item.qty}x {item.name}
                </span>
                <span className="font-mono text-zinc-500">
                  {formatMMK((item.price || 0) * item.qty)}
                </span>
              </div>
              {item.itemCustomization && (
                <div className="text-[11px] text-zinc-500 leading-snug break-words whitespace-normal pl-3">
                  <span className="font-semibold text-zinc-700">Note:</span>{' '}
                  <span className="break-all">{item.itemCustomization}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment & Financial Breakdown (Subtotal, Tax, Change, Total) */}
        <div className="py-3 space-y-1.5 text-xs text-zinc-600 border-b border-zinc-100">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-bold capitalize text-zinc-800">
              {activeReceipt.financials.paymentMethod === 'cash' ? 'Cash' : 'Card / Online'}
            </span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal:</span>
            <span className="font-mono text-zinc-700">{formatMMK(activeReceipt.financials.subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Tax (5%):</span>
            <span className="font-mono text-zinc-700">{formatMMK(activeReceipt.financials.tax)}</span>
          </div>
          {activeReceipt.financials.change > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Change Due:</span>
              <span className="font-mono">{formatMMK(activeReceipt.financials.change)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm text-zinc-900 pt-1.5 border-t border-zinc-100">
            <span>Total Paid:</span>
            <span className="text-[#FF5C39] font-mono">{formatMMK(activeReceipt.financials.total)}</span>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => setActiveReceipt(null)}
            className="flex-1 py-3 bg-[#FF5C39] hover:bg-[#F04D28] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.96] cursor-pointer"
          >
            Done & Next Order
          </button>
          <button
            type="button"
            onClick={() => setActiveReceipt(null)}
            className="p-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition active:scale-[0.96] cursor-pointer"
            title="Print Kitchen Slip"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
