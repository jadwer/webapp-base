import EmailTemplatesAdminTemplate from '@/modules/mailer-manager/templates/EmailTemplatesAdminTemplate'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function MailerManagerPage() {
  return (
    <DynamicRoleGuard path="/dashboard/mailer-manager">
      <div className="container-fluid py-4">
        <EmailTemplatesAdminTemplate />
      </div>
    </DynamicRoleGuard>
  )
}
