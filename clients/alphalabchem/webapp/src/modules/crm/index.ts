/**
 * CRM Module - Main Entry Point
 *
 * Centralized exports for the CRM module
 * Entities: PipelineStage, Lead, Campaign, Activity, Opportunity
 */

// Types
export type {
  // Pipeline Stage
  PipelineStage,
  PipelineStageFormData,
  StageType,
  // Lead
  Lead,
  LeadFormData,
  LeadStatus,
  LeadRating,
  // Campaign
  Campaign,
  CampaignFormData,
  CampaignType,
  CampaignStatus,
  // Activity
  Activity,
  ActivityFormData,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  // Opportunity
  Opportunity,
  OpportunityFormData,
  OpportunityStatus,
  ForecastCategory,
  // Utility types
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
  activitiesService,
  opportunitiesService,
} from './services'

// Hooks
export {
  // Pipeline Stages
  usePipelineStages,
  usePipelineStage,
  usePipelineStagesMutations,
  // Leads
  useLeads,
  useLead,
  useLeadsMutations,
  // Campaigns
  useCampaigns,
  useCampaign,
  useCampaignsMutations,
  useCampaignROI,
  // Activities
  useActivities,
  useActivity,
  useActivitiesMutations,
  // Opportunities
  useOpportunities,
  useOpportunity,
  useOpportunitiesMutations,
  useOpportunityExpectedRevenue,
  usePipelineMetrics,
} from './hooks'

export type {
  PipelineStagesFilters,
  LeadsFilters,
  CampaignsFilters,
  ActivitiesFilters,
  OpportunitiesFilters,
} from './hooks'

// Transformers
export {
  // Pipeline Stage
  transformJsonApiPipelineStage,
  transformPipelineStageFormToJsonApi,
  transformPipelineStagesResponse,
  // Lead
  transformJsonApiLead,
  transformLeadFormToJsonApi,
  transformLeadsResponse,
  // Campaign
  transformJsonApiCampaign,
  transformCampaignFormToJsonApi,
  transformCampaignsResponse,
  // Activity
  transformJsonApiActivity,
  transformActivityFormToJsonApi,
  transformActivitiesResponse,
  // Opportunity
  transformJsonApiOpportunity,
  transformOpportunityFormToJsonApi,
  transformOpportunitiesResponse,
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
