/**
 * CRM Module - SWR Hooks
 *
 * Data fetching and mutation hooks for CRM entities
 */

'use client'

import useSWR from 'swr'
import { useCallback } from 'react'
import {
  pipelineStagesService,
  leadsService,
  campaignsService,
  campaignLeadsService,
  activitiesService,
  opportunitiesService,
} from '../services'
import {
  transformPipelineStagesResponse,
  transformLeadsResponse,
  transformCampaignsResponse,
  transformActivitiesResponse,
  transformOpportunitiesResponse,
} from '../utils/transformers'
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
// PIPELINE STAGES HOOKS
// ============================================================================

export interface PipelineStagesFilters {
  isActive?: boolean
  search?: string
}

export const usePipelineStages = (params?: PipelineStagesFilters) => {
  // Convert filters to API query parameters
  const queryParams: Record<string, unknown> = {}

  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.isActive !== undefined) {
    queryParams['filter[is_active]'] = params.isActive ? '1' : '0'
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/pipeline-stages', queryParams]
    : '/api/v1/pipeline-stages'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await pipelineStagesService.getAll(queryParams)
      const transformed = transformPipelineStagesResponse(response)
      return transformed
    }
  )

  return {
    pipelineStages: (Array.isArray(data?.data) ? data.data : []) as PipelineStage[],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const usePipelineStage = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/pipeline-stages/${id}` : null,
    async () => {
      const response = await pipelineStagesService.getById(id)
      const transformed = transformPipelineStagesResponse(response)
      return Array.isArray(transformed.data) ? transformed.data[0] : transformed.data
    }
  )

  return {
    pipelineStage: data,
    isLoading,
    error,
    mutate,
  }
}

export const usePipelineStagesMutations = () => {
  return {
    createPipelineStage: useCallback(async (data: PipelineStageFormData) => {
      return await pipelineStagesService.create(data)
    }, []),

    updatePipelineStage: useCallback(async (id: string, data: PipelineStageFormData) => {
      return await pipelineStagesService.update(id, data)
    }, []),

    deletePipelineStage: useCallback(async (id: string) => {
      return await pipelineStagesService.delete(id)
    }, []),
  }
}

// ============================================================================
// LEADS HOOKS
// ============================================================================

export interface LeadsFilters {
  search?: string
  status?: string
  rating?: string
  userId?: number
  pipelineStageId?: number
  dateFrom?: string
  dateTo?: string
}

export const useLeads = (params?: LeadsFilters) => {
  // Convert filters to API query parameters
  const queryParams: Record<string, unknown> = {}

  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.rating) {
    queryParams['filter[rating]'] = params.rating
  }
  if (params?.userId) {
    queryParams['filter[user_id]'] = params.userId
  }
  if (params?.pipelineStageId) {
    queryParams['filter[pipeline_stage_id]'] = params.pipelineStageId
  }
  if (params?.dateFrom) {
    queryParams['filter[date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[date_to]'] = params.dateTo
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/leads', queryParams]
    : '/api/v1/leads'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await leadsService.getAll(queryParams)
      const transformed = transformLeadsResponse(response)
      return transformed
    }
  )

  return {
    leads: (Array.isArray(data?.data) ? data.data : []) as Lead[],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const useLead = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/leads/${id}` : null,
    async () => {
      const response = await leadsService.getById(id)
      const transformed = transformLeadsResponse(response)
      return Array.isArray(transformed.data) ? transformed.data[0] : transformed.data
    }
  )

  return {
    lead: data,
    isLoading,
    error,
    mutate,
  }
}

export const useLeadsMutations = () => {
  return {
    createLead: useCallback(async (data: LeadFormData) => {
      return await leadsService.create(data)
    }, []),

    updateLead: useCallback(async (id: string, data: LeadFormData) => {
      return await leadsService.update(id, data)
    }, []),

    deleteLead: useCallback(async (id: string) => {
      return await leadsService.delete(id)
    }, []),
  }
}

// ============================================================================
// CAMPAIGNS HOOKS
// ============================================================================

export interface CampaignsFilters {
  search?: string
  status?: string
  type?: string
  userId?: number
  dateFrom?: string
  dateTo?: string
}

