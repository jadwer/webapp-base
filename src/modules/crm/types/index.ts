/**
 * CRM Module - TypeScript Types
 *
 * Entities: PipelineStage, Lead, Campaign
 * Backend: Laravel JSON:API
 */

// ============================================================================
// PIPELINE STAGE
// ============================================================================

export interface PipelineStage {
  id: string;
  name: string;
  order: number;                   // 1-100
  probability: number;             // 0-100 (percentage)
  isActive: boolean;
  color?: string;                  // Hex color (#RRGGBB)
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601
}

export interface PipelineStageFormData {
  name: string;
  order: number;
  probability: number;
  isActive: boolean;
  color?: string;
  description?: string;
}

// ============================================================================
// LEAD
// ============================================================================

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'converted'
  | 'lost';

export type LeadRating = 'hot' | 'warm' | 'cold';

export interface Lead {
  id: string;
  title: string;
  status: LeadStatus;
  rating: LeadRating;
  source?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  estimatedValue?: number;
  expectedCloseDate?: string;      // YYYY-MM-DD
  actualCloseDate?: string;        // YYYY-MM-DD
  convertedAt?: string;            // ISO 8601
  lostReason?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601

  // Relationships
  userId: number;
  contactId?: number;
  pipelineStageId?: number;

  // Included relationships (populated by SWR)
  user?: any;
  contact?: any;
  pipelineStage?: PipelineStage;
  campaigns?: Campaign[];
}

export interface LeadFormData {
  title: string;
  status: LeadStatus;
  rating: LeadRating;
  source?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  estimatedValue?: number;
  expectedCloseDate?: string;
  notes?: string;
  userId: number;
  contactId?: number;
  pipelineStageId?: number;
}

// ============================================================================
// CAMPAIGN
// ============================================================================

export type CampaignType =
  | 'email'
  | 'social_media'
  | 'event'
  | 'webinar'
  | 'direct_mail'
  | 'telemarketing';

export type CampaignStatus =
  | 'planning'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;               // YYYY-MM-DD
  endDate?: string;                // YYYY-MM-DD

  // Financial metrics
  budget?: number;
  actualCost?: number;
  expectedRevenue?: number;
  actualRevenue?: number;

  // Additional info
  targetAudience?: string;
  description?: string;
  metadata?: Record<string, any>;

  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601

  // Relationships
  userId: number;

  // Included relationships
  user?: any;
  leads?: Lead[];
}

export interface CampaignFormData {
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  expectedRevenue?: number;
  actualRevenue?: number;
  targetAudience?: string;
  description?: string;
  userId: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface CampaignROI {
  revenue: number;
  cost: number;
  roi: number;                     // Percentage
  profit: number;
}

export interface LeadStatusCount {
  status: LeadStatus;
  count: number;
}

export interface PipelineStageWithLeads extends PipelineStage {
  leadsCount: number;
  leads?: Lead[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PipelineStageResponse {
  data: {
    id: string;
    type: 'pipeline-stages';
    attributes: Omit<PipelineStage, 'id'>;
    relationships?: any;
  };
}

export interface PipelineStagesResponse {
  data: Array<{
    id: string;
    type: 'pipeline-stages';
    attributes: Omit<PipelineStage, 'id'>;
  }>;
  links?: any;
  meta?: any;
}

export interface LeadResponse {
  data: {
    id: string;
    type: 'leads';
    attributes: Omit<Lead, 'id' | 'user' | 'contact' | 'pipelineStage' | 'campaigns'>;
    relationships?: any;
  };
  included?: any[];
}

export interface LeadsResponse {
  data: Array<{
    id: string;
    type: 'leads';
    attributes: Omit<Lead, 'id' | 'user' | 'contact' | 'pipelineStage' | 'campaigns'>;
    relationships?: any;
  }>;
  included?: any[];
  links?: any;
  meta?: any;
}

export interface CampaignResponse {
  data: {
    id: string;
    type: 'campaigns';
    attributes: Omit<Campaign, 'id' | 'user' | 'leads'>;
    relationships?: any;
  };
  included?: any[];
}

export interface CampaignsResponse {
  data: Array<{
    id: string;
    type: 'campaigns';
    attributes: Omit<Campaign, 'id' | 'user' | 'leads'>;
    relationships?: any;
  }>;
  included?: any[];
  links?: any;
  meta?: any;
}
