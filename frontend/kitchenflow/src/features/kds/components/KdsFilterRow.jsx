import React, { useState, useMemo } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { useKds } from '../hooks/useKds'

export default function KdsFilterRow() {
  const {
    orders,
    activeFilter,
    setActiveFilter,
    searchOrderNumber,
    setSearchOrderNumber,
    menuFilter,
    setMenuFilter
  } = useKds()

  const [localInput, setLocalInput] = useState(searchOrderNumber)
  const [prevSearch, setPrevSearch] = useState(searchOrderNumber)

  // Sync state during render when external searchOrderNumber resets
  if (prevSearch !== searchOrderNumber) {
    setPrevSearch(searchOrderNumber)
    setLocalInput(searchOrderNumber)
  }

  const filters = ['All', 'Waiting', 'Priority', 'Complete']

  // Extract unique menu item names dynamically from live orders
  const menuItemsList = useMemo(() => {
    const names = new Set()
    orders.forEach((o) => {
      (o.items || []).forEach((i) => {
        if (i.name) names.add(i.name)
      })
    })
    return Array.from(names)
  }, [orders])

  // Strict integer validation for input typing
  const handleInputChange = (e) => {
    const rawValue = e.target.value
    const sanitized = rawValue.replace(/[^0-9]/g, '').replace(/^0+/, '')
    setLocalInput(sanitized)
  }

  // Trigger search only on Submit or Enter key
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    setSearchOrderNumber(localInput.trim())
  }

  const handleClearSearch = () => {
    setLocalInput('')
    setSearchOrderNumber('')
  }

  const isMenuActive = menuFilter !== 'ALL'

  return (
    <div className="px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-3.5 select-none shrink-0">
      {/* Left: Status Filter Buttons */}
      <div className="flex items-center space-x-2.5">
        {filters.map((filter) => {
          const isActive = activeFilter === filter

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ease-out shadow-xs cursor-pointer active:scale-[0.96] ${
                isActive
                  ? 'border-[#FF5C39] bg-[#FF5C39] text-white shadow-sm hover:bg-[#F04D28]'
                  : 'border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>

      {/* Right: Menu Dish Filter Dropdown & Order Number Search Form */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Dynamic Menu Item Filter Dropdown */}
        <div className="relative flex items-center">
          <select
            value={menuFilter}
            onChange={(e) => setMenuFilter(e.target.value)}
            className={`appearance-none pl-3.5 pr-8 py-2 text-xs font-bold rounded-xl border transition-all duration-150 ease-out shadow-xs outline-none cursor-pointer ${
              isMenuActive
                ? 'border-[#FF5C39] bg-orange-50/80 text-[#FF5C39]'
                : 'border-zinc-200/90 bg-white text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <option value="ALL">All Menu Items</option>
            {menuItemsList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 pointer-events-none text-zinc-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Order Number Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-1.5">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-zinc-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={localInput}
              onChange={handleInputChange}
              placeholder="Search by order # (e.g. 5266)..."
              className="pl-10 pr-8 py-2 w-48 sm:w-60 bg-white border border-zinc-200/90 rounded-xl text-xs font-medium text-zinc-800 placeholder-zinc-400 shadow-xs outline-none focus:outline-none focus:border-[#FF5C39] transition-all duration-150"
            />
            {localInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-all duration-150 ease-out hover:border-zinc-300 active:scale-[0.96] cursor-pointer"
            title="Search by order number"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  )
}
