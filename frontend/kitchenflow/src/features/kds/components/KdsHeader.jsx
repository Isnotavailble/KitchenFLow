import React from 'react'
import { Plus } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import pageLogo from '../../../assets/page_logo.png'

export default function KdsHeader() {
  const { simulateOrder } = useKds()

  return (
    <header className="bg-white border-b border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-3.5 flex items-center justify-between select-none shrink-0 z-10">
      {/* Clean Main Brand with Orange Themed Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xs border border-orange-200/80 shrink-0 flex items-center justify-center bg-[#FF5C39]">
          <img
            src={pageLogo}
            alt="KitchenFlow Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 font-sans">
          Kitchen<span className="text-[#FF5C39]">Flow</span>
        </h1>
      </div>

      {/* Subtle simulation action with micro-animation */}
      <button
        onClick={simulateOrder}
        className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/90 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.95] cursor-pointer"
        title="Simulate incoming order"
      >
        <Plus className="w-3.5 h-3.5 text-zinc-500" />
        <span>Simulate Order</span>
      </button>
    </header>
  )
}
