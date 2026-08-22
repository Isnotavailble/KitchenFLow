import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  Plus,
  Edit2,
  Check,
  Trash2,
  Loader2,
  Tag,
  AlertCircle
} from 'lucide-react'

import { categoryApi } from '../api/categoryApi'
import { useToast } from '../../../hooks/useToast'
import HardDeleteCategoryModal from './HardDeleteCategoryModal'

export default function CategoryManagerModal({ isOpen, onClose, onCategoriesUpdated }) {
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Add Category form
  const [newCatName, setNewCatName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Inline Rename
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)

  // Toggling state
  const [togglingIds, setTogglingIds] = useState(new Set())

  // Hard Delete Modal
  const [catToDelete, setCatToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchAdminCategories = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const data = await categoryApi.getAllCategoriesAdmin()
      if (Array.isArray(data)) {
        setCategories(data)
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
      addToast(err?.message || 'Failed to load categories', 'warning')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    if (isOpen) {
      fetchAdminCategories(true)
    }
  }, [isOpen, fetchAdminCategories])

  if (!isOpen) return null

  // 1. Create Category
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    setIsAdding(true)
    try {
      const name = newCatName.trim()
      const created = await categoryApi.createCategory({ name })
      setNewCatName('')
      addToast(`Category "${name}" created!`, 'success')
      // Immediate local state update for instant UI feedback
      if (created) {
        setCategories((prev) => [...prev, created])
      }
      fetchAdminCategories(false)
      onCategoriesUpdated?.()
    } catch (err) {
      console.error('Create category error:', err)
      addToast(err?.message || 'Failed to create category', 'warning')
    } finally {
      setIsAdding(false)
    }
  }

  // 2. Start Rename
  const handleStartRename = (cat) => {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  // 3. Save Rename
  const handleSaveRename = async (catId) => {
    if (!editingName.trim()) return

    setIsRenaming(true)
    try {
      const updated = await categoryApi.updateCategory(catId, { name: editingName.trim() })
      setEditingId(null)
      addToast('Category renamed successfully!', 'success')
      // Immediate local state update
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, name: editingName.trim() } : c))
      )
      fetchAdminCategories(false)
      onCategoriesUpdated?.()
    } catch (err) {
      console.error('Rename category error:', err)
      addToast(err?.message || 'Failed to rename category', 'warning')
    } finally {
      setIsRenaming(false)
    }
  }

  // 4. Toggle Soft Delete (is_deleted)
  const handleToggleSoftDelete = async (cat) => {
    if (togglingIds.has(cat.id)) return
    const newDeletedState = !cat.isDeleted

    setTogglingIds((prev) => new Set(prev).add(cat.id))
    try {
      await categoryApi.toggleCategory(cat.id, newDeletedState)
      addToast(
        newDeletedState
          ? `"${cat.name}" disabled. All its dishes are now unavailable.`
          : `"${cat.name}" is now active.`,
        'info'
      )
      // Immediate local state update
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isDeleted: newDeletedState } : c))
      )
      fetchAdminCategories(false)
      onCategoriesUpdated?.()
    } catch (err) {
      console.error('Toggle category error:', err)
      addToast(err?.message || 'Failed to toggle category state', 'warning')
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(cat.id)
        return next
      })
    }
  }

  // 5. Confirm Hard Delete
  const handleConfirmHardDelete = async ({ targetCategoryId, deleteChildItems }) => {
    if (!catToDelete) return

    setIsDeleting(true)
    const deletedCatId = catToDelete.id
    const deletedCatName = catToDelete.name
    try {
      await categoryApi.deleteCategory(deletedCatId, { targetCategoryId, deleteChildItems })
      addToast(`Category "${deletedCatName}" permanently deleted!`, 'info')
      setCatToDelete(null)
      // Immediate local removal
      setCategories((prev) => prev.filter((c) => c.id !== deletedCatId))
      fetchAdminCategories(false)
      onCategoriesUpdated?.()
    } catch (err) {
      console.error('Hard delete category error:', err)
      addToast(err?.message || 'Failed to delete category', 'warning')
    } finally {
      setIsDeleting(false)
    }
  }


  return (

    <>
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex min-h-full items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Card */}
        <div className="relative w-full max-w-2xl bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 my-auto select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C39] shadow-2xs">
                <Tag className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                  Category Management
                </h3>
                <span className="text-xs text-zinc-400 font-medium block">
                  Create, rename, soft-delete (disable), or delete categories.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add Bar */}
          <form onSubmit={handleAddCategory} className="flex items-center space-x-2.5 mb-5">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Enter new category name (e.g. Desserts, Beverages)..."
              className="flex-1 px-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-[#FF5C39] outline-none font-medium text-zinc-900 shadow-2xs transition"
            />
            <button
              type="submit"
              disabled={isAdding || !newCatName.trim()}
              className="px-4 py-2 bg-[#FF5C39] hover:bg-[#F04D28] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add Category</span>
            </button>
          </form>

          {/* Categories List */}
          <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="px-4 py-2.5 bg-zinc-50/90 border-b border-zinc-200/70 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>Category Name & Dishes</span>
              <span>Status & Actions</span>
            </div>

            <div className="divide-y divide-zinc-100 max-h-[380px] overflow-y-auto">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-zinc-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF5C39]" />
                  <span>Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  No categories found. Add your first category above!
                </div>
              ) : (
                categories.map((cat) => {
                  const isEditing = editingId === cat.id
                  const isToggling = togglingIds.has(cat.id)

                  return (
                    <div
                      key={cat.id}
                      className={`px-4 py-3 flex items-center justify-between transition ${
                        cat.isDeleted ? 'bg-zinc-50/60 opacity-60' : 'hover:bg-zinc-50/40'
                      }`}
                    >

                      {/* Left: Name and Count */}
                      <div className="flex-1 min-w-0 pr-3">
                        {isEditing ? (
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              autoFocus
                              className="px-3 py-1 text-xs bg-white border border-[#FF5C39] rounded-lg outline-none font-bold text-zinc-900 w-48 shadow-2xs"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(cat.id)
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                            />
                            <button
                              type="button"
                              disabled={isRenaming}
                              onClick={() => handleSaveRename(cat.id)}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition cursor-pointer shadow-2xs"
                              title="Save Name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2.5">
                            <span className="font-bold text-xs sm:text-sm text-zinc-900 tracking-tight">
                              {cat.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                              {cat.itemCount || 0} dishes
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartRename(cat)}
                              className="p-1 rounded-md text-zinc-300 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                              title="Rename Category"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Soft Delete Switch & Hard Delete Button */}
                      <div className="flex items-center space-x-4 shrink-0">
                        {/* Soft Delete Switch */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-medium text-zinc-500 hidden sm:inline">
                            {cat.isDeleted ? 'Inactive' : 'Active'}
                          </span>
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleSoftDelete(cat)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer disabled:opacity-50 ${
                              !cat.isDeleted ? 'bg-emerald-500' : 'bg-zinc-300'
                            }`}
                            title={cat.isDeleted ? 'Enable Category' : 'Disable Category (Soft Delete)'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                                !cat.isDeleted ? 'translate-x-4.5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Hard Delete Button */}
                        <button
                          type="button"
                          onClick={() => setCatToDelete(cat)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Permanently Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 flex items-start space-x-2 text-[11px] text-zinc-400 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              <strong>Soft delete</strong> toggles a category to Inactive and automatically disables all its menu dishes on POS/KDS. <strong>Hard delete</strong> permanently removes the category and prompts you to reassign dishes.
            </span>
          </div>
        </div>
      </div>

      {/* Hard Delete Confirmation Modal */}
      <HardDeleteCategoryModal
        isOpen={Boolean(catToDelete)}
        onClose={() => setCatToDelete(null)}
        onConfirm={handleConfirmHardDelete}
        category={catToDelete}
        otherCategories={categories}
        isDeleting={isDeleting}
      />
    </>
  )
}
