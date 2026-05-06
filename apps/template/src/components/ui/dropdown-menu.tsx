'use client'

import * as React from 'react'

// Simple dropdown menu implementation without Radix

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error('useDropdownMenu must be used within DropdownMenu')
  return context
}

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdownMenu()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: handleClick
    })
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function DropdownMenuContent({ children, align = 'end', className = '' }: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenu()
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

  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  }[align]

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md ${alignClass} ${className}`}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function DropdownMenuItem({ children, onClick, disabled, className = '' }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu()

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    setOpen(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-gray-200" />
}

export function DropdownMenuLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>
      {children}
    </div>
  )
}
