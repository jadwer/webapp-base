// Compatibility shim. DashboardLayout now lives in @lwm/ui.
// Template-side wrapper that defaults to the template's navigationConfig
// while still letting a caller override it (a clients/<name>/ page that
// renders the layout with its own modules).
'use client'

import {
  DashboardLayout as DashboardLayoutBase,
  type DashboardLayoutProps,
  type NavigationConfig,
} from '@lwm/ui'
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

export default function DashboardLayout({
  children,
  navigationConfig,
}: Omit<DashboardLayoutProps, 'navigationConfig'> & {
  navigationConfig?: NavigationConfig
}) {
  return (
    <DashboardLayoutBase navigationConfig={navigationConfig ?? defaultNavigationConfig}>
      {children}
    </DashboardLayoutBase>
  )
}
