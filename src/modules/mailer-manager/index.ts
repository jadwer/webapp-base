// Types
export type {
  EmailTemplate,
  EmailTemplateFormData,
  EmailTemplateFilters,
  EmailTemplatePreview,
  EmailTemplateImage,
  EmailTemplateStatus,
  EmailTemplateCategory,
} from './types/emailTemplate'

export type {
  SystemEmail,
  SystemEmailFilters,
  SystemEmailPreview,
  SystemEmailUpdateData,
} from './types/systemEmail'

// Services
export { emailTemplateService } from './services/emailTemplateService'
export { systemEmailService } from './services/systemEmailService'

// Hooks
export { useEmailTemplates, useEmailTemplate, useEmailTemplateActions } from './hooks/useEmailTemplates'
export { useSystemEmails, useSystemEmailActions } from './hooks/useSystemEmails'

// Components
export { default as SendTestDialog } from './components/SendTestDialog'
export { default as PreviewDialog } from './components/PreviewDialog'
export { default as VariablePicker } from './components/VariablePicker'

// Templates
export { default as EmailTemplatesAdminTemplate } from './templates/EmailTemplatesAdminTemplate'
export { default as EmailTemplateCreateTemplate } from './templates/EmailTemplateCreateTemplate'
export { default as EmailTemplateEditorTemplate } from './templates/EmailTemplateEditorTemplate'
export { default as SystemEmailsTemplate } from './templates/SystemEmailsTemplate'
