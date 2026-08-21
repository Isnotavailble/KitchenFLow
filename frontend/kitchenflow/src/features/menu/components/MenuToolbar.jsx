import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function MenuToolbar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) {
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery || '')

  useEffect(() => {
    setLocalSearchInput(searchQuery || '')
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onSearchChange(localSearchInput.trim())
  }

  const handleClear = () => {
    setLocalSearchInput('')
    onSearchChange('')
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 select-none shrink-0">
      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#FF5C39] text-white shadow-2xs'
                  : 'bg-white hover:bg-zinc-50 border border-zinc-200/80 text-zinc-700 shadow-2xs'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Dedicated Search Form with Button (No Live on-change search) */}
      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
        <div className="relative flex items-center flex-1 sm:w-60">
          <div className="absolute left-3 pointer-events-none text-zinc-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={localSearchInput}
            onChange={(e) => setLocalSearchInput(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-zinc-200/90 rounded-xl text-xs font-medium text-zinc-800 placeholder-zinc-400 shadow-2xs focus:border-[#FF5C39] outline-none transition"
          />
          {localSearchInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 p-0.5 text-zinc-400 hover:text-zinc-600 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="h-8 px-3.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-700 hover:text-zinc-900 text-xs font-bold rounded-xl shadow-2xs transition active:scale-[0.96] flex items-center space-x-1 cursor-pointer shrink-0"
        >
          <span>Search</span>
        </button>
      </form>
    </div>
  )
}
