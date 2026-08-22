import { useEffect, forwardRef, useCallback } from 'react'
import { VirtuosoGrid } from 'react-virtuoso'
import { useKds } from './hooks/useKds'
import KdsHeader from './components/KdsHeader'
import KdsFilterRow from './components/KdsFilterRow'
import TicketCard from './components/TicketCard'

const gridComponents = {
  List: forwardRef(({ style, children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      style={style}
      className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4 sm:gap-5 pb-8 px-6"
    >
      {children}
    </div>
  )),
  Item: forwardRef(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )),
  Footer: () => null
}

gridComponents.List.displayName = 'VirtuosoGridList'
gridComponents.Item.displayName = 'VirtuosoGridItem'

export default function KdsPage() {
  const {
    orders,
    loading,
    loadMore,
    hasMore,
    refreshOrders,
    searchOrderNumber,
    menuFilter,
    setSearchOrderNumber,
    setMenuFilter
  } = useKds()

  // Refresh live orders whenever entering the KDS page
  useEffect(() => {
    refreshOrders?.()
  }, [refreshOrders])

  const hasActiveFilters = searchOrderNumber !== '' || menuFilter !== 'ALL'

  // Virtuoso prefetch handler: triggers when near the end (10-item threshold / overscan)
  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore()
    }
  }, [hasMore, loading, loadMore])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ECEEF1] select-none">
      {/* Top Header */}
      <KdsHeader />

      {/* Filter Row with Tabs, Menu Dropdown, and Order Number Search */}
      <KdsFilterRow />

      {/* Main Ticket Grid with VirtuosoGrid virtualization */}
      <main className="flex-1 h-full overflow-hidden">
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
          <VirtuosoGrid
            style={{ height: '100%' }}
            data={orders}
            endReached={handleEndReached}
            overscan={10}
            components={gridComponents}
            itemContent={(_index, ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            )}
          />
        )}
      </main>
    </div>
  )
}

