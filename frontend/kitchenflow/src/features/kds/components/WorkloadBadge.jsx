import React from 'react'

export default function WorkloadBadge({ tier = 'light', className = '' }) {
  const normalized = (tier || 'light').toLowerCase()

  const tierStyles = {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/60',
    heavy: 'bg-purple-50 text-purple-700 border-purple-200/60'
  }

  const tierLabels = {
    light: 'Quick Prep',
    medium: 'Normal Prep',
    heavy: 'Heavy Prep'
  }

  const label = tierLabels[normalized] || 'Normal Prep'

  return (
    <span
      className={`inline-flex items-center justify-center font-medium px-2 py-0.5 rounded-md text-[10px] tracking-tight border shrink-0 select-none ${tierStyles[normalized] || tierStyles.light} ${className}`}
      title={`Kitchen Preparation Effort: ${label}`}
    >
      {label}
    </span>
  )
}
