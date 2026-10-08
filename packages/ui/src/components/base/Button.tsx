'use client'

import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from '../../styles/modules/Button.module.scss'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Contenido del botón */
  children?: ReactNode
  /** Variante visual del botón */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  /** Estilo del botón */
  buttonStyle?: 'filled' | 'outline' | 'ghost'
  /** Tamaño del botón */
  size?: 'small' | 'medium' | 'large' | 'xl'
  /** Estado de carga */
  loading?: boolean
  /** Estado de carga (alias para loading) */
  isLoading?: boolean
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
      isLoading = false,
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
    // Un boton de solo icono necesita nombre accesible: si no trae aria-label se toma de title
    const ariaLabel =
      props['aria-label'] ?? (iconOnly && typeof props.title === 'string' ? props.title : undefined)
    if (
      iconOnly &&
      !ariaLabel &&
      !props['aria-labelledby'] &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn('[Button] iconOnly sin aria-label ni title: el boton queda sin nombre accesible')
    }
    // isLoading is an alias for loading
    const isLoadingState = loading || isLoading
    const buttonClassName = clsx(
      styles.button,
      styles[size],
      styles[variant],
      {
        [styles.outline]: buttonStyle === 'outline',
        [styles.ghost]: buttonStyle === 'ghost',
        [styles.loading]: isLoadingState,
        [styles.fullWidth]: fullWidth,
        [styles.iconOnly]: iconOnly,
      },
      className
    )

    return (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={disabled || isLoadingState}
        {...props}
        aria-label={ariaLabel}
      >
        {startIcon && !isLoadingState && (
          <span className={styles.icon}>{startIcon}</span>
        )}
        
        {children && !iconOnly && (
          <span className={styles.content}>{children}</span>
        )}
        
        {iconOnly && !isLoadingState && children}
        
        {endIcon && !isLoadingState && (
          <span className={styles.icon}>{endIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button