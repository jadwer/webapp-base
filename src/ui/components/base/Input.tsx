'use client'

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, useState } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Input.module.scss'

// Base Input Props
interface BaseInputProps {
  label?: string
  helpText?: string
  errorText?: string
  successText?: string
  size?: 'small' | 'medium' | 'large' | 'xl'
  variant?: 'default' | 'floating'
  leftIcon?: string
  rightIcon?: string
  loading?: boolean
  required?: boolean
  className?: string
  options?: { value: string; label: string }[]
  multiple?: boolean
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
  type = 'text',
  options,
  multiple,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(errorText)
  const hasSuccess = Boolean(successText) && !hasError
  const isFloating = variant === 'floating'
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const isSelect = type === 'select'
  
  // Determinar el tipo real del input
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

  const inputClasses = clsx(
    isSelect ? styles.select : styles.input,
    {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.xl]: size === 'xl',
      [styles.error]: hasError,
      [styles.success]: hasSuccess,
      [styles.hasLeftIcon]: leftIcon,
      [styles.hasRightIcon]: rightIcon || loading || isPassword,
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

  // Función para toggle de password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Renderizar select si es tipo select
  if (isSelect) {
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
            <i 
              className={clsx('bi', leftIcon, styles.icon, styles.left)} 
              aria-hidden="true"
            />
          )}
          
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={inputId}
            className={inputClasses}
            required={required}
            multiple={multiple}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
  }

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
          <i 
            className={clsx('bi', leftIcon, styles.icon, styles.left)} 
            aria-hidden="true"
          />
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={actualType}
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
        
        {/* Password toggle button */}
        {isPassword && (
          <button
            type="button"
            className={clsx(styles.icon, styles.right, styles.passwordToggle)}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <i 
              className={clsx('bi', showPassword ? 'bi-eye-slash' : 'bi-eye')} 
              aria-hidden="true" 
            />
          </button>
        )}
        
        {rightIcon && !loading && !isPassword && (
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
      [styles.xl]: size === 'xl',
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
      [styles.xl]: size === 'xl',
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