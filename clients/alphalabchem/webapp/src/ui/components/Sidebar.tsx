// Compatibility shim. Sidebar now lives in @lwm/ui.
// Template-side wrapper that defaults to the template's navigationConfig
// while still letting a caller override it.
'use client'

import { Sidebar as SidebarBase, type NavigationConfig } from '@lwm/ui'
import {
  adminNavigation,
  customerNavigation,
  customerExtraLinks,
} from '@/config/navigationConfig'

const defaultNavigationConfig: NavigationConfig = {
  admin: adminNavigation,
  customer: customerNavigation,
  customerExtraLinks,
}

export default function Sidebar({ navigationConfig }: { navigationConfig?: NavigationConfig } = {}) {
  return <SidebarBase navigationConfig={navigationConfig ?? defaultNavigationConfig} />
}
