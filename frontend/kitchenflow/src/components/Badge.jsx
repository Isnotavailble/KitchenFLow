import React from 'react'

export default function Badge({ children, status = 'default', className = '' }) {
  const baseStyles = 'inline-flex items-center justify-center font-medium px-2 py-0.5 rounded-md text-[11px] tracking-tight shrink-0 select-none'

  const statusStyles = {
    Completed: 'bg-[#D1FAE5] text-[#065F46]',
    Waiting: 'bg-[#FFEDD5] text-[#C2410C]',
    Priority: 'bg-[#FEE2E2] text-[#991B1B]',
    Cancelled: 'bg-zinc-200 text-zinc-700',
    default: 'bg-zinc-100 text-zinc-700'
  }

  const selectedStyle = statusStyles[status] || statusStyles.default

  return (
    <span className={`${baseStyles} ${selectedStyle} ${className}`}>
      {children || status}
    </span>
  )
}
