import React, { useState } from 'react'
import { Trash2, Plus, Minus, CreditCard, Banknote, ShoppingBag, X, Utensils, Edit2, Check, AlertCircle } from 'lucide-react'
import { usePos } from '../hooks/usePos'
import { formatMMK } from '../../../utils/formatPrice'


function CartItemNote({ item, onSaveNote }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(item.note || '')

  const handleSave = () => {
    onSaveNote(item.id, text.trim())
    setIsEditing(false)
  }

  const handleCancel = () => {
    setText(item.note || '')
    setIsEditing(false)
  }

  const handleRemove = () => {
    setText('')
    onSaveNote(item.id, '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="mt-2 flex items-center space-x-1.5 pt-1 border-t border-zinc-200/60 w-full min-w-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Special notes (e.g. no onions)..."
          className="flex-1 min-w-0 px-2 py-1 bg-white border border-zinc-200 rounded-md text-[11px] font-medium text-zinc-800 outline-none focus:border-[#FF5C39]"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition cursor-pointer shrink-0"
          title="Save note"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="p-1 text-zinc-400 hover:bg-zinc-100 rounded-md transition cursor-pointer shrink-0"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  if (item.note) {
    return (
      <div className="mt-1.5 flex items-start justify-between text-[11px] bg-white border border-zinc-200/80 px-2 py-1 rounded-md text-zinc-700 w-full min-w-0 shadow-2xs">
        <div className="flex-1 min-w-0 break-words whitespace-normal leading-snug pr-1">
          <span className="font-bold text-[#FF5C39]">Note:</span>{' '}
          <span className="break-all text-zinc-600 font-medium">{item.note}</span>
        </div>
        <div className="flex items-center space-x-1 shrink-0 pt-0.5 ml-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-zinc-400 hover:text-zinc-700 p-0.5 cursor-pointer"
            title="Edit note"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="text-zinc-400 hover:text-rose-600 p-0.5 cursor-pointer"
            title="Remove note"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="mt-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 hover:underline flex items-center space-x-1 cursor-pointer"
    >
      <span>+ Add note</span>
    </button>
  )
}

export default function PosCart() {
  const {
    cart,
    updateQuantity,
    updateItemNote,
    removeFromCart,
    clearCart,
    orderType,
    setOrderType,
    subtotal,
    taxAmount,
    total,
    totalItemCount,
    paymentMethod,
    setPaymentMethod,
    checkout
  } = usePos()

  const [cashTendered, setCashTendered] = useState('')
  const isCash = paymentMethod === 'cash'

  // Cash Validation Logic
  const cashNum = parseFloat(cashTendered)
  const isCashEntered = isCash && cashTendered.trim() !== ''
  const isUnderpaid = isCash && isCashEntered && !isNaN(cashNum) && cashNum < total
  const isInvalidNumber = isCash && isCashEntered && (isNaN(cashNum) || cashNum <= 0)
  const isCashValid = !isCash || !isCashEntered || (!isUnderpaid && !isInvalidNumber)

  const handleCheckout = () => {
    if (!isCashValid) return
    const tenderedVal = isCash && isCashEntered ? cashNum : total
    checkout(tenderedVal)
    setCashTendered('')
  }

  const changeDue = isCash && isCashEntered && !isNaN(cashNum) && cashNum > total
    ? Math.round(cashNum - total)
    : 0


  return (
    <aside className="w-80 sm:w-96 bg-white border-l border-zinc-200/80 shadow-xs flex flex-col h-full select-none shrink-0">
      {/* 1. Combined Top Header (~44px) */}
      <div className="px-3.5 py-2.5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
        {/* Left: Rock-solid Stable Dine-In / Takeaway Switcher */}
        <div className="flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/60">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1.5 transition-colors duration-150 cursor-pointer ${
              orderType === 'dine_in'
                ? 'bg-white text-zinc-900 shadow-2xs border border-zinc-200/50'
                : 'text-zinc-500 hover:text-zinc-800 border border-transparent'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#FF5C39]" />
            <span>Dine-In</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1.5 transition-colors duration-150 cursor-pointer ${
              orderType === 'takeaway'
                ? 'bg-white text-zinc-900 shadow-2xs border border-zinc-200/50'
                : 'text-zinc-500 hover:text-zinc-800 border border-transparent'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#FF5C39]" />
            <span>Takeaway</span>
          </button>
        </div>

        {/* Right: Item Count & Clear */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] text-zinc-500 font-bold px-2 py-0.5 bg-zinc-100 rounded-md">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="flex items-center space-x-0.5 text-xs text-zinc-400 hover:text-rose-600 font-semibold px-1.5 py-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
              title="Clear all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 min-h-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-zinc-600">Your cart is empty</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Select dishes from the menu to start an order.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition shadow-2xs overflow-hidden"
            >
              {/* Item Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-zinc-900 truncate block">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium block mt-0.5">
                    {formatMMK(item.price)} each
                  </span>
                </div>

                {/* Quantity Steppers & Line Total */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex items-center bg-white border border-zinc-200/80 rounded-lg shadow-2xs">
                    <button
                      type="button"
                      disabled={item.qty <= 1}
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded-l-md transition cursor-pointer"
                      title={item.qty <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-zinc-900 font-mono">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-r-md transition cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-zinc-900 font-sans min-w-[60px] text-right">
                    {formatMMK(item.price * item.qty)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-zinc-300 hover:text-rose-600 transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Item Customization Note Section */}
              <CartItemNote item={item} onSaveNote={updateItemNote} />
            </div>
          ))
        )}
      </div>

      {/* 3. Footer with Left-Aligned Financials & Dedicated Separated Button */}
      <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/50 space-y-3 shrink-0">
        {/* Row 1: Payment Method & Cash Received (Side-by-side) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center bg-zinc-200/60 p-0.5 rounded-lg border border-zinc-200/50">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1.5 transition-colors duration-150 cursor-pointer ${
                isCash
                  ? 'bg-white text-[#FF5C39] shadow-2xs border border-orange-200/40'
                  : 'text-zinc-600 hover:text-zinc-900 border border-transparent'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Cash</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1.5 transition-colors duration-150 cursor-pointer ${
                !isCash
                  ? 'bg-white text-[#FF5C39] shadow-2xs border border-orange-200/40'
                  : 'text-zinc-600 hover:text-zinc-900 border border-transparent'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card / Online</span>
            </button>
          </div>

          {isCash && cart.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-zinc-600">Cash:</span>
              <div className="flex items-center">
                <input
                  type="number"
                  step="100"
                  min={0}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={String(total)}
                  className={`w-24 px-2 py-0.5 bg-white border rounded-md text-xs font-bold text-right outline-none transition ${
                    isUnderpaid || isInvalidNumber
                      ? 'border-rose-400 bg-rose-50/40 text-rose-700'
                      : 'border-zinc-200 focus:border-[#FF5C39]'
                  }`}
                />
                <span className="text-[10px] text-zinc-400 font-bold ml-1">MMK</span>
              </div>
            </div>
          )}
        </div>

        {/* Validation Warning */}
        {isUnderpaid && (
          <div className="flex items-center space-x-1 p-1 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-600 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Received amount is less than total ({formatMMK(total)})</span>
          </div>
        )}

        {/* Row 2: Clean Left-Aligned Financial Breakdown */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span>{formatMMK(subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Tax (5%)</span>
            <span>{formatMMK(taxAmount)}</span>
          </div>
          {isCash && parseFloat(changeDue) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Change Due</span>
              <span>{formatMMK(changeDue)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-zinc-900 pt-1.5 border-t border-zinc-200/70">
            <span>Total</span>
            <span className="text-[#FF5C39]">{formatMMK(total)}</span>
          </div>
        </div>


        {/* Row 3: Dedicated Separate Full-Width Send to Kitchen Button */}
        <button
          type="button"
          disabled={cart.length === 0 || isUnderpaid || isInvalidNumber}
          onClick={handleCheckout}
          className="w-full py-3.5 bg-[#FF5C39] hover:bg-[#F04D28] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.96] transition-all duration-150 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Send to Kitchen</span>
        </button>
      </div>
    </aside>
  )
}
