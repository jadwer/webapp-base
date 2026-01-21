'use client'

import * as React from 'react'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = '', orientation = 'horizontal', decorative = true, ...props }, ref) => {
    const baseClasses = 'shrink-0 bg-border'
    const orientationClasses = orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={`${baseClasses} ${orientationClasses} ${className}`}
        {...props}
      />
    )
  }
)
Separator.displayName = 'Separator'

export { Separator }
