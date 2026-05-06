import SystemEmailsTemplate from '@/modules/mailer-manager/templates/SystemEmailsTemplate'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function SystemEmailsPage() {
  return (
    <DynamicRoleGuard path="/dashboard/mailer-manager/system-emails">
      <div className="container-fluid py-4">
        <SystemEmailsTemplate />
      </div>
    </DynamicRoleGuard>
  )
}
