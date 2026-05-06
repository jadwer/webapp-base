/**
 * CRM Module - JSON:API Transformers
 *
 * Transforms data between JSON:API format and TypeScript.
 * IMPORTANT: Backend now requires camelCase for request attributes.
 * Response parsing still handles both snake_case and camelCase for backwards compatibility.
 */

import type {
  PipelineStage,
  PipelineStageFormData,
  Lead,
  LeadFormData,
  Campaign,
  CampaignFormData,
  Activity,
  ActivityFormData,
  Opportunity,
  OpportunityFormData,
} from '../types'

// ============================================================================
// PIPELINE STAGE TRANSFORMERS
// ============================================================================

export function transformJsonApiPipelineStage(resource: Record<string, unknown>): PipelineStage {
  const attributes = resource.attributes as Record<string, unknown>
  return {
    id: String(resource.id),
    name: String(attributes.name || ''),
    stageType: (attributes.stage_type as PipelineStage['stageType']) || (attributes.stageType as PipelineStage['stageType']) || 'opportunity',
    probability: (attributes.probability as number) || 0,
    sortOrder: (attributes.sort_order as number) || (attributes.sortOrder as number) || 0,
    isActive: (attributes.is_active as boolean) ?? (attributes.isActive as boolean) ?? true,
    isClosedWon: (attributes.is_closed_won as boolean) ?? (attributes.isClosedWon as boolean) ?? false,
    isClosedLost: (attributes.is_closed_lost as boolean) ?? (attributes.isClosedLost as boolean) ?? false,
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
        stageType: data.stageType,
        probability: data.probability,
        sortOrder: data.sortOrder,
        isActive: data.isActive ?? true,
        isClosedWon: data.isClosedWon ?? false,
        isClosedLost: data.isClosedLost ?? false,
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
    contactPerson: attributes.contact_person ? String(attributes.contact_person) : attributes.contactPerson ? String(attributes.contactPerson) : undefined,
    email: attributes.email ? String(attributes.email) : undefined,
    phone: attributes.phone ? String(attributes.phone) : undefined,
    estimatedValue: attributes.estimated_value ? (attributes.estimated_value as number) : attributes.estimatedValue ? (attributes.estimatedValue as number) : undefined,
    estimatedCloseDate: attributes.estimated_close_date ? String(attributes.estimated_close_date) : attributes.estimatedCloseDate ? String(attributes.estimatedCloseDate) : undefined,
    convertedAt: attributes.converted_at ? String(attributes.converted_at) : attributes.convertedAt ? String(attributes.convertedAt) : undefined,
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
        companyName: data.companyName || null,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        estimatedValue: data.estimatedValue ?? null,
        estimatedCloseDate: data.estimatedCloseDate || null,
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
        startDate: data.startDate,
        endDate: data.endDate || null,
        budget: data.budget ?? null,
        actualCost: data.actualCost ?? null,
        expectedRevenue: data.expectedRevenue ?? null,
        actualRevenue: data.actualRevenue ?? null,
        targetAudience: data.targetAudience || null,
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

// ============================================================================
// ACTIVITY TRANSFORMERS
// ============================================================================

export function transformJsonApiActivity(resource: Record<string, unknown>, included?: Record<string, unknown>[]): Activity {
  const attributes = resource.attributes as Record<string, unknown>

  // Create included map for quick lookup
  const includedMap = new Map()
  if (included) {
    included.forEach((item: Record<string, unknown>) => {
      const key = `${item.type as string}:${item.id as string}`
      includedMap.set(key, item)
    })
  }

  const activity: Activity = {
    id: String(resource.id),
    subject: String(attributes.subject || ''),
    activityType: (attributes.activity_type as Activity['activityType']) || (attributes.activityType as Activity['activityType']) || 'task',
    status: (attributes.status as Activity['status']) || 'pending',
    description: attributes.description ? String(attributes.description) : undefined,
    activityDate: String(attributes.activity_date || attributes.activityDate || ''),
    dueDate: attributes.due_date ? String(attributes.due_date) : attributes.dueDate ? String(attributes.dueDate) : undefined,
    completedAt: attributes.completed_at ? String(attributes.completed_at) : attributes.completedAt ? String(attributes.completedAt) : undefined,
    duration: attributes.duration ? (attributes.duration as number) : undefined,
    outcome: attributes.outcome ? String(attributes.outcome) : undefined,
    priority: (attributes.priority as Activity['priority']) || undefined,
    metadata: attributes.metadata as Record<string, unknown> | undefined,
    createdAt: String(attributes.created_at || attributes.createdAt),
    updatedAt: String(attributes.updated_at || attributes.updatedAt),
    userId: (attributes.user_id as number) || (attributes.userId as number),
    leadId: attributes.lead_id ? (attributes.lead_id as number) : attributes.leadId ? (attributes.leadId as number) : undefined,
    campaignId: attributes.campaign_id ? (attributes.campaign_id as number) : attributes.campaignId ? (attributes.campaignId as number) : undefined,
    opportunityId: attributes.opportunity_id ? (attributes.opportunity_id as number) : attributes.opportunityId ? (attributes.opportunityId as number) : undefined,
  }

  // Attach included relationships
  if (resource.relationships) {
    const relationships = resource.relationships as Record<string, { data?: unknown }>
    if (relationships.user?.data) {
      const userData = relationships.user.data as Record<string, unknown>
      const userKey = `users:${userData.id as string}`
      activity.user = includedMap.get(userKey) as Record<string, unknown>
    }

    if (relationships.lead?.data) {
      const leadData = relationships.lead.data as Record<string, unknown>
      const leadKey = `leads:${leadData.id as string}`
      const leadResource = includedMap.get(leadKey) as Record<string, unknown>
      if (leadResource) {
        activity.lead = transformJsonApiLead(leadResource, included)
      }
    }

    if (relationships.campaign?.data) {
      const campaignData = relationships.campaign.data as Record<string, unknown>
      const campaignKey = `campaigns:${campaignData.id as string}`
      const campaignResource = includedMap.get(campaignKey) as Record<string, unknown>
      if (campaignResource) {
        activity.campaign = transformJsonApiCampaign(campaignResource, included)
      }
    }

    if (relationships.opportunity?.data) {
      const oppData = relationships.opportunity.data as Record<string, unknown>
      const oppKey = `opportunities:${oppData.id as string}`
      const oppResource = includedMap.get(oppKey) as Record<string, unknown>
      if (oppResource) {
        activity.opportunity = transformJsonApiOpportunity(oppResource, included)
      }
    }
  }

  return activity
}

export function transformActivityFormToJsonApi(
  data: ActivityFormData,
  type = 'activities',
  id?: string
) {
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        subject: data.subject,
        activityType: data.activityType,
        status: data.status,
        description: data.description || null,
        activityDate: data.activityDate,
        dueDate: data.dueDate || null,
        duration: data.duration ?? null,
        outcome: data.outcome || null,
        priority: data.priority || null,
      },
      relationships: {
        user: {
          data: { type: 'users', id: String(data.userId) }
        }
      }
    }
  }

  // Add optional relationships
  if (data.leadId) {
    ((payload.data as Record<string, unknown>).relationships as Record<string, unknown>).lead = {
      data: { type: 'leads', id: String(data.leadId) }
    }
  }

  if (data.campaignId) {
    ((payload.data as Record<string, unknown>).relationships as Record<string, unknown>).campaign = {
      data: { type: 'campaigns', id: String(data.campaignId) }
    }
  }

  if (data.opportunityId) {
    ((payload.data as Record<string, unknown>).relationships as Record<string, unknown>).opportunity = {
      data: { type: 'opportunities', id: String(data.opportunityId) }
    }
  }

  if (id) {
    (payload.data as Record<string, unknown>).id = id
  }

  return payload
}

