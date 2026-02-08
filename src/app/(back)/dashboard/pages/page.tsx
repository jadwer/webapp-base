import { PagesAdminTemplate } from '@/modules/page-builder-pro'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function PagesAdminPage() {
  return (
    <DynamicRoleGuard path="/dashboard/pages">
      <div className="container-fluid py-4">
        <PagesAdminTemplate />
      </div>
    </DynamicRoleGuard>
  )
}