'use client'

import { use } from 'react'
import EmailTemplateEditorTemplate from '@/modules/mailer-manager/templates/EmailTemplateEditorTemplate'
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard'

export default function EditEmailTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DynamicRoleGuard path="/dashboard/mailer-manager">
      <div className="container-fluid py-4">
        <EmailTemplateEditorTemplate templateId={id} />
      </div>
    </DynamicRoleGuard>
  )
}
