'use client'

import React, { forwardRef, InputHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Switch.module.scss'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string
  description?: string
  helpText?: string
  errorText?: string
  successText?: string
  size?: 'small' | 'medium' | 'large'
  alignment?: 'start' | 'center' | 'end'
  loading?: boolean
  withIcons?: boolean
  onIcon?: string
  offIcon?: string
  required?: boolean
  className?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  description,
  helpText,
  errorText,
  successText,
  size = 'medium',
  alignment = 'start',
  loading = false,
  withIcons = false,
  onIcon = 'bi-check',
  offIcon = 'bi-x',
  required = false,
  className,
  id,
  disabled,
  checked,
  ...props
}, ref) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(errorText)
  const hasSuccess = Boolean(successText && !hasError)

  const wrapperClasses = clsx(
    styles.switchWrapper,
    {
      [styles.disabled]: disabled,
      [styles.alignStart]: alignment === 'start',
      [styles.alignCenter]: alignment === 'center',
      [styles.alignEnd]: alignment === 'end',
    }
  )

  const groupClasses = clsx(
    styles.switchGroup,
    {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.error]: hasError,
      [styles.success]: hasSuccess,
      [styles.loading]: loading,
      [styles.withIcons]: withIcons,
    },
    className
  )

  return (
    <div className={groupClasses}>
      <label htmlFor={switchId} className={wrapperClasses}>
        <div className={styles.switch}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            className={styles.input}
            disabled={disabled || loading}
            checked={checked}
            {...props}
          />
          <span className={styles.track}>
            {withIcons && (
              <>
                <i className={clsx('bi', onIcon, styles.onIcon)} aria-hidden="true" />
                <i className={clsx('bi', offIcon, styles.offIcon)} aria-hidden="true" />
              </>
            )}
          </span>
        </div>
        
        {(label || description) && (
          <div className={styles.content}>
            {label && (
              <div className={clsx(styles.label, { [styles.required]: required })}>
                {label}
              </div>
            )}
            {description && (
              <div className={styles.description}>
                {description}
              </div>
            )}
          </div>
        )}
      </label>
      
      {helpText && !errorText && !successText && (
        <p className={styles.helpText}>{helpText}</p>
      )}
      
      {errorText && (
        <p className={styles.errorText}>{errorText}</p>
      )}
      
      {successText && !errorText && (
        <p className={styles.successText}>{successText}</p>
      )}
    </div>
  )
})

Switch.displayName = 'Switch'

// Switch Group Component for multiple switches
export interface SwitchGroupProps {
  children: React.ReactNode
  className?: string
  layout?: 'vertical' | 'horizontal' | 'grid'
  label?: string
  helpText?: string
  errorText?: string
  required?: boolean
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  children,
  className,
  layout = 'vertical',
  label,
  helpText,
  errorText,
  required = false,
}) => {
  const groupClasses = clsx(
    styles.switchGroup,
    {
      [styles.horizontal]: layout === 'horizontal',
      [styles.grid]: layout === 'grid',
    },
    className
  )

  return (
    <div className={groupClasses}>
      {label && (
        <div className={clsx(styles.label, { [styles.required]: required })}>
          {label}
        </div>
      )}
      
      <div>
        {children}
      </div>
      
      {helpText && !errorText && (
        <p className={styles.helpText}>{helpText}</p>
      )}
      
      {errorText && (
        <p className={styles.errorText}>{errorText}</p>
      )}
    </div>
  )
}