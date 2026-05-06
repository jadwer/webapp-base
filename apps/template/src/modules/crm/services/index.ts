/**
 * CRM Module - Services
 *
 * API layer for CRM entities (PipelineStage, Lead, Campaign, Activity, Opportunity)
 */

import axiosClient from '@/lib/axiosClient'
import type {
  PipelineStageFormData,
  LeadFormData,
  CampaignFormData,
  ActivityFormData,
  OpportunityFormData,
} from '../types'
import {
  transformPipelineStageFormToJsonApi,
  transformLeadFormToJsonApi,
  transformCampaignFormToJsonApi,
  transformActivityFormToJsonApi,
  transformOpportunityFormToJsonApi,
} from '../utils/transformers'

// ============================================================================
// PIPELINE STAGES SERVICE
// ============================================================================

export const pipelineStagesService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      const queryParams = new URLSearchParams()

      // Add filters if provided (removed sort=order as backend doesn't support it)
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
        : '/api/v1/pipeline-stages'

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(`/api/v1/pipeline-stages/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: PipelineStageFormData) => {
    try {
      const payload = transformPipelineStageFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/pipeline-stages', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: PipelineStageFormData) => {
    try {
      const payload = transformPipelineStageFormToJsonApi(data, 'pipeline-stages', id)

      const response = await axiosClient.patch(`/api/v1/pipeline-stages/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/pipeline-stages/${id}`)
      return response.data
    } catch (error) {
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
      const queryParams = new URLSearchParams()

      // Add includes for relationships (valid: user, contact, campaigns, activities, opportunity)
      queryParams.append('include', 'user,contact')

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
        : '/api/v1/leads?include=user,contact'

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      // Valid includes: user, contact, campaigns, activities, opportunity
      const response = await axiosClient.get(
        `/api/v1/leads/${id}?include=user,contact,campaigns,activities`
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: LeadFormData) => {
    try {
      const payload = transformLeadFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/leads', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: LeadFormData) => {
    try {
      const payload = transformLeadFormToJsonApi(data, 'leads', id)

      const response = await axiosClient.patch(`/api/v1/leads/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/leads/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // ===== LEAD CONVERSION =====

  convert: async (id: string, options: { create_contact?: boolean; create_opportunity?: boolean } = {}): Promise<{
    lead: { id: number; status: string }
    contact?: { id: number; name: string }
    opportunity?: { id: number; title: string }
  }> => {
    const response = await axiosClient.post(`/api/v1/leads/${id}/convert`, {
      create_contact: options.create_contact ?? true,
      create_opportunity: options.create_opportunity ?? true
    })
    return response.data
  },
}

// ============================================================================
// CAMPAIGNS SERVICE
// ============================================================================

export const campaignsService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
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

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(`/api/v1/campaigns/${id}?include=user,leads`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: CampaignFormData) => {
    try {
      const payload = transformCampaignFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/campaigns', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: CampaignFormData) => {
    try {
      const payload = transformCampaignFormToJsonApi(data, 'campaigns', id)

      const response = await axiosClient.patch(`/api/v1/campaigns/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/campaigns/${id}`)
      return response.data
    } catch (error) {
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
      const payload = {
        data: leadIds.map(id => ({ type: 'leads', id }))
      }

      const response = await axiosClient.post(
        `/api/v1/campaigns/${campaignId}/relationships/leads`,
        payload
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Remove leads from campaign
  removeLeads: async (campaignId: string, leadIds: string[]) => {
    try {
      const payload = {
        data: leadIds.map(id => ({ type: 'leads', id }))
      }

      const response = await axiosClient.delete(
        `/api/v1/campaigns/${campaignId}/relationships/leads`,
        { data: payload }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },
}

// ============================================================================
// ACTIVITIES SERVICE
// ============================================================================

export const activitiesService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
      const queryParams = new URLSearchParams()

      // Add includes for relationships
      queryParams.append('include', 'user,lead,opportunity')

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
        ? `/api/v1/activities?${queryString}`
        : '/api/v1/activities?include=user,lead,opportunity'

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(
        `/api/v1/activities/${id}?include=user,lead,campaign,opportunity`
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: ActivityFormData) => {
    try {
      const payload = transformActivityFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/activities', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: ActivityFormData) => {
    try {
      const payload = transformActivityFormToJsonApi(data, 'activities', id)

      const response = await axiosClient.patch(`/api/v1/activities/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/activities/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // ===== QUICK LOG =====

  log: async (data: {
    type: string
    subject: string
    description?: string
    contact_id?: number
    lead_id?: number
    opportunity_id?: number
  }) => {
    const response = await axiosClient.post('/api/v1/activities/log', data)
    return response.data
  },
}

// ============================================================================
// OPPORTUNITIES SERVICE
// ============================================================================

export const opportunitiesService = {
  getAll: async (params?: Record<string, unknown>) => {
    try {
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
        ? `/api/v1/opportunities?${queryString}`
        : '/api/v1/opportunities?include=user,pipelineStage'

      const response = await axiosClient.get(url)

      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosClient.get(
        `/api/v1/opportunities/${id}?include=user,lead,pipelineStage,activities`
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data: OpportunityFormData) => {
    try {
      const payload = transformOpportunityFormToJsonApi(data)

      const response = await axiosClient.post('/api/v1/opportunities', payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id: string, data: OpportunityFormData) => {
    try {
      const payload = transformOpportunityFormToJsonApi(data, 'opportunities', id)

      const response = await axiosClient.patch(`/api/v1/opportunities/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete(`/api/v1/opportunities/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // ===== PIPELINE & FORECAST =====

  getPipeline: async (): Promise<{
    pipeline: Array<{ stage: string; count: number; value: number }>
    total: number
    totalValue: number
    weightedValue: number
  }> => {
    const response = await axiosClient.get('/api/v1/opportunities/pipeline')
    return response.data
  },

  getForecast: async (): Promise<{
    thisMonth: { expected: number; weighted: number; closed: number }
    nextMonth: { expected: number; weighted: number }
    quarter: { target: number; achieved: number; pipeline: number }
  }> => {
    const response = await axiosClient.get('/api/v1/opportunities/forecast')
    return response.data
  },

  // ===== CLOSE ACTIONS =====

  closeWon: async (id: string, notes?: string) => {
    const response = await axiosClient.post(`/api/v1/opportunities/${id}/close-won`, { notes })
    return response.data
  },

  closeLost: async (id: string, reason: string, notes?: string) => {
    const response = await axiosClient.post(`/api/v1/opportunities/${id}/close-lost`, { reason, notes })
    return response.data
  },
}

// ============================================================================
// CRM DASHBOARD SERVICE
// ============================================================================

export const crmDashboardService = {
  getDashboard: async (): Promise<{
    leads: { new: number; contacted: number; qualified: number }
    opportunities: { active: number; closingThisMonth: number; value: number }
    activities: { overdue: number; today: number; thisWeek: number }
    performance: { conversionRate: number; winRate: number; avgDealSize: number }
  }> => {
    const response = await axiosClient.get('/api/v1/crm/dashboard')
    return response.data
  },
}
