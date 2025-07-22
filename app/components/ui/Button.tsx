import { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled, 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  )
}