export const useCampaigns = (params?: CampaignsFilters) => {
  // Convert filters to API query parameters
  const queryParams: Record<string, unknown> = {}

  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.type) {
    queryParams['filter[type]'] = params.type
  }
  if (params?.userId) {
    queryParams['filter[user_id]'] = params.userId
  }
  if (params?.dateFrom) {
    queryParams['filter[start_date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[start_date_to]'] = params.dateTo
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/campaigns', queryParams]
    : '/api/v1/campaigns'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await campaignsService.getAll(queryParams)
      const transformed = transformCampaignsResponse(response)
      return transformed
    }
  )

  return {
    campaigns: (Array.isArray(data?.data) ? data.data : []) as Campaign[],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const useCampaign = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/campaigns/${id}` : null,
    async () => {
      const response = await campaignsService.getById(id)
      const transformed = transformCampaignsResponse(response)
      return Array.isArray(transformed.data) ? transformed.data[0] : transformed.data
    }
  )

  return {
    campaign: data,
    isLoading,
    error,
    mutate,
  }
}

export const useCampaignsMutations = () => {
  return {
    createCampaign: useCallback(async (data: CampaignFormData) => {
      return await campaignsService.create(data)
    }, []),

    updateCampaign: useCallback(async (id: string, data: CampaignFormData) => {
      return await campaignsService.update(id, data)
    }, []),

    deleteCampaign: useCallback(async (id: string) => {
      return await campaignsService.delete(id)
    }, []),

    addLeadsToCampaign: useCallback(async (campaignId: string, leadIds: string[]) => {
      return await campaignLeadsService.addLeads(campaignId, leadIds)
    }, []),

    removeLeadsFromCampaign: useCallback(async (campaignId: string, leadIds: string[]) => {
      return await campaignLeadsService.removeLeads(campaignId, leadIds)
    }, []),
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Hook to calculate campaign ROI
export const useCampaignROI = (campaignId: string) => {
  const { campaign, isLoading } = useCampaign(campaignId)

  const roi = campaign
    ? calculateROI(
        campaign.actualRevenue || 0,
        campaign.actualCost || 0
      )
    : null

  return {
    roi,
    isLoading,
  }
}

function calculateROI(revenue: number, cost: number): number {
  if (cost === 0) return 0
  return ((revenue - cost) / cost) * 100
}

// ============================================================================
// ACTIVITIES HOOKS
// ============================================================================

export interface ActivitiesFilters {
  search?: string
  activityType?: string
  status?: string
  priority?: string
  userId?: number
  leadId?: number
  opportunityId?: number
  dateFrom?: string
  dateTo?: string
}

export const useActivities = (params?: ActivitiesFilters) => {
  // Convert filters to API query parameters
  const queryParams: Record<string, unknown> = {}

  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.activityType) {
    queryParams['filter[activity_type]'] = params.activityType
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.priority) {
    queryParams['filter[priority]'] = params.priority
  }
  if (params?.userId) {
    queryParams['filter[user_id]'] = params.userId
  }
  if (params?.leadId) {
    queryParams['filter[lead_id]'] = params.leadId
  }
  if (params?.opportunityId) {
    queryParams['filter[opportunity_id]'] = params.opportunityId
  }
  if (params?.dateFrom) {
    queryParams['filter[activity_date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[activity_date_to]'] = params.dateTo
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/activities', queryParams]
    : '/api/v1/activities'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await activitiesService.getAll(queryParams)
      const transformed = transformActivitiesResponse(response)
      return transformed
    }
  )

  return {
    activities: (Array.isArray(data?.data) ? data.data : []) as Activity[],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const useActivity = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/activities/${id}` : null,
    async () => {
      const response = await activitiesService.getById(id)
      const transformed = transformActivitiesResponse(response)
      return Array.isArray(transformed.data) ? transformed.data[0] : transformed.data
    }
  )

  return {
    activity: data,
    isLoading,
    error,
    mutate,
  }
}

