/**
 * CRM Module - SWR Hooks
 *
 * Data fetching and mutation hooks for CRM entities
 */

import useSWR from 'swr'
import { useCallback } from 'react'
import {
  pipelineStagesService,
  leadsService,
  campaignsService,
  campaignLeadsService,
} from '../services'
import {
  transformPipelineStagesResponse,
  transformLeadsResponse,
  transformCampaignsResponse,
} from '../utils/transformers'
import type {
  PipelineStageFormData,
  LeadFormData,
  CampaignFormData,
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
  const queryParams: any = {}

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
      console.log('🔄 [Hook] Raw pipeline stages response:', response)
      const transformed = transformPipelineStagesResponse(response)
      console.log('✅ [Hook] Transformed pipeline stages:', transformed)
      return transformed
    }
  )

  return {
    pipelineStages: data?.data || [],
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
      console.log('🔄 [Hook] Raw pipeline stage response:', response)
      const transformed = transformPipelineStagesResponse(response)
      console.log('✅ [Hook] Transformed pipeline stage:', transformed.data)
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
  const queryParams: any = {}

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
      console.log('🔄 [Hook] Raw leads response:', response)
      const transformed = transformLeadsResponse(response)
      console.log('✅ [Hook] Transformed leads:', transformed)
      return transformed
    }
  )

  return {
    leads: data?.data || [],
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
      console.log('🔄 [Hook] Raw lead response:', response)
      const transformed = transformLeadsResponse(response)
      console.log('✅ [Hook] Transformed lead:', transformed.data)
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
  const queryParams: any = {}

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
      console.log('🔄 [Hook] Raw campaigns response:', response)
      const transformed = transformCampaignsResponse(response)
      console.log('✅ [Hook] Transformed campaigns:', transformed)
      return transformed
    }
  )

  return {
    campaigns: data?.data || [],
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
      console.log('🔄 [Hook] Raw campaign response:', response)
      const transformed = transformCampaignsResponse(response)
      console.log('✅ [Hook] Transformed campaign:', transformed.data)
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
