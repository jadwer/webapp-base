'use client'

import dynamic from 'next/dynamic'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

const UsersCrudTemplate = dynamic(
  () => import('@/modules/users/templates/UsersCrudTemplate'),
  { ssr: false }
)

export default function Page() {
  return (
    <DynamicRoleGuard path="/dashboard/users">
      <UsersCrudTemplate />
    </DynamicRoleGuard>
  )
}
