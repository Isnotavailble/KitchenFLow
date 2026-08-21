import React from 'react'
import { CheckCircle2, AlertCircle, Info, Bell, X } from 'lucide-react'

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
      case 'new_order':
        return <Bell className="w-4 h-4 text-zinc-950 dark:text-white shrink-0 animate-bounce" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-zinc-800 dark:text-zinc-200 shrink-0" />
      default:
        return <Info className="w-4 h-4 text-zinc-600 dark:text-zinc-300 shrink-0" />
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs font-semibold tracking-tight transition-all duration-200"
        >
          <div className="flex items-center space-x-2.5">
            {getIcon(t.type)}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-3 p-1 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
