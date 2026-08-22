import React, { useRef, useEffect } from 'react'
import { X, UploadCloud, ImageOff, Check, Loader2 } from 'lucide-react'

export default function MenuFormView({
  isEdit,
  editingItem,
  formName,
  setFormName,
  formPrice,
  setFormPrice,
  formCategory,
  setFormCategory,
  categories = [],
  categoryList = [],
  formTier,

  setFormTier,
  formImageUrl,
  setFormImageUrl,
  setFormImageId,
  formIsAvailable,
  setFormIsAvailable,
  isUploadingPhoto,
  isSubmitting,
  onPhotoSelect,
  onSubmit,
  onCancel
}) {
  const fileInputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const selectableCategories = categories.filter((c) => c !== 'All')

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex min-h-full items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      {/* Floating Modal Card */}
      <div className="relative w-full max-w-2xl bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 my-auto select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
              {isEdit ? `Edit Menu: ${editingItem?.name || ''}` : 'Create Menu Item'}
            </h3>

            <span className="text-xs text-zinc-400 font-medium">
              Set menu details, category, workload points, and Cloudinary photo.
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSubmit?.(e)
          }}
          className="space-y-4"
        >
          {/* Photo Upload Area */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Menu Photo (Cloudinary Storage)
            </label>
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative">
                {formImageUrl ? (
                  <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageOff className="w-8 h-8 text-zinc-300" />
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onPhotoSelect}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-bold text-zinc-700 shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#FF5C39]" />
                    <span>{isUploadingPhoto ? 'Uploading to Cloudinary...' : 'Upload Image File'}</span>
                  </button>

                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => { setFormImageUrl(''); setFormImageId('') }}
                      className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-zinc-400 block">
                  PNG, JPG, or WEBP up to 5MB.
                </span>
              </div>
            </div>
          </div>

          {/* Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Menu Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Deluxe Smash Burger"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-[#FF5C39] outline-none font-medium text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Price (MMK) *
              </label>
              <input
                type="number"
                step="50"
                min="0"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-[#FF5C39] outline-none font-medium text-zinc-900"
              />
            </div>
          </div>


          {/* Category & Workload Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-[#FF5C39] outline-none font-medium text-zinc-900"
              >
                {selectableCategories.length > 0 ? (
                  selectableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Burgers">Burgers</option>
                    <option value="Wraps">Wraps</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Salads">Salads</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Sides">Sides</option>
                    <option value="Desserts">Desserts</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Workload Complexity Tier (KDS Points)
              </label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-[#FF5C39] outline-none font-medium text-zinc-900"
              >
                <option value="1">Light Prep (1 point) — Drinks, salads, snacks</option>
                <option value="2">Medium Prep (4 points) — Sandwiches, wraps, burgers</option>
                <option value="3">Heavy Prep (10 points) — Pizzas, complex recipes</option>
              </select>
            </div>
          </div>

          {/* Availability Switch */}
          {(() => {
            const selectedCat = categoryList.find((c) => c.name === formCategory || c.id === formCategory)
            const isCategoryInactive = selectedCat?.isDeleted ?? false

            return (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div>
                  <span className="text-xs font-bold text-zinc-800 block">
                    Available for Ordering
                  </span>
                  <span className="text-[11px] text-zinc-400 block font-medium">
                    {isCategoryInactive
                      ? 'Category is disabled. Item cannot be made available until category is active.'
                      : 'When turned off, item appears as "Unavailable" on POS'}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isCategoryInactive}
                  onClick={() => !isCategoryInactive && setFormIsAvailable(!formIsAvailable)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    isCategoryInactive
                      ? 'bg-zinc-200 cursor-not-allowed opacity-60'
                      : formIsAvailable
                      ? 'bg-emerald-500 cursor-pointer'
                      : 'bg-zinc-300 cursor-pointer'
                  }`}
                  title={isCategoryInactive ? 'Category is disabled' : ''}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      !isCategoryInactive && formIsAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )
          })()}


          {/* Actions Footer */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#FF5C39] hover:bg-[#F04D28] rounded-xl shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEdit ? 'Update Menu' : 'Create Menu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
