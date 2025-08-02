'use client'

import React, { forwardRef } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/ToggleSwitch.module.scss'

export interface ToggleSwitchProps {
  id?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  label?: string
  description?: string
  leftIcon?: string
  rightIcon?: string
  className?: string
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(({
  id,
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  label,
  description,
  leftIcon,
  rightIcon,
  className
}, ref) => {
  const switchId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  const containerClasses = clsx(
    styles.container,
    styles[size],
    {
      [styles.disabled]: disabled,
      [styles.checked]: checked,
      [styles.withIcons]: leftIcon || rightIcon
    },
    className
  )

  return (
    <div className={containerClasses}>
      <div className={styles.switchContainer}>
        <label htmlFor={switchId} className={styles.switch}>
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className={styles.input}
            aria-describedby={description ? `${switchId}-desc` : undefined}
          />
          <span className={styles.slider}>
            <span className={styles.knob}>
              {leftIcon && checked && (
                <i className={clsx('bi', leftIcon)} aria-hidden="true" />
              )}
              {rightIcon && !checked && (
                <i className={clsx('bi', rightIcon)} aria-hidden="true" />
              )}
            </span>
          </span>
        </label>
      </div>
      
      {(label || description) && (
        <div className={styles.content}>
          {label && (
            <div className={styles.label}>
              {label}
            </div>
          )}
          {description && (
            <div className={styles.description} id={`${switchId}-desc`}>
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

ToggleSwitch.displayName = 'ToggleSwitch'