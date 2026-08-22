import React, { useState } from 'react'
import { Edit2, Trash2, ImageOff, UtensilsCrossed, Loader2 } from 'lucide-react'
import WorkloadBadge from '../../kds/components/WorkloadBadge'

function TableThumbnail({ item }) {
  const [hasError, setHasError] = useState(false)
  const isUnavailable = item.isAvailable === false
  const imgSrc = item.imageUrl || item.image

  if (!imgSrc || hasError) {
    return (
      <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200/70 flex items-center justify-center text-zinc-400 shrink-0">
        <ImageOff className="w-3.5 h-3.5 text-zinc-400" />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={item.name}
      className={`w-9 h-9 rounded-xl object-cover border border-zinc-100 shrink-0 transition-all ${
        isUnavailable ? 'filter blur-[1px] opacity-70' : ''
      }`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}

export default function MenuTableView({
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
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs select-none">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed min-w-[760px] text-left border-collapse">
          {/* Explicit Fixed Column Widths */}
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[144px]" />
            <col className="w-[100px]" />
          </colgroup>

          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              <th className="py-3 px-4">Menu</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Workload</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4 text-center">Status Action</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
            {items.map((item) => {
              const isUnavailable = item.isAvailable === false
              const isToggling = togglingIds?.has(item.id)
              const isDeleting = deletingIds?.has(item.id)

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-zinc-50/60 transition ${
                    isUnavailable ? 'bg-zinc-50/30' : ''
                  }`}
                >
                  {/* Photo & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <TableThumbnail item={item} />
                      <span className={`font-bold truncate ${isUnavailable ? 'text-zinc-500' : 'text-zinc-900'}`}>
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold truncate max-w-full">
                      {item.category}
                    </span>
                  </td>

                  {/* Workload */}
                  <td className="py-3.5 px-4">
                    <WorkloadBadge tier={item.workloadTier} size="sm" />
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-black font-sans text-zinc-900">
                    ${item.price.toFixed(2)}
                  </td>

                  {/* Fixed-Width 1-Click Availability Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(item)}
                      disabled={isToggling || isDeleting}
                      className={`w-[110px] h-8 mx-auto rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.96] flex items-center justify-center space-x-1.5 shadow-xs whitespace-nowrap ${
                        isToggling || isDeleting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        item.isAvailable
                          ? 'bg-[#FF5C39] hover:bg-[#F04D28] text-white'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/90'
                      }`}
                      title={item.isAvailable ? 'Click to make unavailable' : 'Click to make available'}
                    >
                      {isToggling && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                      <span className="truncate">{item.isAvailable ? 'Disable' : 'Enable'}</span>
                    </button>

                  </td>

                  {/* Fixed Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        disabled={isToggling || isDeleting}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 rounded-xl transition cursor-pointer border border-zinc-200/90 shadow-xs active:scale-[0.96] disabled:opacity-50"
                        title="Edit menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
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
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