export const useActivitiesMutations = () => {
  return {
    createActivity: useCallback(async (data: ActivityFormData) => {
      return await activitiesService.create(data)
    }, []),

    updateActivity: useCallback(async (id: string, data: ActivityFormData) => {
      return await activitiesService.update(id, data)
    }, []),

    deleteActivity: useCallback(async (id: string) => {
      return await activitiesService.delete(id)
    }, []),
  }
}

// ============================================================================
// OPPORTUNITIES HOOKS
// ============================================================================

export interface OpportunitiesFilters {
  search?: string
  status?: string
  stage?: string
  forecastCategory?: string
  userId?: number
  pipelineStageId?: number
  dateFrom?: string
  dateTo?: string
}

export const useOpportunities = (params?: OpportunitiesFilters) => {
  // Convert filters to API query parameters
  const queryParams: Record<string, unknown> = {}

  if (params?.search) {
    queryParams['filter[search]'] = params.search
  }
  if (params?.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params?.stage) {
    queryParams['filter[stage]'] = params.stage
  }
  if (params?.forecastCategory) {
    queryParams['filter[forecast_category]'] = params.forecastCategory
  }
  if (params?.userId) {
    queryParams['filter[user_id]'] = params.userId
  }
  if (params?.pipelineStageId) {
    queryParams['filter[pipeline_stage_id]'] = params.pipelineStageId
  }
  if (params?.dateFrom) {
    queryParams['filter[close_date_from]'] = params.dateFrom
  }
  if (params?.dateTo) {
    queryParams['filter[close_date_to]'] = params.dateTo
  }

  const key = Object.keys(queryParams).length > 0
    ? ['/api/v1/opportunities', queryParams]
    : '/api/v1/opportunities'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await opportunitiesService.getAll(queryParams)
      const transformed = transformOpportunitiesResponse(response)
      return transformed
    }
  )

  return {
    opportunities: (Array.isArray(data?.data) ? data.data : []) as Opportunity[],
    meta: data?.meta || {},
    isLoading,
    error,
    mutate,
  }
}

export const useOpportunity = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/opportunities/${id}` : null,
    async () => {
      const response = await opportunitiesService.getById(id)
      const transformed = transformOpportunitiesResponse(response)
      return Array.isArray(transformed.data) ? transformed.data[0] : transformed.data
    }
  )

  return {
    opportunity: data,
    isLoading,
    error,
    mutate,
  }
}

export const useOpportunitiesMutations = () => {
  return {
    createOpportunity: useCallback(async (data: OpportunityFormData) => {
      return await opportunitiesService.create(data)
    }, []),

    updateOpportunity: useCallback(async (id: string, data: OpportunityFormData) => {
      return await opportunitiesService.update(id, data)
    }, []),

    deleteOpportunity: useCallback(async (id: string) => {
      return await opportunitiesService.delete(id)
    }, []),
  }
}

// ============================================================================
// OPPORTUNITY UTILITY HOOKS
// ============================================================================

// Hook to calculate opportunity expected revenue
export const useOpportunityExpectedRevenue = (opportunityId: string) => {
  const { opportunity, isLoading } = useOpportunity(opportunityId)

  const expectedRevenue = opportunity
    ? (opportunity.amount * opportunity.probability) / 100
    : null

  return {
    expectedRevenue,
    isLoading,
  }
}

// Hook to get pipeline metrics
export const usePipelineMetrics = () => {
  const { opportunities, isLoading } = useOpportunities({ status: 'open' })

  const metrics = opportunities.reduce(
    (acc, opp) => {
      acc.totalAmount += opp.amount || 0
      acc.totalExpectedRevenue += opp.expectedRevenue || 0
      acc.count += 1

      // Group by stage
      if (!acc.byStage[opp.stage]) {
        acc.byStage[opp.stage] = { amount: 0, expectedRevenue: 0, count: 0 }
      }
      acc.byStage[opp.stage].amount += opp.amount || 0
      acc.byStage[opp.stage].expectedRevenue += opp.expectedRevenue || 0
      acc.byStage[opp.stage].count += 1

      return acc
    },
    {
      totalAmount: 0,
      totalExpectedRevenue: 0,
      count: 0,
      byStage: {} as Record<string, { amount: number; expectedRevenue: number; count: number }>,
    }
  )

  return {
    metrics,
    isLoading,
  }
}
