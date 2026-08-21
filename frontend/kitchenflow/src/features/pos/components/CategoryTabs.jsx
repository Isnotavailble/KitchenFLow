import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { usePos } from '../hooks/usePos'

export default function CategoryTabs() {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = usePos()

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [prevSearch, setPrevSearch] = useState(searchQuery)

  if (prevSearch !== searchQuery) {
    setPrevSearch(searchQuery)
    setLocalSearch(searchQuery)
  }

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    setSearchQuery(localSearch.trim())
  }

  const handleClear = () => {
    setLocalSearch('')
    setSearchQuery('')
  }

  return (
    <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-3 select-none shrink-0 min-w-0">
      {/* Horizontal Scrollable Category Track (No Chevrons, Pure Smooth Scroll) */}
      <div className="flex-1 min-w-0 flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ease-out shadow-xs cursor-pointer active:scale-[0.96] shrink-0 whitespace-nowrap ${
                isActive
                  ? 'border-[#FF5C39] bg-[#FF5C39] text-white shadow-sm hover:bg-[#F04D28]'
                  : 'border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Pinned Menu Dish Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-1.5 shrink-0">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-zinc-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search dishes..."
            className="pl-10 pr-8 py-2 w-44 sm:w-52 bg-white border border-zinc-200/90 rounded-xl text-xs font-medium text-zinc-800 placeholder-zinc-400 shadow-xs outline-none focus:outline-none focus:border-[#FF5C39] transition-all duration-150"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition cursor-pointer"
              title="Clear dish search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-all duration-150 ease-out hover:border-zinc-300 active:scale-[0.96] cursor-pointer"
          title="Search dishes"
        >
          Search
        </button>
      </form>
    </div>
  )
}
