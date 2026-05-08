'use client'

import { AuthenticatedLayout } from '@lwm/auth'
import { DashboardLayout, type NavigationConfig } from '@lwm/ui'
import {
  adminNavigation,
  customerNavigation,
  customerExtraLinks,
} from '@/config/navigationConfig'

const navigationConfig: NavigationConfig = {
  admin: adminNavigation,
  customer: customerNavigation,
  customerExtraLinks,
}

export default function BackLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedLayout>
      <DashboardLayout navigationConfig={navigationConfig}>{children}</DashboardLayout>
    </AuthenticatedLayout>
  )
}
