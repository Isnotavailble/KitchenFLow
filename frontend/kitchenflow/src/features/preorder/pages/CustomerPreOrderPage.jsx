import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  UtensilsCrossed,
  QrCode,
  Copy,
  Check,
  Clock,
  Search,
  X,
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  MessageSquare,
  ChevronRight,
  Edit2
} from 'lucide-react'

import { preOrderApi } from '../api/preOrderApi'
import { formatMMK } from '../../../utils/formatPrice'
import pageLogo from '../../../assets/page_logo.png'

export default function CustomerPreOrderPage() {
  // Navigation Tabs: 'menu' | 'ticket'
  const [activeTab, setActiveTab] = useState('menu')

  // Menu & Category States
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Direct Cart State: map of itemId -> { item, qty, note }
  const [cart, setCart] = useState({})
  const [editingNoteItem, setEditingNoteItem] = useState(null) // { id, name, note }
  const [tempNote, setTempNote] = useState('')

  // Pre-Order Generation & Ticket Result States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preOrderResult, setPreOrderResult] = useState(null) // { code, qrImageBase64, expiresInSeconds }
  const [timeLeft, setTimeLeft] = useState(1800)
  const [copied, setCopied] = useState(false)

  // Load public menu and categories
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [catData, menuData] = await Promise.all([
        preOrderApi.getCategories(),
        preOrderApi.getMenu({ size: 200 })
      ])

      const catList = Array.isArray(catData) ? catData : (catData?.content || [])
      setCategories(catList)

      const rawItems = Array.isArray(menuData)
        ? menuData
        : (menuData?.items || menuData?.content || [])
      setMenuItems(rawItems)
    } catch (err) {
      console.error('Failed to load menu data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Timer countdown for active pre-order ticket
  useEffect(() => {
    if (!preOrderResult) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [preOrderResult])

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const itemCat = (item.category || item.categoryName || item.categoryEntity?.name || '').toUpperCase()
      const matchCat =
        selectedCategory === 'ALL' ||
        itemCat === selectedCategory.toUpperCase() ||
        String(item.categoryId) === String(selectedCategory)

      const matchSearch =
        !searchQuery.trim() ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase().trim()))

      return matchCat && matchSearch
    })
  }, [menuItems, selectedCategory, searchQuery])

  // In-Card Quantity Operations
  const handleAddItem = (item) => {
    setCart((prev) => {
      const current = prev[item.id]
      return {
        ...prev,
        [item.id]: {
          item,
          qty: (current?.qty || 0) + 1,
          note: current?.note || ''
        }
      }
    })
  }

  const handleUpdateQty = (itemId, delta) => {
    setCart((prev) => {
      const current = prev[itemId]
      if (!current) return prev
      const newQty = current.qty + delta
      if (newQty <= 0) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return {
        ...prev,
        [itemId]: {
          ...current,
          qty: newQty
        }
      }
    })
  }

  // Open note edit dialog
  const handleOpenNoteModal = (item, currentNote = '') => {
    setEditingNoteItem(item)
    setTempNote(currentNote)
  }

  const handleSaveNote = () => {
    if (!editingNoteItem) return
    setCart((prev) => {
      const current = prev[editingNoteItem.id]
      if (!current) return prev
      return {
        ...prev,
        [editingNoteItem.id]: {
          ...current,
          note: tempNote.trim()
        }
      }
    })
    setEditingNoteItem(null)
  }

  // Cart list array
  const cartList = useMemo(() => Object.values(cart), [cart])

  // Financial calculations
  const subtotal = useMemo(() => {
    return cartList.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0)
  }, [cartList])

  const taxAmount = useMemo(() => {
    return Math.round(subtotal * 0.05)
  }, [subtotal])

  const total = useMemo(() => {
    return subtotal + taxAmount
  }, [subtotal, taxAmount])

  const totalItemCount = useMemo(() => {
    return cartList.reduce((sum, entry) => sum + entry.qty, 0)
  }, [cartList])

  // Submit Pre-Order to Backend -> Seamlessly switch to My Ticket tab
  const handleGeneratePreOrder = async () => {
    if (cartList.length === 0 || isSubmitting) return

    try {
      setIsSubmitting(true)
      const payload = cartList.map((entry) => ({
        menuId: entry.item.id,
        quantity: entry.qty,
        itemNote: entry.note.trim() || null
      }))

      const res = await preOrderApi.createPreOrder(payload)
      setPreOrderResult(res)
      setTimeLeft(res.expiresInSeconds || 1800)
      setActiveTab('ticket')
    } catch (err) {
      console.error('Failed to create pre-order:', err)
      alert(err?.response?.data?.error || err?.message || 'Failed to generate pre-order ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy 6-digit code
  const handleCopyCode = () => {
    if (!preOrderResult?.code) return
    navigator.clipboard.writeText(preOrderResult.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Reset and start fresh pre-order
  const handleStartNewOrder = () => {
    setCart({})
    setPreOrderResult(null)
    setTimeLeft(1800)
    setActiveTab('menu')
  }

  // Format timer mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="w-full h-full bg-[#ECEEF1] text-zinc-900 flex flex-col font-sans select-none antialiased overflow-y-auto">
      {/* 1. Header with Brand Bar & Full-Width Segmented Tab Switcher */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Top Row: Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-2xs border border-orange-200/80 shrink-0 flex items-center justify-center bg-[#FF5C39]">
              <img
                src={pageLogo}
                alt="KitchenFlow Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 font-sans">
              Kitchen<span className="text-[#FF5C39]">Flow</span>
            </h1>
          </div>


          {/* Full-Width Segmented Tabs */}
          <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'menu'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ticket')}
              className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'ticket'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>


        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 sm:py-5 pb-36 sm:pb-32 space-y-3.5">

        {activeTab === 'menu' ? (
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dishes or beverages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-zinc-200/80 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5C39]/20 focus:border-[#FF5C39] shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Horizontal Pills */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#FF5C39] text-white shadow-xs'
                    : 'bg-white border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 shadow-2xs'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-[#FF5C39] text-white shadow-xs'
                      : 'bg-white border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 shadow-2xs'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu List: Compact Horizontal Cards with Stable Uniform Heights */}
            {loading ? (
              <div className="py-20 text-center text-zinc-400 text-xs font-semibold">
                Loading menu catalog...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/80 p-8 space-y-2 shadow-xs">
                <UtensilsCrossed className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-zinc-700">No dishes found</h3>
                <p className="text-[11px] text-zinc-400">Try changing your search query or category filter.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredItems.map((item) => {
                  const isAvailable = item.isAvailable !== false
                  const cartEntry = cart[item.id]
                  const itemQty = cartEntry?.qty || 0
                  const hasNote = Boolean(cartEntry?.note)

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-3 border border-zinc-200/80 shadow-xs flex items-center justify-between space-x-3 transition hover:shadow-md ${
                        !isAvailable ? 'opacity-50 grayscale' : ''
                      }`}
                    >
                      {/* Left: Square Thumbnail */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-zinc-100 shrink-0 relative border border-zinc-100">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <UtensilsCrossed className="w-6 h-6" />
                          </div>
                        )}
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-bold text-white uppercase">
                            Sold Out
                          </div>
                        )}
                      </div>

                      {/* Center: Details */}
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="text-[10px] font-bold text-[#FF5C39] block truncate">
                          {item.category || item.categoryName || item.categoryEntity?.name || 'Menu'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate mt-0.5">
                          {item.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900 font-mono">
                            {formatMMK(item.price)}
                          </span>
                          {hasNote && (
                            <span className="text-[10px] text-zinc-500 italic truncate max-w-[120px]">
                              "{cartEntry.note}"
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Add Button or In-Card Stepper + Note Button */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {itemQty === 0 ? (
                          <button
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleAddItem(item)}
                            className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 border border-zinc-200/90 transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-2xs font-bold"
                            title="Add to pre-order"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1 bg-zinc-50 border border-zinc-200/80 px-1.5 py-1 rounded-xl shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold border border-zinc-200/90 shadow-2xs cursor-pointer active:scale-95 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black font-mono w-4 text-center text-zinc-900">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold border border-zinc-200/90 shadow-2xs cursor-pointer active:scale-95 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenNoteModal(item, cartEntry?.note || '')}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ml-1 border shadow-2xs active:scale-95 ${
                                hasNote
                                  ? 'bg-orange-50 text-[#FF5C39] border-orange-200/80'
                                  : 'bg-white hover:bg-zinc-100 text-zinc-500 border-zinc-200/90'
                              }`}
                              title={hasNote ? `Note: ${cartEntry.note}` : 'Add special instructions'}
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* --- TAB 2: CODE VIEW --- */
          <div className="space-y-3.5">
            {preOrderResult ? (
              <div className="bg-white rounded-2xl p-5 sm:p-7 border border-zinc-200/80 shadow-xs text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-sm font-bold text-zinc-900">Code</h2>

                {/* 1. QR Code Image */}
                {preOrderResult.qrImageBase64 && (
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-white border border-zinc-200/90 rounded-2xl shadow-xs inline-block">
                      <img
                        src={preOrderResult.qrImageBase64}
                        alt="Pre-Order QR Code"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-2 max-w-xs">
                      Show this QR code or tell the 6-digit code to the cashier at the counter.
                    </p>
                  </div>
                )}

                {/* 2. 6-Digit Code Box (Right Below QR Code Image) */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 max-w-xs mx-auto shadow-xs">
                  <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                    6-Digit Order Code
                  </span>
                  <div className="text-4xl font-black font-mono tracking-widest text-zinc-900">
                    {preOrderResult.code}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="mt-2.5 inline-flex items-center space-x-1.5 text-xs font-bold text-[#FF5C39] hover:text-[#F04D28] transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to clipboard' : 'Copy Code'}</span>
                  </button>
                </div>


                {/* 3. 30-Min Countdown Timer */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-zinc-200/90 rounded-xl text-xs font-bold text-zinc-700 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Expires in:</span>
                  <span className="font-mono font-black text-[#FF5C39]">{formatTime(timeLeft)}</span>
                </div>



                {/* Summary of Items with Scrollable List */}
                <div className="border-t border-zinc-100 pt-4 text-left max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900">Order Items ({totalItemCount}):</h4>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto divide-y divide-zinc-100 text-xs pr-1 scrollbar-thin">
                    {cartList.map((entry, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-zinc-900 truncate block">
                            {entry.qty}x {entry.item.name}
                          </span>
                          {entry.note && (
                            <span className="text-[10px] text-zinc-500 block italic truncate">
                              Note: "{entry.note}"
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-zinc-800 shrink-0">
                          {formatMMK(entry.item.price * entry.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-200 pt-2 flex justify-between text-xs font-bold text-zinc-900">
                    <span>Total (incl. 5% Tax):</span>
                    <span className="text-[#FF5C39] font-mono">{formatMMK(total)}</span>
                  </div>
                </div>


                {/* Reset & Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu')}
                    className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Back to Menu
                  </button>
                  <button
                    type="button"
                    onClick={handleStartNewOrder}
                    className="flex-1 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-700 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                    <span>New Code</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty Code State */
              <div className="py-20 text-center bg-white rounded-2xl border border-zinc-200/80 p-8 space-y-3 shadow-xs">
                <QrCode className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-800">No Active Code</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Select your items from the Menu tab and generate your 6-digit code for quick counter checkout.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="mt-2 px-5 py-2.5 bg-[#FF5C39] hover:bg-[#F04D28] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <span>Browse Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Mobile Style Docked Bottom Drawer Bar */}
      {activeTab === 'menu' && totalItemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 animate-in slide-in-from-bottom-6 duration-200">
          <div className="bg-white border-t border-zinc-200/80 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] px-4 py-3.5 sm:px-6 rounded-t-3xl max-w-2xl mx-auto space-y-3">
            {/* Top Row: Total Price on Left, Item Count Label on Right */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 block leading-tight">
                  Total Price
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-zinc-900 block leading-tight mt-0.5">
                  {formatMMK(total)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-zinc-600">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Bottom Row: Full-Width QR Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGeneratePreOrder}
              className="w-full py-3 bg-[#FF5C39] hover:bg-[#F04D28] text-white text-xs sm:text-sm font-bold rounded-2xl transition shadow-md active:scale-98 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <QrCode className="w-4 h-4" />
              <span>{isSubmitting ? 'Generating...' : 'Get Code'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}





      {/* 4. Special Instructions Note Modal */}
      {editingNoteItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-zinc-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 truncate">{editingNoteItem.name}</h3>
                <span className="text-[10px] font-semibold text-zinc-400">Special Instructions</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteItem(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="e.g. Less sugar, extra spicy, no onions..."
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              maxLength={60}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C39]/20 focus:border-[#FF5C39]"
            />

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setTempNote('')
                  handleSaveNote()
                }}
                className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Clear Note
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="flex-1 py-2 bg-[#FF5C39] hover:bg-[#F04D28] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
