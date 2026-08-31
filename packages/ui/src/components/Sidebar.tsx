'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavigationProgress from './NavigationProgress'
import { useAuth } from '@lwm/auth'
import { useNavigation, type NavigationItem, type NavigationConfig } from '../hooks/useNavigation'
import styles from '../styles/modules/Sidebar.module.scss'

export interface SidebarProps {
  /**
   * Tenant-specific navigation config (admin/customer sections, extra
   * links). The template provides one; each `clients/<name>/` repo can
   * ship its own to override modules without forking this component.
   */
  navigationConfig: NavigationConfig
}

export default function Sidebar({ navigationConfig }: SidebarProps) {
  const pathname = usePathname()
  const { user, isLoading: authLoading } = useAuth()
  const { topLinks, groups, disabledModules, extraLinks, isCustomer, isUserAdmin, title } = useNavigation(navigationConfig)
  const [open, setOpen] = useState(false)

  // Dynamic collapse state: one Record instead of 18+ useState hooks
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  // Initialize auto-expand based on current pathname (only on mount)
  useEffect(() => {
    const initial: Record<string, boolean> = {}
    groups.forEach(group => {
      initial[group.key] = group.activePathPrefixes.some(prefix => pathname?.startsWith(prefix))
    })
    setOpenGroups(initial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups])

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Helper: render an anchor or Next Link based on the item's `external`
  // flag. External links use a plain <a> with rel="noopener noreferrer"
  // (mandatory when target="_blank") so the browser performs a full
  // navigation; internal links go through Next's <Link> for client-side
  // routing. `target` is honored for both.
  const renderLinkBody = (icon: string, iconClassName: string, label: string) => (
    <>
      <i className={`bi ${icon} ${iconClassName}`} aria-hidden="true"></i>
      {label}
    </>
  )

  const renderItemLink = (
    item: NavigationItem,
    className: string,
    iconClassName: string,
  ) => {
    const body = renderLinkBody(item.icon, iconClassName, item.label)
    if (item.external) {
      return (
        <a
          href={item.href}
          className={className}
          target={item.target ?? '_blank'}
          rel="noopener noreferrer"
        >
          {body}
        </a>
      )
    }
    return (
      <Link href={item.href} className={className} target={item.target}>
        {body}
      </Link>
    )
  }

  // Helper: render a collapsible group
  const renderGroup = (
    key: string,
    label: string,
    icon: string,
    isOpen: boolean,
    toggle: () => void,
    links: NavigationItem[],
    badge?: { text: string; color: string },
    quickCreateHref?: string
  ) => (
    <li className={styles.navItem} key={key}>
      <div className={styles.groupButton} style={{ display: 'flex', alignItems: 'stretch', padding: 0 }}>
        <button
          className={`${styles.groupButton} ${isOpen ? styles.groupActive : ''}`}
          style={{ flex: 1, border: 'none' }}
          onClick={toggle}
        >
          <div className={styles.groupContent}>
            <i className={`bi ${icon}`} aria-hidden="true"></i>
            {label}
            {badge && (
              <span
                className={styles.badge}
                style={{
                  backgroundColor: badge.color,
                  marginLeft: '8px',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  color: 'white'
                }}
              >
                {badge.text}
              </span>
            )}
          </div>
          <i className={`bi bi-chevron-right ${styles.groupChevron} ${isOpen ? styles.expanded : ''}`}></i>
        </button>

        {quickCreateHref && (
          <Link
            href={quickCreateHref}
            title={`Crear nuevo (${label})`}
            aria-label={`Crear nuevo en ${label}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              flexShrink: 0,
              color: 'inherit',
              textDecoration: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <i className="bi bi-plus-circle" aria-hidden="true"></i>
          </Link>
        )}
      </div>

      <div className={`${styles.subMenu} ${isOpen ? styles.expanded : styles.collapsed}`}>
        <ul className={styles.subNavList}>
          {links.map((item) => (
            <li key={item.href} style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ flex: 1 }}>
                {renderItemLink(
                  item,
                  `${styles.subNavLink} ${pathname === item.href ? styles.active : ''}`,
                  styles.subNavIcon,
                )}
              </div>
              {/* "+" de alta directa por item (mismo patron que topLinks) */}
              {item.quickCreateHref && (
                <Link
                  href={item.quickCreateHref}
                  title={`Crear nuevo (${item.label})`}
                  aria-label={`Crear nuevo en ${item.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    flexShrink: 0,
                    color: 'inherit',
                    textDecoration: 'none'
                  }}
                >
                  <i className="bi bi-plus-circle" aria-hidden="true"></i>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )

  // Loading state
  if (authLoading) {
    return (
      <>
        <NavigationProgress />
        <aside className={styles.sidebar}>
          <div className={styles.header}>
            <h6 className={styles.title}>Cargando...</h6>
          </div>
          <nav className={styles.navigation}>
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
            </div>
          </nav>
        </aside>
      </>
    )
  }

  return (
    <>
      <NavigationProgress />

      <button
        className={styles.toggleButton}
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-list"></i>
      </button>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <h6 className={styles.title}>{title || 'Menú'}</h6>
          {user && (
            <small className="text-muted d-block" style={{ fontSize: '11px', marginTop: '4px' }}>
              {user.name || user.email}
            </small>
          )}
        </div>

        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {/* Top links (Panel Principal, Mi perfil, Usuarios...) */}
            {topLinks.map((item) => (
              <li className={styles.navItem} key={item.href} style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ flex: 1 }}>
                  {renderItemLink(
                    item,
                    `${styles.navLink} ${
                      (pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))) ? styles.active : ''
                    }`,
                    styles.navIcon,
                  )}
                </div>
                {item.quickCreateHref && (
                  <Link
                    href={item.quickCreateHref}
                    title={`Crear nuevo (${item.label})`}
                    aria-label={`Crear nuevo en ${item.label}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      flexShrink: 0,
                      color: 'inherit',
                      textDecoration: 'none'
                    }}
                  >
                    <i className="bi bi-plus-circle" aria-hidden="true"></i>
                  </Link>
                )}
              </li>
            ))}

            {/* Customer-specific: portal group + extra links */}
            {isCustomer && !isUserAdmin && (
              <>
                {groups.map(group => renderGroup(
                  group.key,
                  group.label,
                  group.icon,
                  openGroups[group.key] ?? false,
                  () => toggleGroup(group.key),
                  group.items,
                  group.badge,
                  group.quickCreateHref
                ))}

                {extraLinks.map((item) => (
                  <li className={styles.navItem} key={item.href}>
                    {renderItemLink(item, styles.navLink, styles.navIcon)}
                  </li>
                ))}
              </>
            )}

            {/* Admin: all groups */}
            {isUserAdmin && (
              <>
                {groups.map(group => renderGroup(
                  group.key,
                  group.label,
                  group.icon,
                  openGroups[group.key] ?? false,
                  () => toggleGroup(group.key),
                  group.items,
                  group.badge,
                  group.quickCreateHref
                ))}

                {/* Disabled modules separator */}
                {disabledModules.length > 0 && (
                  <>
                    <li className={styles.navItem} style={{ margin: '16px 0', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '16px' }}>
                      <div style={{ padding: '0 16px', color: '#6c757d', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Próximamente
                      </div>
                    </li>

                    {disabledModules.map(mod => (
                      <li className={styles.navItem} key={mod.key}>
                        <button
                          className={`${styles.groupButton} ${styles.disabled}`}
                          disabled
                          title={mod.tooltip}
                          style={{ cursor: 'not-allowed', opacity: 0.5 }}
                        >
                          <div className={styles.groupContent}>
                            <i className={`bi ${mod.icon}`} aria-hidden="true"></i>
                            {mod.label}
                            <span
                              className={styles.badge}
                              style={{
                                backgroundColor: '#6c757d',
                                marginLeft: '8px',
                                fontSize: '9px',
                                padding: '2px 5px',
                                borderRadius: '8px',
                                color: 'white'
                              }}
                            >
                              PRÓXIMAMENTE
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Fallback: user with no recognized role */}
            {!isUserAdmin && !isCustomer && user && (
              <li className={styles.navItem}>
                <div style={{ padding: '16px', color: '#6c757d', fontSize: '13px' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Contacta al administrador para obtener acceso a más funciones.
                </div>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  )
}
