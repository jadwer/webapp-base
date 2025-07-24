'use client'

import dynamic from 'next/dynamic'
import RoleGuard from '@/ui/components/RoleGuard'

const UsersCrudTemplate = dynamic(
  () => import('@/modules/users/templates/UsersCrudTemplate'),
  { ssr: false }
)

export default function Page() {
  return (
    <RoleGuard 
      allowedRoles={['admin', 'administrator']}
      fallbackRoute="/dashboard/profile"
    >
      <UsersCrudTemplate />
    </RoleGuard>
  )
}
