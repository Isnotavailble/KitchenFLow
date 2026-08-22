export default function AdminPageHeader({ title, children }) {
  return (
    <header className="bg-white border-b border-zinc-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div>
        <h1 className="text-xl font-black text-zinc-900 tracking-tight leading-none font-sans">
          {title}
        </h1>
      </div>

      {children && (
        <div className="flex items-center space-x-2.5 shrink-0">
          {children}
        </div>
      )}
    </header>
  )
}
