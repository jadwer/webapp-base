'use client'

import { SystemHealthAdminPage } from '@/modules/system-health'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function SystemHealthPage() {
  return (
    <DynamicRoleGuard path="/dashboard/system-health">
      <SystemHealthAdminPage />
    </DynamicRoleGuard>
  )
}