export function transformActivitiesResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((activity: Record<string, unknown>) => transformJsonApiActivity(activity, response.included as Record<string, unknown>[]))
    : transformJsonApiActivity(response.data as Record<string, unknown>, response.included as Record<string, unknown>[])

  return {
    data,
    meta: response.meta || {},
  }
}

// ============================================================================
// OPPORTUNITY TRANSFORMERS
// ============================================================================

export function transformJsonApiOpportunity(resource: Record<string, unknown>, included?: Record<string, unknown>[]): Opportunity {
  const attributes = resource.attributes as Record<string, unknown>

  // Create included map for quick lookup
  const includedMap = new Map()
  if (included) {
    included.forEach((item: Record<string, unknown>) => {
      const key = `${item.type as string}:${item.id as string}`
      includedMap.set(key, item)
    })
  }

  const opportunity: Opportunity = {
    id: String(resource.id),
    name: String(attributes.name || ''),
    description: attributes.description ? String(attributes.description) : undefined,

    // Financial
    amount: (attributes.amount as number) || 0,
    probability: (attributes.probability as number) || 0,
    expectedRevenue: attributes.expected_revenue ? (attributes.expected_revenue as number) : attributes.expectedRevenue ? (attributes.expectedRevenue as number) : undefined,
    actualRevenue: attributes.actual_revenue ? (attributes.actual_revenue as number) : attributes.actualRevenue ? (attributes.actualRevenue as number) : undefined,

    // Dates
    closeDate: String(attributes.close_date || attributes.closeDate || ''),
    wonAt: attributes.won_at ? String(attributes.won_at) : attributes.wonAt ? String(attributes.wonAt) : undefined,
    lostAt: attributes.lost_at ? String(attributes.lost_at) : attributes.lostAt ? String(attributes.lostAt) : undefined,

    // Pipeline
    status: (attributes.status as Opportunity['status']) || 'open',
    stage: String(attributes.stage || ''),
    forecastCategory: (attributes.forecast_category as Opportunity['forecastCategory']) || (attributes.forecastCategory as Opportunity['forecastCategory']) || 'pipeline',

    // Additional info
    source: attributes.source ? String(attributes.source) : undefined,
    nextStep: attributes.next_step ? String(attributes.next_step) : attributes.nextStep ? String(attributes.nextStep) : undefined,
    lossReason: attributes.loss_reason ? String(attributes.loss_reason) : attributes.lossReason ? String(attributes.lossReason) : undefined,
    metadata: attributes.metadata as Record<string, unknown> | undefined,

    createdAt: String(attributes.created_at || attributes.createdAt),
    updatedAt: String(attributes.updated_at || attributes.updatedAt),

    // Relationships
    userId: (attributes.user_id as number) || (attributes.userId as number),
    leadId: attributes.lead_id ? (attributes.lead_id as number) : attributes.leadId ? (attributes.leadId as number) : undefined,
    pipelineStageId: attributes.pipeline_stage_id ? (attributes.pipeline_stage_id as number) : attributes.pipelineStageId ? (attributes.pipelineStageId as number) : undefined,
  }

  // Attach included relationships
  if (resource.relationships) {
    const relationships = resource.relationships as Record<string, { data?: unknown }>
    if (relationships.user?.data) {
      const userData = relationships.user.data as Record<string, unknown>
      const userKey = `users:${userData.id as string}`
      opportunity.user = includedMap.get(userKey) as Record<string, unknown>
    }

    if (relationships.lead?.data) {
      const leadData = relationships.lead.data as Record<string, unknown>
      const leadKey = `leads:${leadData.id as string}`
      const leadResource = includedMap.get(leadKey) as Record<string, unknown>
      if (leadResource) {
        opportunity.lead = transformJsonApiLead(leadResource, included)
      }
    }

    if (relationships.pipelineStage?.data || relationships.pipeline_stage?.data) {
      const stageData = (relationships.pipelineStage?.data || relationships.pipeline_stage?.data) as Record<string, unknown>
      const stageKey = `pipeline-stages:${stageData.id as string}`
      const stageResource = includedMap.get(stageKey) as Record<string, unknown>
      if (stageResource) {
        opportunity.pipelineStage = transformJsonApiPipelineStage(stageResource)
      }
    }

    if (relationships.activities?.data) {
      const activitiesData = relationships.activities.data as Record<string, unknown>[]
      opportunity.activities = activitiesData.map((activityRef: Record<string, unknown>) => {
        const activityKey = `activities:${activityRef.id as string}`
        const activityResource = includedMap.get(activityKey) as Record<string, unknown>
        return activityResource ? transformJsonApiActivity(activityResource, included) : null
      }).filter((a): a is Activity => a !== null)
    }
  }

  return opportunity
}

