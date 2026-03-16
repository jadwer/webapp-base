import axiosClient from '@/lib/axiosClient'
import type {
  EmailTemplate,
  EmailTemplateFormData,
  EmailTemplateFilters,
  EmailTemplatePreview,
  EmailTemplateImage,
} from '../types/emailTemplate'

function transformJsonApiToEmailTemplate(resource: Record<string, unknown>): EmailTemplate {
  const attrs = resource.attributes as Record<string, unknown>
  return {
    id: resource.id as string,
    name: attrs.name as string,
    slug: attrs.slug as string,
    description: (attrs.description as string) || null,
    subject: attrs.subject as string,
    html: (attrs.html as string) || null,
    css: (attrs.css as string) || null,
    json: (attrs.json as Record<string, unknown>) || null,
    status: attrs.status as EmailTemplate['status'],
    category: (attrs.category as EmailTemplate['category']) || null,
    createdAt: attrs.createdAt as string,
    updatedAt: attrs.updatedAt as string,
  }
}

export const emailTemplateService = {
  getAll: async (filters?: EmailTemplateFilters): Promise<EmailTemplate[]> => {
    const params = new URLSearchParams()

    if (filters?.status) params.append('filter[status]', filters.status)
    if (filters?.category) params.append('filter[category]', filters.category)
    if (filters?.slug) params.append('filter[slug]', filters.slug)
    params.append('sort', '-createdAt')

    const url = `/api/v1/email-templates?${params.toString()}`
    const response = await axiosClient.get(url)
    const data = response.data.data || []
    return data.map(transformJsonApiToEmailTemplate)
  },

  getById: async (id: string): Promise<EmailTemplate> => {
    const response = await axiosClient.get(`/api/v1/email-templates/${id}`)
    return transformJsonApiToEmailTemplate(response.data.data)
  },

  create: async (formData: EmailTemplateFormData): Promise<EmailTemplate> => {
    const payload = {
      data: {
        type: 'email-templates',
        attributes: {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          subject: formData.subject,
          html: formData.html || null,
          css: formData.css || null,
          json: formData.json || null,
          status: formData.status || 'draft',
          category: formData.category || null,
        },
      },
    }
    const response = await axiosClient.post('/api/v1/email-templates', payload)
    return transformJsonApiToEmailTemplate(response.data.data)
  },

  update: async (id: string, formData: Partial<EmailTemplateFormData>): Promise<EmailTemplate> => {
    const attributes: Record<string, unknown> = {}
    if (formData.name !== undefined) attributes.name = formData.name
    if (formData.slug !== undefined) attributes.slug = formData.slug
    if (formData.description !== undefined) attributes.description = formData.description
    if (formData.subject !== undefined) attributes.subject = formData.subject
    if (formData.html !== undefined) attributes.html = formData.html
    if (formData.css !== undefined) attributes.css = formData.css
    if (formData.json !== undefined) attributes.json = formData.json
    if (formData.status !== undefined) attributes.status = formData.status
    if (formData.category !== undefined) attributes.category = formData.category

    const payload = {
      data: {
        type: 'email-templates',
        id,
        attributes,
      },
    }
    const response = await axiosClient.patch(`/api/v1/email-templates/${id}`, payload)
    return transformJsonApiToEmailTemplate(response.data.data)
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/email-templates/${id}`)
  },

  preview: async (id: string, sampleData?: Record<string, unknown>): Promise<EmailTemplatePreview> => {
    const response = await axiosClient.post(`/api/v1/email-templates/${id}/preview`, {
      sample_data: sampleData || null,
    })
    return {
      subject: response.data.data.subject,
      html: response.data.data.html,
    }
  },

  sendTest: async (id: string, email: string, sampleData?: Record<string, unknown>): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/api/v1/email-templates/${id}/send-test`, {
      email,
      sample_data: sampleData || null,
    })
    return { message: response.data.message }
  },

  uploadImage: async (id: string, file: File): Promise<EmailTemplateImage> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await axiosClient.post(`/api/v1/email-templates/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  deleteImage: async (templateId: string, imageId: string): Promise<void> => {
    await axiosClient.delete(`/api/v1/email-templates/${templateId}/images/${imageId}`)
  },
}
