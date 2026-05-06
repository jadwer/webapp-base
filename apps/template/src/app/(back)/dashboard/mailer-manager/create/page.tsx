import EmailTemplateCreateTemplate from '@/modules/mailer-manager/templates/EmailTemplateCreateTemplate'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function CreateEmailTemplatePage() {
  return (
    <DynamicRoleGuard path="/dashboard/mailer-manager">
      <div className="container-fluid py-4">
        <EmailTemplateCreateTemplate />
      </div>
    </DynamicRoleGuard>
  )
}
