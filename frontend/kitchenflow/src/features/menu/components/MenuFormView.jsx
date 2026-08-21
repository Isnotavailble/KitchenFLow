import React, { useRef } from 'react'
import { ArrowLeft, UploadCloud, ImageOff, Check, Loader2 } from 'lucide-react'

export default function MenuFormView({
  isEdit,
  editingItem,
  formName,
  setFormName,
  formPrice,
  setFormPrice,
  formCategory,
  setFormCategory,
  formTier,
  setFormTier,
  formDesc,
  setFormDesc,
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

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto w-full select-none">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-600 transition cursor-pointer"
            title="Back to catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
              {isEdit ? `Edit Menu: ${editingItem?.name}` : 'Create Menu'}
            </h3>
            <span className="text-xs text-zinc-400 font-medium">
              Set menu details, workload points, and Cloudinary photo.
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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

              <input
                type="url"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="Or paste direct image URL (Unsplash or Cloudinary)..."
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-[#FF5C39] outline-none"
              />
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
              Price ($ USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="e.g. 8.50"
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
              <option value="Burgers">Burgers</option>
              <option value="Wraps">Wraps</option>
              <option value="Pizzas">Pizzas</option>
              <option value="Salads">Salads</option>
              <option value="Beverages">Beverages</option>
              <option value="Sides">Sides</option>
              <option value="Desserts">Desserts</option>
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

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            Ingredients / Description
          </label>
          <textarea
            rows={2}
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="Ingredients, seasonings, preparation details..."
            className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-[#FF5C39] outline-none font-medium text-zinc-900 resize-none"
          />
        </div>

        {/* Availability Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
          <div>
            <span className="text-xs font-bold text-zinc-800 block">
              Available for Ordering
            </span>
            <span className="text-[11px] text-zinc-400 block font-medium">
              When turned off, item appears as "Unavailable" on POS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFormIsAvailable(!formIsAvailable)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
              formIsAvailable ? 'bg-emerald-500' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                formIsAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Actions */}
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
  )
}
