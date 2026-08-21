import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { menuApi } from './api/menuApi'
import { imageApi } from './api/imageApi'
import { useToast } from '../../hooks/useToast'
import MenuHeader from './components/MenuHeader'
import MenuToolbar from './components/MenuToolbar'
import MenuCardView from './components/MenuCardView'
import MenuTableView from './components/MenuTableView'
import MenuFormView from './components/MenuFormView'

export default function MenuPage() {
  const { addToast } = useToast()

  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'create' | 'edit'
  const [layoutMode, setLayoutMode] = useState('grid') // 'grid' | 'table'
  const [editingItem, setEditingItem] = useState(null)
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

  // Load menu items from backend API
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true)
      const data = await menuApi.getAllMenu()
      if (Array.isArray(data)) {
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.categoryName || item.category || 'General',
          price: item.price ? item.price / 100 : 0,
          workloadTier: item.workloadTier === 1 ? 'light' : item.workloadTier === 3 ? 'heavy' : 'medium',
          prepPoints: item.workloadTier === 1 ? 1 : item.workloadTier === 3 ? 10 : 4,
          desc: item.desc || '',
          image: item.imageUrl || null,
          imageUrl: item.imageUrl || null,
          imageId: item.imageId || null,
          isAvailable: item.isAvailable ?? true
        }))
        setMenuItems(mapped)
      }
    } catch (err) {
      console.error('Failed to load menu:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function initialLoad() {
      try {
        setLoading(true)
        const data = await menuApi.getAllMenu()
        if (Array.isArray(data) && isMounted) {
          const mapped = data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.categoryName || item.category || 'General',
            price: item.price ? item.price / 100 : 0,
            workloadTier: item.workloadTier === 1 ? 'light' : item.workloadTier === 3 ? 'heavy' : 'medium',
            prepPoints: item.workloadTier === 1 ? 1 : item.workloadTier === 3 ? 10 : 4,
            desc: item.desc || '',
            image: item.imageUrl || null,
            imageUrl: item.imageUrl || null,
            imageId: item.imageId || null,
            isAvailable: item.isAvailable ?? true
          }))
          setMenuItems(mapped)
        }
      } catch (err) {
        console.error('Initial menu load error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initialLoad()

    return () => {
      isMounted = false
    }
  }, [])

  // Listen for live real-time menu updates over SSE
  useEffect(() => {
    const handleMenuUpdate = (e) => {
      const detail = e.detail
      if (!detail) return

      if (detail.deleted) {
        setMenuItems((prev) => prev.filter((m) => m.id !== detail.id))
      } else {
        setMenuItems((prev) => {
          const exists = prev.some((m) => m.id === detail.id)
          if (!exists) {
            fetchMenu()
            return prev
          }
          return prev.map((m) =>
            m.id === detail.id
              ? {
                  ...m,
                  name: detail.name || m.name,
                  price: detail.price ? detail.price / 100 : m.price,
                  category: detail.categoryName || detail.category || m.category,
                  isAvailable: detail.isAvailable ?? m.isAvailable,
                  image: detail.imageUrl || m.image,
                  imageUrl: detail.imageUrl || m.imageUrl
                }
              : m
          )
        })
      }
    }

    window.addEventListener('kf:menu-updated', handleMenuUpdate)
    return () => {
      window.removeEventListener('kf:menu-updated', handleMenuUpdate)
    }
  }, [fetchMenu])

  // Extract categories dynamically
  const categories = useMemo(() => {
    const unique = Array.from(new Set(menuItems.map((m) => m.category))).filter(Boolean)
    return ['All', ...unique]
  }, [menuItems])

  // Filtered menu list
  const filteredList = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory
      const matchSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [menuItems, selectedCategory, searchQuery])

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormName('')
    setFormPrice('')
    setFormCategory('Burgers')
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
  const handleFileUpload = async (file) => {
    if (!file) return
    setIsUploadingPhoto(true)
    try {
      const result = await imageApi.uploadImage(file)
      if (result && result.imageUrl) {
        setFormImageUrl(result.imageUrl)
        setFormImageId(result.imageId || '')
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
    e.preventDefault()
    if (!formName.trim() || !formPrice) {
      addToast('Please provide menu name and price', 'warning')
      return
    }

    setIsSubmitting(true)
    try {
      const priceCents = Math.round(parseFloat(formPrice) * 100)
      const payload = {
        name: formName.trim(),
        price: priceCents,
        category: formCategory,
        categoryName: formCategory,
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

      await fetchMenu()
      setViewMode('list')
    } catch (err) {
      console.error('Save menu error:', err)
      addToast(err?.message || 'Failed to save menu item', 'warning')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1-Click Availability Toggle (Strict: NO optimistic update, 600ms tactile spinner delay)
  const handleToggleAvailability = async (item) => {
    if (togglingIds.has(item.id)) return // Prevent duplicate requests
    const newValue = !item.isAvailable

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
      addToast('Failed to toggle availability on server', 'warning')
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  // Delete Menu Item (Strict: NO optimistic update, 600ms tactile spinner delay)
  const handleDeleteDish = async (item) => {
    if (deletingIds.has(item.id)) return
    if (!window.confirm(`Are you sure you want to permanently delete "${item.name}"?`)) return

    setDeletingIds((prev) => new Set(prev).add(item.id))
    try {
      await Promise.all([
        menuApi.deleteMenu(item.id),
        new Promise((resolve) => setTimeout(resolve, 600))
      ])
      // Only remove after server confirms deletion
      setMenuItems((prev) => prev.filter((i) => i.id !== item.id))
      addToast(`Deleted "${item.name}"`, 'info')
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
      {/* 1. Sticky Navigation Header */}
      <MenuHeader />

      {/* 2. Main Page Area */}
      <main className="p-5 sm:p-6 w-full max-w-7xl mx-auto space-y-4 pb-20">
        {viewMode === 'list' ? (
          <>
            {/* Toolbar: Title, Categories, Search & View Switcher */}
            <MenuToolbar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              layoutMode={layoutMode}
              onLayoutChange={setLayoutMode}
              onOpenCreate={handleOpenCreate}
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
                items={filteredList}
                togglingIds={togglingIds}
                deletingIds={deletingIds}
                onToggleAvailability={handleToggleAvailability}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteDish}
              />
            ) : (
              <MenuTableView
                items={filteredList}
                togglingIds={togglingIds}
                deletingIds={deletingIds}
                onToggleAvailability={handleToggleAvailability}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteDish}
              />
            )}
          </>
        ) : (
          <MenuFormView
            viewMode={viewMode}
            editingItem={editingItem}
            formName={formName}
            setFormName={setFormName}
            formPrice={formPrice}
            setFormPrice={setFormPrice}
            formCategory={formCategory}
            setFormCategory={setFormCategory}
            formTier={formTier}
            setFormTier={setFormTier}
            formDesc={formDesc}
            setFormDesc={setFormDesc}
            formImageUrl={formImageUrl}
            setFormImageUrl={setFormImageUrl}
            formImageId={formImageId}
            setFormImageId={setFormImageId}
            formIsAvailable={formIsAvailable}
            setFormIsAvailable={setFormIsAvailable}
            isUploadingPhoto={isUploadingPhoto}
            isSubmitting={isSubmitting}
            onFileUpload={handleFileUpload}
            onSubmitForm={handleSubmitForm}
            onCancel={() => setViewMode('list')}
          />
        )}
      </main>
    </div>
  )
}
