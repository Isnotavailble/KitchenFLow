import React, { useState } from 'react'
import { QrCode, X, ArrowRight, Smartphone } from 'lucide-react'
import { usePos } from '../hooks/usePos'

export default function PreOrderLookupModal() {
  const { isPreOrderModalOpen, setIsPreOrderModalOpen, loadPreOrder } = usePos()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  if (!isPreOrderModalOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = loadPreOrder(code)
    if (!result.success) {
      setError(result.error || 'Failed to find pre-order code.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C39] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">QR Pre-Order Lookup</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsPreOrderModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div className="flex flex-col items-center justify-center py-3 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-center">
            <Smartphone className="w-8 h-8 text-zinc-400 mb-1.5" />
            <p className="text-xs font-semibold text-zinc-700">Scan Customer Mobile QR</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Enter the 6-digit code displayed on the guest's mobile pre-order screen.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 block mb-1">
              6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setError('')
                setCode(e.target.value.replace(/[^0-9]/g, ''))
              }}
              placeholder="e.g. 482910"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-center font-mono text-lg font-black tracking-widest text-zinc-900 outline-none focus:bg-white focus:border-[#FF5C39]"
              autoFocus
            />
            {error && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1 text-center">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsPreOrderModalOpen(false)}
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.length === 0}
              className="flex-1 py-2.5 bg-[#FF5C39] hover:bg-[#F04D28] disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Load Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
