import React from 'react'
import { Trash2, X, Loader2 } from 'lucide-react'

export default function DeleteMenuModal({ isOpen, onClose, onConfirm, itemName, isDeleting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-white border border-zinc-200/90 rounded-2xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3 shadow-2xs">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 tracking-tight">
            Delete Menu Item?
          </h3>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-zinc-800">"{itemName}"</strong>? This action cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-bold text-xs rounded-xl transition active:scale-[0.97] cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-[0.97] flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
