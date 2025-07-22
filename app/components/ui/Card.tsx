import { HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({ 
  children, 
  padding = 'md', 
  hover = false, 
  className, 
  ...props 
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={clsx(
        'bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm',
        paddingClasses[padding],
        hover && 'hover:shadow-lg transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Sub-components for structured cards
export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx('text-lg font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx('text-slate-600 text-sm', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mt-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}