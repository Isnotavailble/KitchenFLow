import React from 'react'

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  title,
  icon: Icon
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] rounded-xl cursor-pointer'

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs space-x-1.5',
    md: 'px-3.5 py-2 text-xs space-x-2',
    lg: 'px-4 py-2.5 text-sm space-x-2',
    touch: 'px-5 py-3 text-sm font-bold min-h-[48px] space-x-2.5'
  }

  const variantStyles = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 border border-transparent shadow-sm',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700',
    outline: 'bg-transparent text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    ghost: 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    danger: 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-700'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children && <span>{children}</span>}
    </button>
  )
}
