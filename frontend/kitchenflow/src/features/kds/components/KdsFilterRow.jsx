import React, { useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import { MENU_ITEMS_LIST } from '../api/seedData'

export default function KdsFilterRow() {
  const {
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

  // Strict integer validation for input typing
  const handleInputChange = (e) => {
    const rawValue = e.target.value
    // Strip all non-numeric characters and leading zeros
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
      {/* Left: Status Filter Buttons (Stable geometry with permanent 1px border) */}
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

      {/* Right Controls: [Search Input + Search Button] [Menu filter] */}
      <div className="flex items-center space-x-2.5">
        {/* 1. Integer Order Number Search Form (Triggered only on Enter or Search Button click) */}
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
              placeholder="Search order number..."
              className="pl-10 pr-8 py-2 w-44 sm:w-52 bg-white border border-zinc-200/90 rounded-xl text-xs font-medium text-zinc-800 placeholder-zinc-400 shadow-xs outline-none focus:outline-none focus:border-[#FF5C39] transition-all duration-200"
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

          {/* Dedicated Search Button */}
          <button
            type="submit"
            className="px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-all duration-150 ease-out hover:border-zinc-300 active:scale-[0.96] cursor-pointer"
            title="Execute Search"
          >
            Search
          </button>
        </form>

        {/* 2. Menu Item Filter Dropdown */}
        <div className="relative inline-flex items-center w-fit">
          <select
            value={menuFilter}
            onChange={(e) => setMenuFilter(e.target.value)}
            className={`pl-4 pr-8 py-2 w-auto min-w-[140px] max-w-[240px] bg-white rounded-xl text-xs font-semibold text-zinc-800 shadow-xs transition-all duration-200 cursor-pointer appearance-none outline-none focus:outline-none ${
              isMenuActive
                ? 'border border-[#FF5C39] focus:border-[#FF5C39]'
                : 'hover:bg-zinc-50/80 border border-zinc-200/90 focus:border-[#FF5C39]'
            }`}
            title="Filter by specific menu item"
          >
            <option value="ALL">All Menu Items</option>
            {MENU_ITEMS_LIST.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-zinc-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}
