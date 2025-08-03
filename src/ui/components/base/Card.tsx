'use client'

import React, { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Card.module.scss'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Contenido del card */
  children: ReactNode
  /** Variante visual del card */
  variant?: 'elevated' | 'outlined' | 'flat'
  /** Espaciado interno */
  padding?: 'compact' | 'comfortable' | 'spacious'
  /** Card interactivo (clickeable) */
  interactive?: boolean
  /** Estado de carga */
  loading?: boolean
  /** Card deshabilitado */
  disabled?: boolean
  /** Función onClick para cards interactivos */
  onCardClick?: () => void
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'elevated',
      padding = 'comfortable',
      interactive = false,
      loading = false,
      disabled = false,
      onCardClick,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const cardClassName = clsx(
      styles.card,
      styles[variant],
      styles[padding],
      {
        [styles.interactive]: interactive,
        [styles.loading]: loading,
        [styles.disabled]: disabled,
      },
      className
    )

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || loading) return
      
      if (onCardClick) {
        onCardClick()
      }
      
      if (onClick) {
        onClick(event)
      }
    }

    return (
      <div
        ref={ref}
        className={cardClassName}
        onClick={interactive ? handleClick : onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive && !disabled ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                  e.preventDefault()
                  handleClick(e as unknown as React.MouseEvent<HTMLDivElement>)
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
)

const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  )
)

const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.footer, className)} {...props}>
      {children}
    </div>
  )
)

const CardMedia = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt, ...props }, ref) => (
    <div className={styles.mediaContainer}>
      <img 
        ref={ref} 
        className={clsx(styles.media, className)} 
        alt={alt}
        {...props}
      />
    </div>
  )
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'
CardMedia.displayName = 'CardMedia'

export { Card, CardHeader, CardContent, CardFooter, CardMedia }
export default Card