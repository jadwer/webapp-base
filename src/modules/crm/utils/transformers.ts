/**
 * CRM Module - JSON:API Transformers
 *
 * Transforms data between JSON:API format (snake_case) and TypeScript (camelCase)
 */

import type {
  PipelineStage,
  PipelineStageFormData,
  Lead,
  LeadFormData,
  Campaign,
  CampaignFormData,
} from '../types'

// ============================================================================
// PIPELINE STAGE TRANSFORMERS
// ============================================================================

export function transformJsonApiPipelineStage(resource: Record<string, unknown>): PipelineStage {
  const attributes = resource.attributes as Record<string, unknown>
  return {
    id: String(resource.id),
    name: String(attributes.name || ''),
    order: (attributes.order as number) || 0,
    probability: (attributes.probability as number) || 0,
    isActive: (attributes.is_active as boolean) ?? (attributes.isActive as boolean) ?? true,
    color: attributes.color ? String(attributes.color) : undefined,
    description: attributes.description ? String(attributes.description) : undefined,
    metadata: attributes.metadata as Record<string, unknown> | undefined,
    createdAt: String(attributes.created_at || attributes.createdAt),
    updatedAt: String(attributes.updated_at || attributes.updatedAt),
  }
}

export function transformPipelineStageFormToJsonApi(
  data: PipelineStageFormData,
  type = 'pipeline-stages',
  id?: string
) {
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        name: data.name,
        order: data.order,
        probability: data.probability,
        is_active: data.isActive,
        color: data.color || null,
        description: data.description || null,
      }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformPipelineStagesResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((stage: Record<string, unknown>) => transformJsonApiPipelineStage(stage))
    : transformJsonApiPipelineStage(response.data as Record<string, unknown>)

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// LEAD TRANSFORMERS
// ============================================================================

export function transformJsonApiLead(resource: Record<string, unknown>, included?: Record<string, unknown>[]): Lead {
  const attributes = resource.attributes as Record<string, unknown>

  // Create included map for quick lookup
  const includedMap = new Map()
  if (included) {
    included.forEach((item: Record<string, unknown>) => {
      const key = `${item.type as string}:${item.id as string}`
      includedMap.set(key, item)
    })
  }

  const lead: Lead = {
    id: String(resource.id),
    title: String(attributes.title || ''),
    status: (attributes.status as Lead['status']) || 'new',
    rating: (attributes.rating as Lead['rating']) || 'warm',
    source: attributes.source ? String(attributes.source) : undefined,
    companyName: attributes.company_name ? String(attributes.company_name) : attributes.companyName ? String(attributes.companyName) : undefined,
    email: attributes.email ? String(attributes.email) : undefined,
    phone: attributes.phone ? String(attributes.phone) : undefined,
    estimatedValue: attributes.estimated_value ? (attributes.estimated_value as number) : attributes.estimatedValue ? (attributes.estimatedValue as number) : undefined,
    expectedCloseDate: attributes.expected_close_date ? String(attributes.expected_close_date) : attributes.expectedCloseDate ? String(attributes.expectedCloseDate) : undefined,
    actualCloseDate: attributes.actual_close_date ? String(attributes.actual_close_date) : attributes.actualCloseDate ? String(attributes.actualCloseDate) : undefined,
    convertedAt: attributes.converted_at ? String(attributes.converted_at) : attributes.convertedAt ? String(attributes.convertedAt) : undefined,
    lostReason: attributes.lost_reason ? String(attributes.lost_reason) : attributes.lostReason ? String(attributes.lostReason) : undefined,
    notes: attributes.notes ? String(attributes.notes) : undefined,
    metadata: attributes.metadata as Record<string, unknown> | undefined,
    createdAt: String(attributes.created_at || attributes.createdAt),
    updatedAt: String(attributes.updated_at || attributes.updatedAt),
    userId: (attributes.user_id as number) || (attributes.userId as number),
    contactId: attributes.contact_id ? (attributes.contact_id as number) : attributes.contactId ? (attributes.contactId as number) : undefined,
    pipelineStageId: attributes.pipeline_stage_id ? (attributes.pipeline_stage_id as number) : attributes.pipelineStageId ? (attributes.pipelineStageId as number) : undefined,
  }

  // Attach included relationships
  if (resource.relationships) {
    const relationships = resource.relationships as Record<string, { data?: unknown }>
    if (relationships.user?.data) {
      const userData = relationships.user.data as Record<string, unknown>
      const userKey = `users:${userData.id as string}`
      lead.user = includedMap.get(userKey) as Record<string, unknown>
    }

    if (relationships.contact?.data) {
      const contactData = relationships.contact.data as Record<string, unknown>
      const contactKey = `contacts:${contactData.id as string}`
      lead.contact = includedMap.get(contactKey) as Record<string, unknown>
    }

    if (relationships.pipelineStage?.data || relationships.pipeline_stage?.data) {
      const stageData = (relationships.pipelineStage?.data || relationships.pipeline_stage?.data) as Record<string, unknown>
      const stageKey = `pipeline-stages:${stageData.id as string}`
      const stageResource = includedMap.get(stageKey) as Record<string, unknown>
      if (stageResource) {
        lead.pipelineStage = transformJsonApiPipelineStage(stageResource)
      }
    }

    if (relationships.campaigns?.data) {
      const campaignsData = relationships.campaigns.data as Record<string, unknown>[]
      lead.campaigns = campaignsData.map((campaignRef: Record<string, unknown>) => {
        const campaignKey = `campaigns:${campaignRef.id as string}`
        const campaignResource = includedMap.get(campaignKey) as Record<string, unknown>
        return campaignResource ? transformJsonApiCampaign(campaignResource, included) : null
      }).filter((c): c is Campaign => c !== null)
    }
  }

  return lead
}

