import { PermissionManagerPage } from '@/modules/roles'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function PermissionManager() {
  return (
    <DynamicRoleGuard>
      <PermissionManagerPage />
    </DynamicRoleGuard>
  )
}
