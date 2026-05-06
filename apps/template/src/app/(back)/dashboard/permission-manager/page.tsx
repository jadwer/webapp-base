import PermissionManagerPage from '@/modules/roles/pages/PermissionManagerPage'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function PermissionManager() {
  return (
    <DynamicRoleGuard>
      <PermissionManagerPage />
    </DynamicRoleGuard>
  )
}
