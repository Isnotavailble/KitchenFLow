import React, { useState } from 'react'
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'

export default function HardDeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  category,
  otherCategories = [],
  isDeleting
}) {
  const [deleteMode, setDeleteMode] = useState('reassign') // 'reassign' | 'delete_all'
  const [targetCatId, setTargetCatId] = useState('')

  if (!isOpen || !category) return null

  const itemCount = category.itemCount || 0
  const availableTargetCategories = otherCategories.filter(
    (c) => c.id !== category.id && !c.isDeleted
  )

  const handleConfirm = () => {
    if (itemCount > 0 && deleteMode === 'reassign') {
      const selectedId = targetCatId || (availableTargetCategories[0]?.id ? String(availableTargetCategories[0].id) : null)
      if (!selectedId) return
      onConfirm({ targetCategoryId: parseInt(selectedId, 10), deleteChildItems: false })
    } else if (itemCount > 0 && deleteMode === 'delete_all') {
      onConfirm({ targetCategoryId: null, deleteChildItems: true })
    } else {
      onConfirm({ targetCategoryId: null, deleteChildItems: false })
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-zinc-200/90 rounded-3xl shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3 shadow-2xs">
            {itemCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
          </div>
          <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
            Delete Category "{category.name}"?
          </h3>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
            {itemCount === 0
              ? 'This category has 0 menu dishes and will be permanently removed.'
              : `This category currently contains ${itemCount} menu dish(es). How would you like to handle them?`}
          </p>
        </div>

        {/* Options for when category has child dishes */}
        {itemCount > 0 && (
          <div className="mt-5 space-y-3">
            {/* Option 1: Reassign Dishes */}
            {availableTargetCategories.length > 0 && (
              <label className={`block p-3.5 rounded-2xl border transition cursor-pointer ${
                deleteMode === 'reassign'
                  ? 'border-[#FF5C39] bg-orange-50/20'
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'
              }`}>
                <div className="flex items-start space-x-2.5">
                  <input
                    type="radio"
                    name="deleteMode"
                    value="reassign"
                    checked={deleteMode === 'reassign'}
                    onChange={() => setDeleteMode('reassign')}
                    className="mt-0.5 accent-[#FF5C39] cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-900 block">
                      Move {itemCount} dish(es) to another category
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">
                      Dishes will be reassigned without deleting them.
                    </span>

                    {deleteMode === 'reassign' && (
                      <div className="mt-2.5">
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                          Select Destination Category:
                        </label>
                        <select
                          value={targetCatId || availableTargetCategories[0]?.id || ''}
                          onChange={(e) => setTargetCatId(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl focus:border-[#FF5C39] outline-none font-medium text-zinc-900 shadow-2xs cursor-pointer"
                        >
                          {availableTargetCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            )}

            {/* Option 2: Delete All Dishes */}
            <label className={`block p-3.5 rounded-2xl border transition cursor-pointer ${
              deleteMode === 'delete_all'
                ? 'border-rose-300 bg-rose-50/25'
                : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'
            }`}>
              <div className="flex items-start space-x-2.5">
                <input
                  type="radio"
                  name="deleteMode"
                  value="delete_all"
                  checked={deleteMode === 'delete_all'}
                  onChange={() => setDeleteMode('delete_all')}
                  className="mt-0.5 accent-rose-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-rose-700 block">
                    Delete all {itemCount} dish(es) in this category
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    Permanently deletes this category AND all its menu items.
                  </span>
                </div>
              </div>
            </label>
          </div>
        )}


        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-2.5 pt-3 border-t border-zinc-100">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-bold text-xs rounded-xl transition active:scale-[0.97] cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-[0.97] flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
