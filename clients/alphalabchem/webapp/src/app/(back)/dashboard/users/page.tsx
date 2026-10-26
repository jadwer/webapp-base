'use client'

import dynamic from 'next/dynamic'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

const UsersAdminPage = dynamic(
  () => import('@/modules/users').then(m => m.UsersAdminPage),
  { ssr: false }
)

export default function Page() {
  return (
    <DynamicRoleGuard path="/dashboard/users">
      <UsersAdminPage />
    </DynamicRoleGuard>
  )
}
