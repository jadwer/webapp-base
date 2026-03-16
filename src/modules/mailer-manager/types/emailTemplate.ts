export type EmailTemplateStatus = 'draft' | 'active' | 'archived'
export type EmailTemplateCategory = 'transactional' | 'notification' | 'marketing'

export interface EmailTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  subject: string
  html: string | null
  css: string | null
  json: Record<string, unknown> | null
  status: EmailTemplateStatus
  category: EmailTemplateCategory | null
  createdAt: string
  updatedAt: string
}

export interface EmailTemplateImage {
  id: string
  filename: string
  url: string
  path: string
}

export interface EmailTemplateFormData {
  name: string
  slug: string
  description?: string
  subject: string
  html?: string
  css?: string
  json?: Record<string, unknown>
  status?: EmailTemplateStatus
  category?: EmailTemplateCategory
}

export interface EmailTemplateFilters {
  status?: EmailTemplateStatus
  category?: EmailTemplateCategory
  slug?: string
}

export interface EmailTemplatePreview {
  subject: string
  html: string
}
