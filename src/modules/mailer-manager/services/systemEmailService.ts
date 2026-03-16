import axiosClient from '@/lib/axiosClient'
import type { SystemEmail, SystemEmailFilters, SystemEmailPreview } from '../types/systemEmail'
import type { EmailTemplate } from '../types/emailTemplate'

function transformJsonApiToSystemEmail(resource: Record<string, unknown>, included?: Record<string, unknown>[]): SystemEmail {
  const attrs = resource.attributes as Record<string, unknown>
  const relationships = resource.relationships as Record<string, Record<string, unknown>> | undefined

  let emailTemplate: EmailTemplate | undefined
  if (relationships?.emailTemplate && included) {
    const rel = relationships.emailTemplate.data as Record<string, unknown> | null
    if (rel) {
      const found = included.find(
        (inc: Record<string, unknown>) => inc.type === rel.type && inc.id === rel.id
      )
      if (found) {
        const tplAttrs = found.attributes as Record<string, unknown>
        emailTemplate = {
          id: found.id as string,
          name: tplAttrs.name as string,
          slug: tplAttrs.slug as string,
          description: (tplAttrs.description as string) || null,
          subject: tplAttrs.subject as string,
          html: (tplAttrs.html as string) || null,
          css: (tplAttrs.css as string) || null,
          json: (tplAttrs.json as Record<string, unknown>) || null,
          status: tplAttrs.status as EmailTemplate['status'],
          category: (tplAttrs.category as EmailTemplate['category']) || null,
          createdAt: tplAttrs.createdAt as string,
          updatedAt: tplAttrs.updatedAt as string,
        }
      }
    }
  }

  return {
    id: resource.id as string,
    key: attrs.key as string,
    module: attrs.module as string,
    name: attrs.name as string,
    description: (attrs.description as string) || null,
    mailableClass: attrs.mailableClass as string,
    availableVariables: (attrs.availableVariables as Record<string, string>) || {},
    sampleData: (attrs.sampleData as Record<string, unknown>) || null,
    emailTemplateId: extractRelationshipId(relationships, 'emailTemplate'),
    isEnabled: attrs.isEnabled as boolean,
    defaultSubject: (attrs.defaultSubject as string) || null,
    emailTemplate,
  }
}

function extractRelationshipId(
  relationships: Record<string, Record<string, unknown>> | undefined,
  name: string
): string | null {
  if (!relationships?.[name]) return null
  const data = relationships[name].data as Record<string, unknown> | null
  return data ? (data.id as string) : null
}

export const systemEmailService = {
  getAll: async (filters?: SystemEmailFilters): Promise<SystemEmail[]> => {
    const params = new URLSearchParams()
    params.append('include', 'emailTemplate')

    if (filters?.module) params.append('filter[module]', filters.module)
    if (filters?.isEnabled !== undefined) params.append('filter[isEnabled]', filters.isEnabled ? '1' : '0')
    if (filters?.key) params.append('filter[key]', filters.key)

    const url = `/api/v1/system-emails?${params.toString()}`
    const response = await axiosClient.get(url)
    const data = response.data.data || []
    const included = response.data.included || []
    return data.map((r: Record<string, unknown>) => transformJsonApiToSystemEmail(r, included))
  },

  getById: async (id: string): Promise<SystemEmail> => {
    const response = await axiosClient.get(`/api/v1/system-emails/${id}?include=emailTemplate`)
    const included = response.data.included || []
    return transformJsonApiToSystemEmail(response.data.data, included)
  },

  update: async (id: string, data: { isEnabled?: boolean; emailTemplateId?: string | null }): Promise<SystemEmail> => {
    const payload: Record<string, unknown> = {
      data: {
        type: 'system-emails',
        id,
        attributes: {} as Record<string, unknown>,
        relationships: {} as Record<string, unknown>,
      },
    }

    const payloadData = payload.data as Record<string, unknown>
    const attributes = payloadData.attributes as Record<string, unknown>
    const relationships = payloadData.relationships as Record<string, unknown>

    if (data.isEnabled !== undefined) {
      attributes.isEnabled = data.isEnabled
    }

    if (data.emailTemplateId !== undefined) {
      relationships.emailTemplate = {
        data: data.emailTemplateId
          ? { type: 'email-templates', id: data.emailTemplateId }
          : null,
      }
    }

    // Clean empty objects
    if (Object.keys(attributes).length === 0) delete payloadData.attributes
    if (Object.keys(relationships).length === 0) delete payloadData.relationships

    const response = await axiosClient.patch(`/api/v1/system-emails/${id}`, payload)
    return transformJsonApiToSystemEmail(response.data.data)
  },

  preview: async (id: string): Promise<SystemEmailPreview> => {
    const response = await axiosClient.post(`/api/v1/system-emails/${id}/preview`)
    const d = response.data.data
    return {
      subject: d.subject,
      html: d.html,
      hasCustomTemplate: d.has_custom_template,
      availableVariables: d.available_variables,
    }
  },

  sendTest: async (id: string, email: string): Promise<{ message: string; usedCustomTemplate: boolean }> => {
    const response = await axiosClient.post(`/api/v1/system-emails/${id}/send-test`, { email })
    return {
      message: response.data.message,
      usedCustomTemplate: response.data.used_custom_template,
    }
  },
}
