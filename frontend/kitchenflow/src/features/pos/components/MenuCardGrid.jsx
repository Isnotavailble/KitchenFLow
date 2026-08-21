import React, { useState } from 'react'
import { Plus, ImageOff } from 'lucide-react'
import { usePos } from '../hooks/usePos'
import WorkloadBadge from '../../kds/components/WorkloadBadge'

function MenuImageThumbnail({ item }) {
  const [hasError, setHasError] = useState(false)

  if (!item.image || hasError) {
    return (
      <div className="relative h-36 w-full bg-zinc-100/90 border-b border-zinc-100 flex flex-col items-center justify-center text-zinc-400 select-none">
        <div className="w-10 h-10 rounded-full bg-zinc-200/60 flex items-center justify-center mb-1">
          <ImageOff className="w-5 h-5 text-zinc-400" />
        </div>
        <span className="text-[10px] font-semibold text-zinc-400">
          No Photo Available
        </span>
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
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setHasError(true)}
      />
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
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between select-none"
            >
              {/* Full-Width Dish Image or Empty State Fallback */}
              <MenuImageThumbnail item={item} />

              {/* Card Body Content */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Row: Price & Dedicated Add Button */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100">
                  <span className="text-base font-black text-zinc-900 font-sans">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 rounded-xl bg-orange-50 hover:bg-[#FF5C39] text-[#FF5C39] hover:text-white border border-orange-200/80 hover:border-[#FF5C39] flex items-center justify-center transition-all duration-150 shadow-2xs active:scale-[0.92] cursor-pointer"
                    title={`Add ${item.name} to order`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
