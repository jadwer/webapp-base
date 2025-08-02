'use client'

import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Button.module.scss'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Contenido del botón */
  children?: ReactNode
  /** Variante visual del botón */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  /** Estilo del botón */
  buttonStyle?: 'filled' | 'outline' | 'ghost'
  /** Tamaño del botón */
  size?: 'small' | 'medium' | 'large'
  /** Estado de carga */
  loading?: boolean
  /** Botón de ancho completo */
  fullWidth?: boolean
  /** Solo icono (sin texto) */
  iconOnly?: boolean
  /** Icono al inicio */
  startIcon?: ReactNode
  /** Icono al final */
  endIcon?: ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      buttonStyle = 'filled',
      size = 'medium',
      loading = false,
      fullWidth = false,
      iconOnly = false,
      startIcon,
      endIcon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const buttonClassName = clsx(
      styles.button,
      styles[size],
      styles[variant],
      {
        [styles.outline]: buttonStyle === 'outline',
        [styles.ghost]: buttonStyle === 'ghost',
        [styles.loading]: loading,
        [styles.fullWidth]: fullWidth,
        [styles.iconOnly]: iconOnly,
      },
      className
    )

    return (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={disabled || loading}
        {...props}
      >
        {startIcon && !loading && (
          <span className={styles.icon}>{startIcon}</span>
        )}
        
        {children && !iconOnly && (
          <span className={styles.content}>{children}</span>
        )}
        
        {iconOnly && !loading && children}
        
        {endIcon && !loading && (
          <span className={styles.icon}>{endIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button