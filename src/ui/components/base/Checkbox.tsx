'use client'

import React, { forwardRef, InputHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Checkbox.module.scss'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string
  description?: string
  helpText?: string
  errorText?: string
  size?: 'small' | 'medium' | 'large'
  required?: boolean
  indeterminate?: boolean
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  helpText,
  errorText,
  size = 'medium',
  required = false,
  indeterminate = false,
  className,
  id,
  disabled,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(errorText)

  // Handle indeterminate state
  React.useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.indeterminate = indeterminate
    }
  }, [indeterminate, ref])

  const wrapperClasses = clsx(
    styles.checkboxWrapper,
    {
      [styles.disabled]: disabled,
      [styles.error]: hasError,
    }
  )

  const groupClasses = clsx(
    styles.checkboxGroup,
    {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
    },
    className
  )

  return (
    <div className={groupClasses}>
      <label htmlFor={checkboxId} className={wrapperClasses}>
        <div className={styles.checkbox}>
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={styles.input}
            disabled={disabled}
            required={required}
            {...props}
          />
          <span className={styles.checkmark}></span>
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
      
      {helpText && !errorText && (
        <p className={styles.helpText}>{helpText}</p>
      )}
      
      {errorText && (
        <p className={styles.errorText}>{errorText}</p>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

// Checkbox Group Component for multiple checkboxes
export interface CheckboxGroupProps {
  children: React.ReactNode
  className?: string
  layout?: 'vertical' | 'horizontal' | 'grid'
  label?: string
  helpText?: string
  errorText?: string
  required?: boolean
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  className,
  layout = 'vertical',
  label,
  helpText,
  errorText,
  required = false,
}) => {
  const groupClasses = clsx(
    styles.checkboxGroup,
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
      
      <div className={groupClasses}>
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