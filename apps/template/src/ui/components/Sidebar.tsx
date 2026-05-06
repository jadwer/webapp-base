'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavigationProgress from './NavigationProgress'
import { useAuth } from '@/modules/auth'
import { useNavigation } from '@/hooks/useNavigation'
import type { NavigationItem } from '@/config/navigationConfig'
import styles from '@/ui/styles/modules/Sidebar.module.scss'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, isLoading: authLoading } = useAuth()
  const { topLinks, groups, disabledModules, extraLinks, isCustomer, isUserAdmin, title } = useNavigation()
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

  // Helper: render a collapsible group
  const renderGroup = (
    key: string,
    label: string,
    icon: string,
    isOpen: boolean,
    toggle: () => void,
    links: NavigationItem[],
    badge?: { text: string; color: string }
  ) => (
    <li className={styles.navItem} key={key}>
      <button
        className={`${styles.groupButton} ${isOpen ? styles.groupActive : ''}`}
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

      <div className={`${styles.subMenu} ${isOpen ? styles.expanded : styles.collapsed}`}>
        <ul className={styles.subNavList}>
          {links.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.subNavLink} ${pathname === href ? styles.active : ''}`}
              >
                <i className={`bi ${icon} ${styles.subNavIcon}`} aria-hidden="true"></i>
                {label}
              </Link>
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
            {topLinks.map(({ href, label, icon }) => (
              <li className={styles.navItem} key={href}>
                <Link
                  href={href}
                  className={`${styles.navLink} ${
                    (pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))) ? styles.active : ''
                  }`}
                >
                  <i className={`bi ${icon} ${styles.navIcon}`} aria-hidden="true"></i>
                  {label}
                </Link>
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
                  group.badge
                ))}

                {extraLinks.map(({ href, label, icon }) => (
                  <li className={styles.navItem} key={href}>
                    <Link href={href} className={styles.navLink}>
                      <i className={`bi ${icon} ${styles.navIcon}`} aria-hidden="true"></i>
                      {label}
                    </Link>
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
                  group.badge
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