export function transformOpportunityFormToJsonApi(
  data: OpportunityFormData,
  type = 'opportunities',
  id?: string
) {
  const payload: Record<string, unknown> = {
    data: {
      type,
      attributes: {
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        probability: data.probability,
        closeDate: data.closeDate,
        status: data.status,
        stage: data.stage,
        forecastCategory: data.forecastCategory,
        source: data.source || null,
        nextStep: data.nextStep || null,
        lossReason: data.lossReason || null,
        actualRevenue: data.actualRevenue ?? null,
      },
      relationships: {
        user: {
          data: { type: 'users', id: String(data.userId) }
        }
      }
    }
  }

  // Add optional relationships
  if (data.leadId) {
    ((payload.data as Record<string, unknown>).relationships as Record<string, unknown>).lead = {
      data: { type: 'leads', id: String(data.leadId) }
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

export function transformOpportunitiesResponse(response: Record<string, unknown>) {
  if (!response?.data) {
    return { data: [], meta: {} }
  }

  const data = Array.isArray(response.data)
    ? (response.data as Record<string, unknown>[]).map((opportunity: Record<string, unknown>) => transformJsonApiOpportunity(opportunity, response.included as Record<string, unknown>[]))
    : transformJsonApiOpportunity(response.data as Record<string, unknown>, response.included as Record<string, unknown>[])

  return {
    data,
    meta: response.meta || {},
  }
}
