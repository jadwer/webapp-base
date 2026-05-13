'use client'

import { useMemo } from 'react'
import { useAuth, isAdmin, hasAnyRole, hasAnyPermission } from '@lwm/auth'

// ============================================
// Types
// ============================================

export interface NavigationItem {
  href: string
  label: string
  icon: string           // Bootstrap Icon class (bi-*)
  permissions: string[]  // OR logic - empty = visible to anyone in the audience
  /**
   * Optional `target` for the rendered anchor. When set (typically `_blank`),
   * the Sidebar will pass it through to the `<a>` tag. Leave undefined for
   * default same-tab navigation handled by Next.js `<Link>`.
   */
  target?: '_blank' | '_self' | '_parent' | '_top'
  /**
   * Marks the link as pointing to an external URL. When true, the Sidebar
   * renders a plain `<a>` (with rel="noopener noreferrer") instead of a
   * Next.js `<Link>`, so the browser performs a full navigation rather than
   * client-side routing.
   */
  external?: boolean
}

export interface NavigationGroup {
  key: string
  label: string
  icon: string
  activePathPrefixes: string[]
  items: NavigationItem[]
  permissions: string[]
  badge?: { text: string; color: string }
}

export interface DisabledModule {
  key: string
  label: string
  icon: string
  tooltip: string
}

export interface NavigationSection {
  audience: 'admin' | 'customer'
  topLinks: NavigationItem[]
  groups: NavigationGroup[]
  disabledModules: DisabledModule[]
}

export interface NavigationConfig {
  /** Sections shown to admin/god users (bypasses permission filtering). */
  admin: NavigationSection
  /** Sections shown to customer-role users (filtered by permissions). */
  customer: NavigationSection
  /** Extra links appended to the customer view (e.g. "ofertas", "newsletter"). */
  customerExtraLinks?: NavigationItem[]
}

export interface UseNavigationResult {
  topLinks: NavigationItem[]
  groups: NavigationGroup[]
  disabledModules: DisabledModule[]
  extraLinks: NavigationItem[]
  isCustomer: boolean
  isUserAdmin: boolean
  title: string
}

// ============================================
// Hook
// ============================================

/**
 * Resolves the current user's navigation tree from a tenant-supplied
 * navigation config. The config (admin/customer sections + extra links)
 * lives in the consumer app — apps/template provides one and each
 * `clients/<name>/` repo can ship its own to override modules.
 *
 * Admin/god roles bypass permission filtering entirely. Customer roles
 * have items filtered by `hasAnyPermission(user, item.permissions)`;
 * groups with zero visible items are dropped.
 */
export function useNavigation(config: NavigationConfig): UseNavigationResult {
  const { user } = useAuth()

  return useMemo(() => {
    const empty: UseNavigationResult = {
      topLinks: [],
      groups: [],
      disabledModules: [],
      extraLinks: [],
      isCustomer: false,
      isUserAdmin: false,
      title: '',
    }

    if (!user) return empty

    const userIsAdmin = isAdmin(user)
    const userIsCustomer = hasAnyRole(user, ['customer', 'cliente'])

    const section = userIsAdmin ? config.admin : userIsCustomer ? config.customer : null
    if (!section) return empty

    // Admin/god bypasses ALL permission checks.
    if (userIsAdmin) {
      return {
        topLinks: section.topLinks,
        groups: section.groups,
        disabledModules: section.disabledModules,
        extraLinks: [],
        isCustomer: false,
        isUserAdmin: true,
        title: 'Menú Admin',
      }
    }

    const filterItems = (items: NavigationItem[]): NavigationItem[] =>
      items.filter(
        (item) =>
          item.permissions.length === 0 || hasAnyPermission(user, item.permissions)
      )

    const filterGroups = (groups: NavigationGroup[]): NavigationGroup[] =>
      groups
        .map((group) => ({ ...group, items: filterItems(group.items) }))
        .filter((group) => group.items.length > 0)

    return {
      topLinks: filterItems(section.topLinks),
      groups: filterGroups(section.groups),
      disabledModules: section.disabledModules,
      extraLinks: userIsCustomer ? config.customerExtraLinks ?? [] : [],
      isCustomer: userIsCustomer,
      isUserAdmin: false,
      title: 'Mi Portal',
    }
  }, [user, config])
}
