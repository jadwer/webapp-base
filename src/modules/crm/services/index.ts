/**
 * CRM Module - Services
 *
 * API layer for CRM entities (PipelineStage, Lead, Campaign)
 */

import axiosClient from '@/lib/axiosClient'
import type {
  PipelineStageFormData,
  LeadFormData,
  CampaignFormData,
} from '../types'
import {
  transformPipelineStageFormToJsonApi,
  transformLeadFormToJsonApi,
  transformCampaignFormToJsonApi,
} from '../utils/transformers'

// ============================================================================
// PIPELINE STAGES SERVICE
// ============================================================================

export const pipelineStagesService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      console.log('🚀 [Service] Fetching pipeline stages with params:', params)

      const queryParams = new URLSearchParams()

      // Add sorting by order by default
      if (!params?.sort) {
        queryParams.append('sort', 'order')
      }

      // Add filters if provided
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/pipeline-stages?${queryString}`
        : '/api/v1/pipeline-stages?sort=order'

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Pipeline stages response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching pipeline stages:', error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      console.log('🚀 [Service] Fetching pipeline stage by ID:', id)
      const response = await axiosClient.get(`/api/v1/pipeline-stages/${id}`)
      console.log('✅ [Service] Pipeline stage response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching pipeline stage:', error)
      throw error
    }
  },

  create: async (data: PipelineStageFormData) => {
    try {
      console.log('🚀 [Service] Creating pipeline stage:', data)
      const payload = transformPipelineStageFormToJsonApi(data)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.post('/api/v1/pipeline-stages', payload)
      console.log('✅ [Service] Created pipeline stage:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error creating pipeline stage:', error)
      throw error
    }
  },

  update: async (id: string, data: PipelineStageFormData) => {
    try {
      console.log('🚀 [Service] Updating pipeline stage:', id, data)
      const payload = transformPipelineStageFormToJsonApi(data, 'pipeline-stages', id)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.patch(`/api/v1/pipeline-stages/${id}`, payload)
      console.log('✅ [Service] Updated pipeline stage:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error updating pipeline stage:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      console.log('🚀 [Service] Deleting pipeline stage:', id)
      const response = await axiosClient.delete(`/api/v1/pipeline-stages/${id}`)
      console.log('✅ [Service] Deleted pipeline stage')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error deleting pipeline stage:', error)
      throw error
    }
  },
}

// ============================================================================
// LEADS SERVICE
// ============================================================================

export const leadsService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      console.log('🚀 [Service] Fetching leads with params:', params)

      const queryParams = new URLSearchParams()

      // Add includes for relationships
      queryParams.append('include', 'user,pipelineStage')

      // Add filters if provided
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/leads?${queryString}`
        : '/api/v1/leads?include=user,pipelineStage'

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Leads response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching leads:', error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      console.log('🚀 [Service] Fetching lead by ID:', id)
      const response = await axiosClient.get(
        `/api/v1/leads/${id}?include=user,contact,pipelineStage,campaigns`
      )
      console.log('✅ [Service] Lead response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching lead:', error)
      throw error
    }
  },

  create: async (data: LeadFormData) => {
    try {
      console.log('🚀 [Service] Creating lead:', data)
      const payload = transformLeadFormToJsonApi(data)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.post('/api/v1/leads', payload)
      console.log('✅ [Service] Created lead:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error creating lead:', error)
      throw error
    }
  },

  update: async (id: string, data: LeadFormData) => {
    try {
      console.log('🚀 [Service] Updating lead:', id, data)
      const payload = transformLeadFormToJsonApi(data, 'leads', id)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.patch(`/api/v1/leads/${id}`, payload)
      console.log('✅ [Service] Updated lead:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error updating lead:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      console.log('🚀 [Service] Deleting lead:', id)
      const response = await axiosClient.delete(`/api/v1/leads/${id}`)
      console.log('✅ [Service] Deleted lead')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error deleting lead:', error)
      throw error
    }
  },
}

// ============================================================================
// CAMPAIGNS SERVICE
// ============================================================================

export const campaignsService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      console.log('🚀 [Service] Fetching campaigns with params:', params)

      const queryParams = new URLSearchParams()

      // Add includes for relationships
      queryParams.append('include', 'user')

      // Add filters if provided
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]))
          }
        })
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/api/v1/campaigns?${queryString}`
        : '/api/v1/campaigns?include=user'

      console.log('📡 [Service] Making request to:', url)
      const response = await axiosClient.get(url)
      console.log('✅ [Service] Campaigns response:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching campaigns:', error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      console.log('🚀 [Service] Fetching campaign by ID:', id)
      const response = await axiosClient.get(`/api/v1/campaigns/${id}?include=user,leads`)
      console.log('✅ [Service] Campaign response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error fetching campaign:', error)
      throw error
    }
  },

  create: async (data: CampaignFormData) => {
    try {
      console.log('🚀 [Service] Creating campaign:', data)
      const payload = transformCampaignFormToJsonApi(data)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.post('/api/v1/campaigns', payload)
      console.log('✅ [Service] Created campaign:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error creating campaign:', error)
      throw error
    }
  },

  update: async (id: string, data: CampaignFormData) => {
    try {
      console.log('🚀 [Service] Updating campaign:', id, data)
      const payload = transformCampaignFormToJsonApi(data, 'campaigns', id)
      console.log('📦 [Service] JSON:API payload:', payload)

      const response = await axiosClient.patch(`/api/v1/campaigns/${id}`, payload)
      console.log('✅ [Service] Updated campaign:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error updating campaign:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      console.log('🚀 [Service] Deleting campaign:', id)
      const response = await axiosClient.delete(`/api/v1/campaigns/${id}`)
      console.log('✅ [Service] Deleted campaign')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error deleting campaign:', error)
      throw error
    }
  },
}

// ============================================================================
// CAMPAIGN-LEAD RELATIONSHIP SERVICE
// ============================================================================

export const campaignLeadsService = {
  // Add leads to campaign (many-to-many)
  addLeads: async (campaignId: string, leadIds: string[]) => {
    try {
      console.log('🚀 [Service] Adding leads to campaign:', campaignId, leadIds)
      const payload = {
        data: leadIds.map(id => ({ type: 'leads', id }))
      }

      const response = await axiosClient.post(
        `/api/v1/campaigns/${campaignId}/relationships/leads`,
        payload
      )
      console.log('✅ [Service] Added leads to campaign')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error adding leads to campaign:', error)
      throw error
    }
  },

  // Remove leads from campaign
  removeLeads: async (campaignId: string, leadIds: string[]) => {
    try {
      console.log('🚀 [Service] Removing leads from campaign:', campaignId, leadIds)
      const payload = {
        data: leadIds.map(id => ({ type: 'leads', id }))
      }

      const response = await axiosClient.delete(
        `/api/v1/campaigns/${campaignId}/relationships/leads`,
        { data: payload }
      )
      console.log('✅ [Service] Removed leads from campaign')
      return response.data
    } catch (error) {
      console.error('❌ [Service] Error removing leads from campaign:', error)
      throw error
    }
  },
}
