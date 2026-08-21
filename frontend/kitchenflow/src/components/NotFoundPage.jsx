import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-[#ECEEF1] p-4 select-none">
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 max-w-sm w-full shadow-lg text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5C39] border border-orange-100 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 font-sans">404 - Page Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1 mb-5 leading-relaxed">
          The page or station you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="w-full py-2.5 bg-[#FF5C39] hover:bg-[#F04D28] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  )
}
