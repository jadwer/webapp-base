'use client'

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Input.module.scss'

// Base Input Props
interface BaseInputProps {
  label?: string
  helpText?: string
  errorText?: string
  successText?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'floating'
  leftIcon?: string
  rightIcon?: string
  loading?: boolean
  required?: boolean
  className?: string
}

// Input Component
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helpText,
  errorText,
  successText,
  size = 'medium',
  variant = 'default',
  leftIcon,
  rightIcon,
  loading = false,
  required = false,
  className,
  id,
  placeholder,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(errorText)
  const hasSuccess = Boolean(successText) && !hasError
  const isFloating = variant === 'floating'

  const inputClasses = clsx(
    styles.input,
    {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.error]: hasError,
      [styles.success]: hasSuccess,
      [styles.hasLeftIcon]: leftIcon,
      [styles.hasRightIcon]: rightIcon || loading,
    }
  )

  const groupClasses = clsx(
    styles.inputGroup,
    {
      [styles.floatingLabel]: isFloating,
      [styles.loading]: loading,
    },
    className
  )

  return (
    <div className={groupClasses}>
      {label && !isFloating && (
        <label 
          htmlFor={inputId} 
          className={clsx(styles.label, { [styles.required]: required })}
        >
          {label}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {leftIcon && (
          <i className={clsx('bi', leftIcon, styles.icon, styles.left)} aria-hidden="true" />
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          placeholder={isFloating ? ' ' : placeholder}
          required={required}
          {...props}
        />
        
        {isFloating && label && (
          <label 
            htmlFor={inputId} 
            className={clsx(styles.label, { [styles.required]: required })}
          >
            {label}
          </label>
        )}
        
        {rightIcon && !loading && (
          <i className={clsx('bi', rightIcon, styles.icon, styles.right)} aria-hidden="true" />
        )}
      </div>
      
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

Input.displayName = 'Input'

// Textarea Component
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, BaseInputProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helpText,
  errorText,
  successText,
  size = 'medium',
  required = false,
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(errorText)
  const hasSuccess = Boolean(successText) && !hasError

  const textareaClasses = clsx(
    styles.textarea,
    {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.error]: hasError,
      [styles.success]: hasSuccess,
    }
  )

  return (
    <div className={clsx(styles.inputGroup, className)}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className={clsx(styles.label, { [styles.required]: required })}
        >
          {label}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          required={required}
          {...props}
        />
      </div>
      
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

Textarea.displayName = 'Textarea'

// Select Component
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>, BaseInputProps {
  children: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helpText,
  errorText,
  successText,
  size = 'medium',
  required = false,
  className,
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(errorText)
  const hasSuccess = Boolean(successText) && !hasError

  const selectClasses = clsx(
    styles.select,
    {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.error]: hasError,
      [styles.success]: hasSuccess,
    }
  )

  return (
    <div className={clsx(styles.inputGroup, className)}>
      {label && (
        <label 
          htmlFor={selectId} 
          className={clsx(styles.label, { [styles.required]: required })}
        >
          {label}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          required={required}
          {...props}
        >
          {children}
        </select>
      </div>
      
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

Select.displayName = 'Select'