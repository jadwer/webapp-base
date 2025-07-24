'use client'

import dynamic from 'next/dynamic'
import RoleGuard from '@/ui/components/RoleGuard'

const PermissionsCrudTemplate = dynamic(
  () => import('@/modules/permissions/templates/PermissionsCrudTemplate'),
  { ssr: false }
)

export default function PermissionsPage() {
  return (
    <RoleGuard 
      allowedRoles={['god', 'admin', 'administrator']}
      fallbackRoute="/dashboard/profile"
    >
      <PermissionsCrudTemplate />
    </RoleGuard>
  )
}
