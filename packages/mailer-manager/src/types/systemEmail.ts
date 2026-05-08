import type { EmailTemplate } from './emailTemplate'

export interface SystemEmail {
  id: string
  key: string
  module: string
  name: string
  description: string | null
  mailableClass: string
  availableVariables: Record<string, string>
  sampleData: Record<string, unknown> | null
  emailTemplateId: string | null
  isEnabled: boolean
  defaultSubject: string | null
  emailTemplate?: EmailTemplate
}

export interface SystemEmailFilters {
  module?: string
  isEnabled?: boolean
  key?: string
}

export interface SystemEmailPreview {
  subject: string
  html: string
  hasCustomTemplate: boolean
  availableVariables?: Record<string, string>
}

export interface SystemEmailUpdateData {
  isEnabled?: boolean
  emailTemplateId?: string | null
}
