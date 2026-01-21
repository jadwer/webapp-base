'use client'

import * as React from 'react'

// Simple select implementation without Radix

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('useSelect must be used within Select')
  return context
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const [open, setOpen] = React.useState(false)

  const actualValue = value !== undefined ? value : internalValue
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: actualValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export function SelectTrigger({ children, className = '' }: SelectTriggerProps) {
  const { open, setOpen } = useSelect()

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelect()
  return <span className={value ? '' : 'text-gray-500'}>{value || placeholder}</span>
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  const { open, setOpen } = useSelect()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg ${className}`}
    >
      {children}
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function SelectItem({ value, children, disabled, className = '' }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelect()
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
      className={`relative flex w-full cursor-pointer select-none items-center py-1.5 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 ${isSelected ? 'bg-gray-100 font-medium' : ''} ${className}`}
    >
      {children}
      {isSelected && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  )
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div className="py-1">{children}</div>
}

export function SelectLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-3 py-1.5 text-sm font-semibold text-gray-500 ${className}`}>{children}</div>
}

export function SelectSeparator() {
  return <div className="-mx-1 my-1 h-px bg-gray-200" />
}
