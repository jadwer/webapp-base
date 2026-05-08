import { RolesPage } from '@/modules/roles'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function Roles() {
  return (
    <DynamicRoleGuard>
      <RolesPage />
    </DynamicRoleGuard>
  )
}
