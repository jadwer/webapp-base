'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export interface TabNavItem {
  key: string
  label: ReactNode
  /** Modo enlace: activo cuando usePathname() coincide exacto */
  href?: string
  icon?: string
  count?: number
}

export interface TabNavProps {
  tabs: TabNavItem[]
  /** Modo estado: pestana activa controlada por el padre */
  activeKey?: string
  onChange?: (key: string) => void
  className?: string
}

export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeKey,
  onChange,
  className = 'nav nav-tabs mb-3',
}) => {
  const pathname = usePathname()

  const content = (tab: TabNavItem) => (
    <>
      {tab.icon && <i className={clsx('bi', tab.icon, 'me-1')} aria-hidden="true" />}
      {tab.label}
      {tab.count != null && (
        <span className="badge bg-secondary ms-2">{tab.count}</span>
      )}
    </>
  )

  return (
    <ul className={className} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeKey != null ? tab.key === activeKey : tab.href != null && pathname === tab.href
        const linkClass = clsx('nav-link', isActive && 'active')

        return (
          <li key={tab.key} className="nav-item" role="presentation">
            {tab.href ? (
              <Link
                href={tab.href}
                className={linkClass}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
              >
                {content(tab)}
              </Link>
            ) : (
              <button
                type="button"
                className={linkClass}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange?.(tab.key)}
              >
                {content(tab)}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default TabNav
