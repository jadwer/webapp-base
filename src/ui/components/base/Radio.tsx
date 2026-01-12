'use client'

import React, { forwardRef, InputHTMLAttributes, useId } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/Radio.module.scss'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string
  description?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  description,
  size = 'medium',
  className,
  id,
  disabled,
  checked,
  ...props
}, ref) => {
  const generatedId = useId()
  const radioId = id || `radio-${generatedId}`

  const wrapperClasses = clsx(
    styles.radioWrapper,
    {
      [styles.disabled]: disabled,
      [styles.selected]: checked,
    }
  )

  const radioClasses = clsx(
    styles.radio,
    {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
    },
    className
  )

  return (
    <label htmlFor={radioId} className={wrapperClasses}>
      <div className={radioClasses}>
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={styles.input}
          disabled={disabled}
          checked={checked}
          {...props}
        />
        <span className={styles.radiomark}></span>
      </div>
      
      {(label || description) && (
        <div className={styles.content}>
          {label && (
            <div className={styles.label}>
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
  )
})

Radio.displayName = 'Radio'

// Radio Group Component
export interface RadioGroupProps {
  children: React.ReactNode
  className?: string
  layout?: 'vertical' | 'horizontal' | 'grid' | 'inline'
  variant?: 'default' | 'card'
  label?: string
  helpText?: string
  errorText?: string
  required?: boolean
  size?: 'small' | 'medium' | 'large'
  name?: string
  value?: string
  onChange?: (value: string) => void
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  className,
  layout = 'vertical',
  variant = 'default',
  label,
  helpText,
  errorText,
  required = false,
  size = 'medium',
  name,
  value,
  onChange,
}) => {
  const hasError = Boolean(errorText)

  const groupClasses = clsx(
    styles.radioGroup,
    {
      [styles.horizontal]: layout === 'horizontal',
      [styles.grid]: layout === 'grid',
      [styles.inline]: layout === 'inline',
      [styles.cardVariant]: variant === 'card',
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.error]: hasError,
    },
    className
  )

  // Clone children and add common props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Radio) {
      const childProps = child.props as RadioProps
      return React.cloneElement(child as React.ReactElement<RadioProps>, {
        name: name || childProps.name,
        size: size,
        checked: value ? childProps.value === value : childProps.checked,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (onChange && e.target.value) {
            onChange(e.target.value)
          }
          if (childProps.onChange) {
            childProps.onChange(e)
          }
        },
      })
    }
    return child
  })

  return (
    <div className={groupClasses}>
      {label && (
        <div className={clsx(styles.groupLabel, { [styles.required]: required })}>
          {label}
        </div>
      )}
      
      <div className={clsx({
        [styles.horizontal]: layout === 'horizontal',
        [styles.grid]: layout === 'grid', 
        [styles.inline]: layout === 'inline'
      })}>
        {enhancedChildren}
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

// Radio Option Component for easier usage
export interface RadioOptionProps extends Omit<RadioProps, 'name'> {
  value: string
}

export const RadioOption: React.FC<RadioOptionProps> = (props) => {
  return <Radio {...props} />
}