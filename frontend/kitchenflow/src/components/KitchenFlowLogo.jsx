import React from 'react'
import { ChefHat } from 'lucide-react'

/**
 * Standard Vector KitchenFlow Brand Logo
 * Guarantees crisp, symmetric 4-corner rounded rendering with zero raster clipping.
 */
export default function KitchenFlowLogo({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl'
  }
  const iconSizes = {
    sm: 'w-4.5 h-4.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  }

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} bg-[#FF5C39] border border-orange-300/40 shadow-2xs shrink-0 flex items-center justify-center text-white select-none ${className}`}
    >
      <ChefHat className={`${iconSizes[size] || iconSizes.md} text-white`} />
    </div>
  )
}
