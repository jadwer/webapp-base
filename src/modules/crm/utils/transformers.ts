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

export function transformJsonApiPipelineStage(resource: any): PipelineStage {
  const attributes = resource.attributes
  return {
    id: resource.id,
    name: attributes.name || '',
    order: attributes.order || 0,
    probability: attributes.probability || 0,
    isActive: attributes.is_active ?? attributes.isActive ?? true,
    color: attributes.color || undefined,
    description: attributes.description || undefined,
    metadata: attributes.metadata || undefined,
    createdAt: attributes.created_at || attributes.createdAt,
    updatedAt: attributes.updated_at || attributes.updatedAt,
  }
}

export function transformPipelineStageFormToJsonApi(
  data: PipelineStageFormData,
  type = 'pipeline-stages',
  id?: string
) {
  const payload: any = {
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
    payload.data.id = id
  }

  return payload
}

export function transformPipelineStagesResponse(response: any) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? response.data.map((stage: any) => transformJsonApiPipelineStage(stage))
    : transformJsonApiPipelineStage(response.data)

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// LEAD TRANSFORMERS
// ============================================================================

export function transformJsonApiLead(resource: any, included?: any[]): Lead {
  const attributes = resource.attributes

  // Create included map for quick lookup
  const includedMap = new Map()
  if (included) {
    included.forEach((item: any) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }

  const lead: Lead = {
    id: resource.id,
    title: attributes.title || '',
    status: attributes.status || 'new',
    rating: attributes.rating || 'warm',
    source: attributes.source || undefined,
    companyName: attributes.company_name || attributes.companyName || undefined,
    email: attributes.email || undefined,
    phone: attributes.phone || undefined,
    estimatedValue: attributes.estimated_value ?? attributes.estimatedValue ?? undefined,
    expectedCloseDate: attributes.expected_close_date || attributes.expectedCloseDate || undefined,
    actualCloseDate: attributes.actual_close_date || attributes.actualCloseDate || undefined,
    convertedAt: attributes.converted_at || attributes.convertedAt || undefined,
    lostReason: attributes.lost_reason || attributes.lostReason || undefined,
    notes: attributes.notes || undefined,
    metadata: attributes.metadata || undefined,
    createdAt: attributes.created_at || attributes.createdAt,
    updatedAt: attributes.updated_at || attributes.updatedAt,
    userId: attributes.user_id || attributes.userId,
    contactId: attributes.contact_id || attributes.contactId || undefined,
    pipelineStageId: attributes.pipeline_stage_id || attributes.pipelineStageId || undefined,
  }

  // Attach included relationships
  if (resource.relationships) {
    if (resource.relationships.user?.data) {
      const userKey = `users:${resource.relationships.user.data.id}`
      lead.user = includedMap.get(userKey)
    }

    if (resource.relationships.contact?.data) {
      const contactKey = `contacts:${resource.relationships.contact.data.id}`
      lead.contact = includedMap.get(contactKey)
    }

    if (resource.relationships.pipelineStage?.data || resource.relationships.pipeline_stage?.data) {
      const stageData = resource.relationships.pipelineStage?.data || resource.relationships.pipeline_stage?.data
      const stageKey = `pipeline-stages:${stageData.id}`
      const stageResource = includedMap.get(stageKey)
      if (stageResource) {
        lead.pipelineStage = transformJsonApiPipelineStage(stageResource)
      }
    }

    if (resource.relationships.campaigns?.data) {
      lead.campaigns = resource.relationships.campaigns.data.map((campaignRef: any) => {
        const campaignKey = `campaigns:${campaignRef.id}`
        const campaignResource = includedMap.get(campaignKey)
        return campaignResource ? transformJsonApiCampaign(campaignResource, included) : null
      }).filter(Boolean)
    }
  }

  return lead
}

export function transformLeadFormToJsonApi(
  data: LeadFormData,
  type = 'leads',
  id?: string
) {
  const payload: any = {
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
    payload.data.relationships.contact = {
      data: { type: 'contacts', id: String(data.contactId) }
    }
  }

  if (data.pipelineStageId) {
    payload.data.relationships.pipelineStage = {
      data: { type: 'pipeline-stages', id: String(data.pipelineStageId) }
    }
  }

  if (id) {
    payload.data.id = id
  }

  return payload
}

export function transformLeadsResponse(response: any) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? response.data.map((lead: any) => transformJsonApiLead(lead, response.included))
    : transformJsonApiLead(response.data, response.included)

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// CAMPAIGN TRANSFORMERS
// ============================================================================

export function transformJsonApiCampaign(resource: any, included?: any[]): Campaign {
  const attributes = resource.attributes

  // Create included map for quick lookup
  const includedMap = new Map()
  if (included) {
    included.forEach((item: any) => {
      const key = `${item.type}:${item.id}`
      includedMap.set(key, item)
    })
  }

  const campaign: Campaign = {
    id: resource.id,
    name: attributes.name || '',
    type: attributes.type || 'email',
    status: attributes.status || 'planning',
    startDate: attributes.start_date || attributes.startDate || '',
    endDate: attributes.end_date || attributes.endDate || undefined,
    budget: attributes.budget ?? undefined,
    actualCost: attributes.actual_cost ?? attributes.actualCost ?? undefined,
    expectedRevenue: attributes.expected_revenue ?? attributes.expectedRevenue ?? undefined,
    actualRevenue: attributes.actual_revenue ?? attributes.actualRevenue ?? undefined,
    targetAudience: attributes.target_audience || attributes.targetAudience || undefined,
    description: attributes.description || undefined,
    metadata: attributes.metadata || undefined,
    createdAt: attributes.created_at || attributes.createdAt,
    updatedAt: attributes.updated_at || attributes.updatedAt,
    userId: attributes.user_id || attributes.userId,
  }

  // Attach included relationships
  if (resource.relationships) {
    if (resource.relationships.user?.data) {
      const userKey = `users:${resource.relationships.user.data.id}`
      campaign.user = includedMap.get(userKey)
    }

    if (resource.relationships.leads?.data) {
      campaign.leads = resource.relationships.leads.data.map((leadRef: any) => {
        const leadKey = `leads:${leadRef.id}`
        const leadResource = includedMap.get(leadKey)
        return leadResource ? transformJsonApiLead(leadResource, included) : null
      }).filter(Boolean)
    }
  }

  return campaign
}

export function transformCampaignFormToJsonApi(
  data: CampaignFormData,
  type = 'campaigns',
  id?: string
) {
  const payload: any = {
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
    payload.data.id = id
  }

  return payload
}

export function transformCampaignsResponse(response: any) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? response.data.map((campaign: any) => transformJsonApiCampaign(campaign, response.included))
    : transformJsonApiCampaign(response.data, response.included)

  return {
    data,
    meta: response.meta || {},
  }
}
