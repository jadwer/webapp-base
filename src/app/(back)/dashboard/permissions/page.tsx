'use client'

import dynamic from 'next/dynamic'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

const PermissionsCrudTemplate = dynamic(
  () => import('@/modules/permissions/templates/PermissionsCrudTemplate'),
  { ssr: false }
)

export default function PermissionsPage() {
  return (
    <DynamicRoleGuard path="/dashboard/permissions">
      <PermissionsCrudTemplate />
    </DynamicRoleGuard>
  )
}
