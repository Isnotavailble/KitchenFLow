import React, { useEffect } from 'react'
import { usePos } from './hooks/usePos'
import PosHeader from './components/PosHeader'
import CategoryTabs from './components/CategoryTabs'
import MenuCardGrid from './components/MenuCardGrid'
import PosCart from './components/PosCart'
import ReceiptModal from './components/ReceiptModal'
import PreOrderLookupModal from './components/PreOrderLookupModal'

export default function PosPage() {
  const { reloadMenu } = usePos()

  // Fetch all menu items whenever entering the POS page
  useEffect(() => {
    reloadMenu()
  }, [reloadMenu])

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#ECEEF1] select-none font-sans antialiased">
      {/* Top Header */}
      <PosHeader />

      {/* Main Workspace: Menu Grid on Left, Billing Register on Right */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CategoryTabs />
          <MenuCardGrid />
        </main>

        <PosCart />
      </div>

      {/* Popups & Modals */}
      <ReceiptModal />
      <PreOrderLookupModal />
    </div>
  )
}
