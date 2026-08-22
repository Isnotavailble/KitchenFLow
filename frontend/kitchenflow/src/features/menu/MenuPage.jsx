import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2, UtensilsCrossed, Plus, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Tag } from 'lucide-react'

import { menuApi } from './api/menuApi'
import { categoryApi } from '../category/api/categoryApi'
import { imageApi } from './api/imageApi'
import { useToast } from '../../hooks/useToast'
import { AdminPageHeader } from '../admin'

import MenuToolbar from './components/MenuToolbar'
import MenuCardView from './components/MenuCardView'
import MenuTableView from './components/MenuTableView'
import MenuFormView from './components/MenuFormView'
import DeleteMenuModal from './components/DeleteMenuModal'
import CategoryManagerModal from '../category/components/CategoryManagerModal'

export default function MenuPage() {
  const { addToast } = useToast()

  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryList, setCategoryList] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [viewMode, setViewMode] = useState('list') // 'list' | 'create' | 'edit'
  const [layoutMode, setLayoutMode] = useState('grid') // 'grid' | 'table'
  const [editingItem, setEditingItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [togglingIds, setTogglingIds] = useState(new Set())
  const [deletingIds, setDeletingIds] = useState(new Set())



  // Form state
  const [formName, setFormName] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategory, setFormCategory] = useState('Burgers')
  const [formTier, setFormTier] = useState('2')
  const [formDesc, setFormDesc] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formImageId, setFormImageId] = useState('')
  const [formIsAvailable, setFormIsAvailable] = useState(true)

  // Fetch categories from DB
  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getAllCategories()
      if (Array.isArray(data)) {
        setCategoryList(data)
        setCategories(['All', ...data.map((c) => c.name || c)])
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }, [])

  // Load menu items with pagination and filters
  const fetchMenu = useCallback(async (targetPage = 0, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const res = await menuApi.getAllMenu({
        category: selectedCategory,
        search: searchQuery,
        page: targetPage,
        size: 20
      })
      const rawList = Array.isArray(res) ? res : (res?.items || [])
      const mapped = rawList.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.categoryName || item.category || 'General',
        categoryId: item.categoryId || null,
        isCategoryDeleted: item.isCategoryDeleted ?? false,
        price: item.price || 0,
        workloadTier: item.workloadTier === 1 ? 'light' : item.workloadTier === 3 ? 'heavy' : 'medium',
        prepPoints: item.workloadTier === 1 ? 1 : item.workloadTier === 3 ? 10 : 4,
        desc: item.desc || '',
        image: item.imageUrl || null,
        imageUrl: item.imageUrl || null,
        imageId: item.imageId || null,
        isAvailable: item.isAvailable ?? true
      }))


      setMenuItems(mapped)
      setTotalCount(res?.totalCount ?? mapped.length)
      setTotalPages(res?.totalPages ?? 1)
      setHasMore(res?.hasMore ?? false)
      setPage(res?.page ?? targetPage)
    } catch (err) {
      console.error('Failed to load menu:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery])


  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchMenu(0)
  }, [selectedCategory, searchQuery])

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormName('')
    setFormPrice('')
    setFormCategory(categoryList[0]?.name || 'Burgers')
    setFormTier('2')
    setFormDesc('')
    setFormImageUrl('')
    setFormImageId('')
    setFormIsAvailable(true)
    setViewMode('create')
  }

  // Open Edit Form
  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormPrice(item.price.toString())
    setFormCategory(item.category)
    setFormTier(
      item.workloadTier === 'light' ? '1' : item.workloadTier === 'heavy' ? '3' : '2'
    )
    setFormDesc(item.desc || '')
    setFormImageUrl(item.imageUrl || item.image || '')
    setFormImageId(item.imageId || '')
    setFormIsAvailable(item.isAvailable ?? true)
    setViewMode('edit')
  }

  // Upload file to Cloudinary
  const handleFileUpload = async (eOrFile) => {
    const file = eOrFile?.target?.files ? eOrFile.target.files[0] : eOrFile
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const result = await imageApi.uploadImage(file)
      if (result && (result.imageUrl || result.secure_url)) {
        setFormImageUrl(result.imageUrl || result.secure_url)
        setFormImageId(result.imageId || result.public_id || '')
        addToast('Photo uploaded to Cloudinary!', 'success')
      }
    } catch (err) {
      console.error('Image upload error:', err)
      addToast(err?.message || 'Failed to upload photo', 'warning')
    } finally {
      setIsUploadingPhoto(false)
    }
  }


  // Handle Form Submit (No optimistic update - wait for real API response)
  const handleSubmitForm = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (e?.stopPropagation) e.stopPropagation()

    if (!formName.trim() || !formPrice) {
      addToast('Please provide menu name and price', 'warning')
      return
    }

    setIsSubmitting(true)
    try {
      const priceValue = parseInt(formPrice, 10) || 0
      const matchedCat = categoryList.find(
        (c) => c.name?.toLowerCase() === formCategory?.toLowerCase() || c.id === formCategory || String(c.id) === String(formCategory)
      )
      const payload = {
        name: formName.trim(),
        price: priceValue,
        categoryId: matchedCat?.id || null,
        workloadTier: parseInt(formTier, 10),
        desc: formDesc.trim(),
        imageUrl: formImageUrl.trim() || null,
        imageId: formImageId.trim() || null,
        isAvailable: formIsAvailable
      }


      if (editingItem) {
        await Promise.all([
          menuApi.updateMenu(editingItem.id, payload),
          new Promise((resolve) => setTimeout(resolve, 600))
        ])
        addToast(`Menu "${payload.name}" updated successfully`, 'success')
      } else {
        await Promise.all([
          menuApi.createMenu(payload),
          new Promise((resolve) => setTimeout(resolve, 600))
        ])
        addToast(`Menu "${payload.name}" created successfully`, 'success')
      }

      await fetchMenu(page)
      setViewMode('list')
    } catch (err) {
      console.error('Save menu error:', err)
      addToast(err?.response?.data?.error || err?.message || 'Failed to save menu item', 'warning')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1-Click Availability Toggle (Strict: NO optimistic update, 600ms tactile spinner delay)

  const handleToggleAvailability = async (item) => {
    if (togglingIds.has(item.id)) return // Prevent duplicate requests
    const newValue = !item.isAvailable

    if (newValue && item.isCategoryDeleted) {
      addToast(`Cannot enable "${item.name}" because its category is disabled`, 'warning')
      return
    }

    setTogglingIds((prev) => new Set(prev).add(item.id))
    try {
      const [updatedResponse] = await Promise.all([
        menuApi.toggleAvailability(item.id, newValue),
        new Promise((resolve) => setTimeout(resolve, 600))
      ])
      // Only apply state change after server confirms 200 OK
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: updatedResponse?.isAvailable ?? newValue } : i))
      )
      addToast(`"${item.name}" is now ${newValue ? 'Available' : 'Unavailable'}`, 'info')
    } catch (err) {
      console.error('Availability toggle error:', err)
      addToast(err?.response?.data?.message || err?.message || 'Failed to toggle availability on server', 'warning')
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }


  // Delete Menu Item Trigger (Opens custom DeleteMenuModal)
  const handleDeleteDish = (item) => {
    if (deletingIds.has(item.id)) return
    setItemToDelete(item)
  }

  // Confirm Delete Action from custom modal
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const item = itemToDelete
    setDeletingIds((prev) => new Set(prev).add(item.id))
    try {
      await Promise.all([
        menuApi.deleteMenu(item.id),
        new Promise((resolve) => setTimeout(resolve, 600))
      ])
      // Only remove after server confirms deletion
      setMenuItems((prev) => prev.filter((i) => i.id !== item.id))
      addToast(`Deleted "${item.name}"`, 'info')
      setItemToDelete(null)
    } catch (err) {
      console.error('Delete menu error:', err)
      addToast('Failed to delete menu item', 'warning')
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }


  return (
    <div className="w-full h-full overflow-y-auto bg-[#ECEEF1] font-sans select-none flex flex-col min-h-0">
      {/* 1. Standard Management Page Header */}
      <AdminPageHeader title="Menu Catalog">
        {/* View Switcher (Grid vs Table) */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-0.5 flex items-center shadow-2xs">
          <button
            type="button"
            onClick={() => setLayoutMode('grid')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              layoutMode === 'grid'
                ? 'bg-zinc-100 text-zinc-900 font-bold'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('table')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              layoutMode === 'table'
                ? 'bg-zinc-100 text-zinc-900 font-bold'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Table View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Manage Categories Button */}
        <button
          type="button"
          onClick={() => setIsCategoryManagerOpen(true)}
          className="h-8 px-3.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-700 hover:text-zinc-900 text-xs font-bold rounded-xl shadow-2xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer"
          title="Manage Menu Categories"
        >
          <Tag className="w-3.5 h-3.5 text-[#FF5C39]" />
          <span>Categories</span>
        </button>


        {/* Create New Menu Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="h-8 px-3.5 bg-[#FF5C39] hover:bg-[#F04D28] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Menu</span>
        </button>
      </AdminPageHeader>


      {/* 2. Main Page Area (Always Rendered Catalog) */}
      <div className="p-5 sm:p-6 w-full max-w-7xl mx-auto space-y-4 pb-20 flex-1">
        {/* Toolbar: Categories & Search */}
        <MenuToolbar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content List: Cards or Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#FF5C39] animate-spin" />
            <span className="text-xs font-semibold text-zinc-500">
              Loading menu catalog...
            </span>
          </div>
        ) : layoutMode === 'grid' ? (
          <MenuCardView
            items={menuItems}
            togglingIds={togglingIds}
            deletingIds={deletingIds}
            onToggleAvailability={handleToggleAvailability}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteDish}
          />
        ) : (
          <MenuTableView
            items={menuItems}
            togglingIds={togglingIds}
            deletingIds={deletingIds}
            onToggleAvailability={handleToggleAvailability}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteDish}
          />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 flex items-center justify-between border-t border-zinc-200/80 select-none">
            <span className="text-xs font-medium text-zinc-500">
              Showing page <strong className="text-zinc-800">{page + 1}</strong> of <strong className="text-zinc-800">{totalPages}</strong> ({totalCount} items)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => fetchMenu(page - 1)}
                className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-2xs transition active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                disabled={!hasMore || page >= totalPages - 1 || loading}
                onClick={() => fetchMenu(page + 1)}
                className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-2xs transition active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Floating Create / Edit Menu Modal */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <MenuFormView
          isEdit={viewMode === 'edit'}
          editingItem={editingItem}
          formName={formName}
          setFormName={setFormName}
          formPrice={formPrice}
          setFormPrice={setFormPrice}
          formCategory={formCategory}
          setFormCategory={setFormCategory}
          categories={categories}
          categoryList={categoryList}
          formTier={formTier}

          setFormTier={setFormTier}
          formImageUrl={formImageUrl}
          setFormImageUrl={setFormImageUrl}
          formImageId={formImageId}
          setFormImageId={setFormImageId}
          formIsAvailable={formIsAvailable}
          setFormIsAvailable={setFormIsAvailable}
          isUploadingPhoto={isUploadingPhoto}
          isSubmitting={isSubmitting}
          onPhotoSelect={handleFileUpload}
          onSubmit={handleSubmitForm}
          onCancel={() => setViewMode('list')}
        />
      )}

      {/* 4. Custom Delete Menu Item Confirmation Modal */}
      <DeleteMenuModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ''}
        isDeleting={itemToDelete ? deletingIds.has(itemToDelete.id) : false}
      />

      {/* 5. Floating Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoriesUpdated={() => {
          fetchCategories()
          fetchMenu(page, false)
        }}
      />

    </div>
  )
}



