import React, { useRef, useEffect } from 'react'
import { useKds } from './hooks/useKds'
import KdsHeader from './components/KdsHeader'
import KdsFilterRow from './components/KdsFilterRow'
import TicketCard from './components/TicketCard'

export default function KdsPage() {
  const {
    orders,
    loading,
    loadMore,
    hasMore,
    searchOrderNumber,
    menuFilter,
    setSearchOrderNumber,
    setMenuFilter
  } = useKds()

  const sentinelRef = useRef(null)
  const hasActiveFilters = searchOrderNumber !== '' || menuFilter !== 'ALL'

  // Infinite scroll observer for loading subsequent 20-order pages
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ECEEF1] select-none">
      {/* Top Header */}
      <KdsHeader />

      {/* Filter Row with Tabs, Menu Dropdown, and Order Number Search */}
      <KdsFilterRow />

      {/* Main Ticket Grid with Equal Card Heights and Internal Scroll */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 pb-8">
        {loading && orders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-80 text-zinc-500 text-xs font-mono">
            Loading KitchenFlow KDS...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center px-4">
            <h2 className="text-sm font-bold text-zinc-700">
              {hasActiveFilters ? 'No Matching Orders' : 'No Orders in this View'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {hasActiveFilters
                ? 'Try adjusting your order number search or menu item filter.'
                : 'All kitchen tickets have been marked complete.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchOrderNumber('')
                  setMenuFilter('ALL')
                }}
                className="mt-3 px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition active:scale-[0.98] cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4 sm:gap-5">
              {orders.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* Bottom infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="py-6 text-center text-xs text-zinc-400 font-mono">
                Loading more orders (Page Size 20)...
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
