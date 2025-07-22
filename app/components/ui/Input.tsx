'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error 
              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
              : 'border-slate-300 hover:border-slate-400 bg-white',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={clsx(
            'w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200 resize-vertical',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error 
              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
              : 'border-slate-300 hover:border-slate-400 bg-white',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Select component for form dropdowns
interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string }[]
  placeholder?: string
  onChange?: (value: string) => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, onChange, className, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'w-full px-3 py-2.5 border rounded-lg text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error 
              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
              : 'border-slate-300 hover:border-slate-400 bg-white',
            className
          )}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'