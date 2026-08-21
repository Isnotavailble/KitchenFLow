import React from 'react'

export default function WorkloadBadge({ tier = 'light', size = 'sm', className = '' }) {
  const normalized = (tier || 'light').toLowerCase()

  const tierStyles = {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/80',
    heavy: 'bg-purple-50 text-purple-700 border-purple-200/80'
  }

  const tierLabels = {
    light: 'Quick Prep',
    medium: 'Normal Prep',
    heavy: 'Heavy Prep'
  }

  const sizeStyles = {
    sm: 'text-[10px] font-medium px-2 py-0.5 rounded-md',
    md: 'text-xs font-bold px-2.5 py-0.5 rounded-md'
  }

  const label = tierLabels[normalized] || 'Normal Prep'

  return (
    <span
      className={`inline-flex items-center justify-center tracking-tight border shrink-0 select-none ${sizeStyles[size] || sizeStyles.sm} ${tierStyles[normalized] || tierStyles.light} ${className}`}
      title={`Kitchen Preparation Effort: ${label}`}
    >
      {label}
    </span>
  )
}
