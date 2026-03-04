import { useMemo } from 'react'
import { useAuth } from '@/modules/auth'
import { isAdmin, hasAnyRole, hasAnyPermission } from '@/lib/permissions'
import {
  adminNavigation,
  customerNavigation,
  customerExtraLinks,
  type NavigationGroup,
  type NavigationItem,
  type DisabledModule,
} from '@/config/navigationConfig'

export interface UseNavigationResult {
  topLinks: NavigationItem[]
  groups: NavigationGroup[]
  disabledModules: DisabledModule[]
  extraLinks: NavigationItem[]
  isCustomer: boolean
  isUserAdmin: boolean
  title: string
}

export function useNavigation(): UseNavigationResult {
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

    const config = userIsAdmin ? adminNavigation : userIsCustomer ? customerNavigation : null
    if (!config) return empty

    // Admin/god bypasses ALL permission checks
    if (userIsAdmin) {
      return {
        topLinks: config.topLinks,
        groups: config.groups,
        disabledModules: config.disabledModules,
        extraLinks: [],
        isCustomer: false,
        isUserAdmin: true,
        title: 'Menú Admin',
      }
    }

    // Filter items by permission
    const filterItems = (items: NavigationItem[]): NavigationItem[] =>
      items.filter(item => item.permissions.length === 0 || hasAnyPermission(user, item.permissions))

    const filterGroups = (groups: NavigationGroup[]): NavigationGroup[] =>
      groups
        .map(group => ({ ...group, items: filterItems(group.items) }))
        .filter(group => group.items.length > 0)

    return {
      topLinks: filterItems(config.topLinks),
      groups: filterGroups(config.groups),
      disabledModules: config.disabledModules,
      extraLinks: userIsCustomer ? customerExtraLinks : [],
      isCustomer: userIsCustomer,
      isUserAdmin: false,
      title: 'Mi Portal',
    }
  }, [user])
}
