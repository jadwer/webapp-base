/**
 * CRM Module - Main Entry Point
 *
 * Centralized exports for the CRM module
 */

// Types
export type {
  PipelineStage,
  PipelineStageFormData,
  Lead,
  LeadFormData,
  LeadStatus,
  LeadRating,
  Campaign,
  CampaignFormData,
  CampaignType,
  CampaignStatus,
  CampaignROI,
  LeadStatusCount,
  PipelineStageWithLeads,
} from './types'

// Services
export {
  pipelineStagesService,
  leadsService,
  campaignsService,
  campaignLeadsService,
} from './services'

// Hooks
export {
  usePipelineStages,
  usePipelineStage,
  usePipelineStagesMutations,
  useLeads,
  useLead,
  useLeadsMutations,
  useCampaigns,
  useCampaign,
  useCampaignsMutations,
  useCampaignROI,
} from './hooks'

export type {
  PipelineStagesFilters,
  LeadsFilters,
  CampaignsFilters,
} from './hooks'

// Transformers
export {
  transformJsonApiPipelineStage,
  transformPipelineStageFormToJsonApi,
  transformPipelineStagesResponse,
  transformJsonApiLead,
  transformLeadFormToJsonApi,
  transformLeadsResponse,
  transformJsonApiCampaign,
  transformCampaignFormToJsonApi,
  transformCampaignsResponse,
} from './utils/transformers'

// Components
export {
  PipelineStagesTableSimple,
  PipelineStagesAdminPageReal,
  LeadsTableSimple,
  LeadsAdminPageReal,
  CampaignsTableSimple,
  CampaignsAdminPageReal,
} from './components'
