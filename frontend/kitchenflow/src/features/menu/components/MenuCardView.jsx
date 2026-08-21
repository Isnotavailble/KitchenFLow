import React, { useState } from 'react'
import { Edit2, Trash2, ImageOff, UtensilsCrossed, Loader2 } from 'lucide-react'
import WorkloadBadge from '../../kds/components/WorkloadBadge'

function CardThumbnail({ item }) {
  const [hasError, setHasError] = useState(false)
  const isUnavailable = item.isAvailable === false
  const imgSrc = item.imageUrl || item.image

  if (!imgSrc || hasError) {
    return (
      <div className="relative h-36 w-full bg-zinc-100/90 border-b border-zinc-100 flex flex-col items-center justify-center text-zinc-400 select-none overflow-hidden shrink-0">
        <div className={`w-10 h-10 rounded-full bg-zinc-200/60 flex items-center justify-center mb-1 ${isUnavailable ? 'filter blur-[1px]' : ''}`}>
          <ImageOff className="w-5 h-5 text-zinc-400" />
        </div>
        <span className={`text-[10px] font-semibold text-zinc-400 ${isUnavailable ? 'filter blur-[1px]' : ''}`}>
          No Photo
        </span>

        {/* Unavailable Label Overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-white text-zinc-800 font-bold text-[11px] rounded-xl shadow-xs border border-zinc-200/90 tracking-wide">
              Unavailable
            </span>
          </div>
        )}

        <div className="absolute top-2.5 right-2.5">
          <WorkloadBadge tier={item.workloadTier} size="sm" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-36 w-full overflow-hidden bg-zinc-100 shrink-0 border-b border-zinc-100">
      <img
        src={imgSrc}
        alt={item.name}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isUnavailable ? 'filter blur-[2.5px] opacity-75' : ''
        }`}
        loading="lazy"
        onError={() => setHasError(true)}
      />

      {/* Blurred Unavailable Label Overlay (Matching POS) */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1.5px] flex items-center justify-center">
          <span className="px-3 py-1 bg-white text-zinc-800 font-bold text-[11px] rounded-xl shadow-sm border border-zinc-200/90 tracking-wide">
            Unavailable
          </span>
        </div>
      )}

      <div className="absolute top-2.5 right-2.5">
        <WorkloadBadge tier={item.workloadTier} size="sm" />
      </div>
    </div>
  )
}

export default function MenuCardView({
  items,
  togglingIds,
  deletingIds,
  onToggleAvailability,
  onEdit,
  onDelete
}) {
  if (items.length === 0) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-zinc-200 flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 mb-3">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-zinc-800">No menu found</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          Try clearing your search or create a new menu.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 select-none">
      {items.map((item) => {
        const isUnavailable = item.isAvailable === false
        const isToggling = togglingIds?.has(item.id)
        const isDeleting = deletingIds?.has(item.id)

        return (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
              isUnavailable ? 'border-zinc-200/60 opacity-90' : 'border-zinc-200/80'
            }`}
          >
            {/* Full-Width Menu Image with POS-Matching Blurred Overlay */}
            <CardThumbnail item={item} />

            {/* Card Body Content */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <h3 className={`text-sm font-bold leading-snug ${isUnavailable ? 'text-zinc-500' : 'text-zinc-900'}`}>
                    {item.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold shrink-0">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Price & Full-Size Management Action Controls */}
              <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <span className={`text-base font-black font-sans ${isUnavailable ? 'text-zinc-400' : 'text-zinc-900'}`}>
                  ${item.price.toFixed(2)}
                </span>

                <div className="flex items-center space-x-1.5">
                  {/* Full-Sized Action Button with Proper Label */}
                  <button
                    type="button"
                    onClick={() => onToggleAvailability(item)}
                    disabled={isToggling || isDeleting}
                    className={`h-8 px-3 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.96] flex items-center justify-center space-x-1.5 shadow-xs ${
                      isToggling || isDeleting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      item.isAvailable
                        ? 'bg-[#FF5C39] hover:bg-[#F04D28] text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/90'
                    }`}
                    title={item.isAvailable ? 'Click to make unavailable' : 'Click to make available'}
                  >
                    {isToggling && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                    <span>{item.isAvailable ? 'Set Unavailable' : 'Set Available'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    disabled={isToggling || isDeleting}
                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 rounded-xl transition cursor-pointer border border-zinc-200/90 shadow-xs active:scale-[0.96] disabled:opacity-50"
                    title="Edit menu"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    disabled={isToggling || isDeleting}
                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-xl transition cursor-pointer border border-rose-200/80 shadow-xs active:scale-[0.96] disabled:opacity-50"
                    title="Delete menu"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