export function transformLeadFormToJsonApi(
  data: LeadFormData,
  type = 'leads',
  id?: string
) {
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        title: data.title,
        status: data.status,
        rating: data.rating,
        source: data.source || null,
        company_name: data.companyName || null,
        email: data.email || null,
        phone: data.phone || null,
        estimated_value: data.estimatedValue ?? null,
        expected_close_date: data.expectedCloseDate || null,
        notes: data.notes || null,
      },
      relationships: {
        user: {
          data: { type: 'users', id: String(data.userId) }
        }
      }
    }
  }

  // Add optional relationships
  if (data.contactId) {
    ((payload.data as Record<string, unknown>).relationships as Record<string, unknown>).contact = {
      data: { type: 'contacts', id: String(data.contactId) }
    }
  }

  if (data.pipelineStageId) {
    ((payload.data as Record<string, unknown>).relationships as Record<string, unknown>).pipelineStage = {
      data: { type: 'pipeline-stages', id: String(data.pipelineStageId) }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformLeadsResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((lead: Record<string, unknown>) => transformJsonApiLead(lead, response.included as Record<string, unknown>[]))
    : transformJsonApiLead(response.data as Record<string, unknown>, response.included as Record<string, unknown>[])

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// CAMPAIGN TRANSFORMERS
// ============================================================================

export function transformJsonApiCampaign(resource: Record<string, unknown>, included?: Record<string, unknown>[]): Campaign {
  const attributes = resource.attributes as Record<string, unknown>

  // Create included map for quick lookup
  const includedMap = new Map()
  if (included) {
    included.forEach((item: Record<string, unknown>) => {
      const key = `${item.type as string}:${item.id as string}`
      includedMap.set(key, item)
    })
  }

  const campaign: Campaign = {
    id: String(resource.id),
    name: String(attributes.name || ''),
    type: (attributes.type as Campaign['type']) || 'email',
    status: (attributes.status as Campaign['status']) || 'planning',
    startDate: String(attributes.start_date || attributes.startDate || ''),
    endDate: attributes.end_date ? String(attributes.end_date) : attributes.endDate ? String(attributes.endDate) : undefined,
    budget: attributes.budget ? (attributes.budget as number) : undefined,
    actualCost: attributes.actual_cost ? (attributes.actual_cost as number) : attributes.actualCost ? (attributes.actualCost as number) : undefined,
    expectedRevenue: attributes.expected_revenue ? (attributes.expected_revenue as number) : attributes.expectedRevenue ? (attributes.expectedRevenue as number) : undefined,
    actualRevenue: attributes.actual_revenue ? (attributes.actual_revenue as number) : attributes.actualRevenue ? (attributes.actualRevenue as number) : undefined,
    targetAudience: attributes.target_audience ? String(attributes.target_audience) : attributes.targetAudience ? String(attributes.targetAudience) : undefined,
    description: attributes.description ? String(attributes.description) : undefined,
    metadata: attributes.metadata as Record<string, unknown> | undefined,
    createdAt: String(attributes.created_at || attributes.createdAt),
    updatedAt: String(attributes.updated_at || attributes.updatedAt),
    userId: (attributes.user_id as number) || (attributes.userId as number),
  }

  // Attach included relationships
  if (resource.relationships) {
    const relationships = resource.relationships as Record<string, { data?: unknown }>
    if (relationships.user?.data) {
      const userData = relationships.user.data as Record<string, unknown>
      const userKey = `users:${userData.id as string}`
      campaign.user = includedMap.get(userKey) as Record<string, unknown>
    }

    if (relationships.leads?.data) {
      const leadsData = relationships.leads.data as Record<string, unknown>[]
      campaign.leads = leadsData.map((leadRef: Record<string, unknown>) => {
        const leadKey = `leads:${leadRef.id as string}`
        const leadResource = includedMap.get(leadKey) as Record<string, unknown>
        return leadResource ? transformJsonApiLead(leadResource, included) : null
      }).filter((l): l is Lead => l !== null)
    }
  }

  return campaign
}

export function transformCampaignFormToJsonApi(
  data: CampaignFormData,
  type = 'campaigns',
  id?: string
) {
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        name: data.name,
        type: data.type,
        status: data.status,
        start_date: data.startDate,
        end_date: data.endDate || null,
        budget: data.budget ?? null,
        actual_cost: data.actualCost ?? null,
        expected_revenue: data.expectedRevenue ?? null,
        actual_revenue: data.actualRevenue ?? null,
        target_audience: data.targetAudience || null,
        description: data.description || null,
      },
      relationships: {
        user: {
          data: { type: 'users', id: String(data.userId) }
        }
      }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformCampaignsResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((campaign: Record<string, unknown>) => transformJsonApiCampaign(campaign, response.included as Record<string, unknown>[]))
    : transformJsonApiCampaign(response.data as Record<string, unknown>, response.included as Record<string, unknown>[])

  return {
    data,
    meta: response.meta || {},
  }
}
