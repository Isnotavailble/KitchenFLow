import React, { useState } from 'react'
import { Plus, ImageOff } from 'lucide-react'
import { usePos } from '../hooks/usePos'
import WorkloadBadge from '../../kds/components/WorkloadBadge'

function MenuImageThumbnail({ item }) {
  const [hasError, setHasError] = useState(false)
  const isUnavailable = item.isAvailable === false

  if (!item.image || hasError) {
    return (
      <div className="relative h-36 w-full bg-zinc-100/90 border-b border-zinc-100 flex flex-col items-center justify-center text-zinc-400 select-none overflow-hidden">
        <div className={`w-10 h-10 rounded-full bg-zinc-200/60 flex items-center justify-center mb-1 ${isUnavailable ? 'filter blur-[1px]' : ''}`}>
          <ImageOff className="w-5 h-5 text-zinc-400" />
        </div>
        <span className={`text-[10px] font-semibold text-zinc-400 ${isUnavailable ? 'filter blur-[1px]' : ''}`}>
          No Photo Available
        </span>

        {/* Not Available Label Overlay (Light Frosted Theme) */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-white text-zinc-800 font-bold text-[11px] rounded-xl shadow-xs border border-zinc-200/90 tracking-wide">
              Not Available
            </span>
          </div>
        )}

        <div className="absolute top-2.5 right-2.5">
          <WorkloadBadge tier={item.workloadTier} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-36 w-full overflow-hidden bg-zinc-100 shrink-0">
      <img
        src={item.image}
        alt={item.name}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isUnavailable ? 'filter blur-[2.5px] opacity-75' : ''
        }`}
        loading="lazy"
        onError={() => setHasError(true)}
      />

      {/* Blurred Not Available Label Overlay (Light Frosted Theme) */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1.5px] flex items-center justify-center">
          <span className="px-3 py-1 bg-white text-zinc-800 font-bold text-[11px] rounded-xl shadow-sm border border-zinc-200/90 tracking-wide">
            Not Available
          </span>
        </div>
      )}

      <div className="absolute top-2.5 right-2.5">
        <WorkloadBadge tier={item.workloadTier} />
      </div>
    </div>
  )
}

export default function MenuCardGrid() {
  const { menuItems, addToCart } = usePos()

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-6">
      {menuItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-sm font-bold text-zinc-700">No dishes found</p>
          <p className="text-xs text-zinc-500 mt-1">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const isUnavailable = item.isAvailable === false

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between select-none ${
                  isUnavailable ? 'border-zinc-200/60 opacity-90' : 'border-zinc-200/80'
                }`}
              >
                {/* Full-Width Dish Image with Light Not Available Overlay */}
                <MenuImageThumbnail item={item} />

                {/* Card Body Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-sm font-bold leading-snug ${isUnavailable ? 'text-zinc-500' : 'text-zinc-900'}`}>
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Bottom Row: Price & Dedicated Add Button */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100">
                    <span className={`text-base font-black font-sans ${isUnavailable ? 'text-zinc-400' : 'text-zinc-900'}`}>
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => !isUnavailable && addToCart(item)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 shadow-2xs ${
                        isUnavailable
                          ? 'bg-zinc-100 text-zinc-300 border border-zinc-200/70 cursor-not-allowed'
                          : 'bg-orange-50 hover:bg-[#FF5C39] text-[#FF5C39] hover:text-white border border-orange-200/80 hover:border-[#FF5C39] active:scale-[0.92] cursor-pointer'
                      }`}
                      title={isUnavailable ? `${item.name} is currently not available` : `Add ${item.name} to order`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
