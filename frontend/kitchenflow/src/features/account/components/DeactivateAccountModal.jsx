import React from 'react'
import { AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react'

export default function DeactivateAccountModal({ isOpen, onClose, onConfirm, account, isSubmitting }) {
  if (!isOpen || !account) return null

  const isDeactivating = !account.isDeleted

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDeactivating ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isDeactivating ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-bold text-zinc-900">
              {isDeactivating ? 'Deactivate Account' : 'Reactivate Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 text-xs text-zinc-600 space-y-2">
          {isDeactivating ? (
            <>
              <p>
                Are you sure you want to deactivate <span className="font-bold text-zinc-900">{account.name}</span> ({account.mobileNumber})?
              </p>
              <p className="text-zinc-400">
                This will immediately revoke their access and terminate all active sessions on POS/KDS stations.
              </p>
            </>
          ) : (
            <>
              <p>
                Reactivate login access for <span className="font-bold text-zinc-900">{account.name}</span> ({account.mobileNumber})?
              </p>
              <p className="text-zinc-400">
                The staff member will be able to log in again using their existing credentials.
              </p>
            </>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(account.id, isDeactivating)}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 ${
              isDeactivating ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
            <span>{isDeactivating ? 'Deactivate Staff' : 'Reactivate Staff'}</span>
          </button>

        </div>
      </div>
    </div>
  )
}
