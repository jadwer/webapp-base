'use client'

import * as React from 'react'

// Simple alert dialog implementation without Radix

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange?.(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogContent({ children, className = '' }: AlertDialogContentProps) {
  return (
    <div className={`relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6 ${className}`}>
      {children}
    </div>
  )
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogHeader({ children, className = '' }: AlertDialogHeaderProps) {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>
      {children}
    </div>
  )
}

interface AlertDialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogTitle({ children, className = '' }: AlertDialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  )
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogDescription({ children, className = '' }: AlertDialogDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

interface AlertDialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogFooter({ children, className = '' }: AlertDialogFooterProps) {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`}>
      {children}
    </div>
  )
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function AlertDialogAction({ children, className = '', ...props }: AlertDialogActionProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function AlertDialogCancel({ children, className = '', ...props }: AlertDialogCancelProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 mt-2 sm:mt-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Trigger component for completeness
interface AlertDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function AlertDialogTrigger({ children }: AlertDialogTriggerProps) {
  return <>{children}</>
}
