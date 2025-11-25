/**
 * CRM Module - TypeScript Types
 *
 * Entities: PipelineStage, Lead, Campaign
 * Backend: Laravel JSON:API
 */

// ============================================================================
// PIPELINE STAGE
// ============================================================================

export type StageType = 'lead' | 'opportunity';

export interface PipelineStage {
  id: string;
  name: string;
  stageType: StageType;            // Tipo de etapa (lead u opportunity)
  probability: number;             // 0-100 (percentage)
  sortOrder: number;               // Orden de visualización (entero >= 0)
  isActive: boolean;
  isClosedWon: boolean;            // Marca como etapa cerrada ganada
  isClosedLost: boolean;           // Marca como etapa cerrada perdida
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601
}

export interface PipelineStageFormData {
  name: string;
  stageType: StageType;
  probability: number;
  sortOrder: number;
  isActive?: boolean;
  isClosedWon?: boolean;
  isClosedLost?: boolean;
}

// ============================================================================
// LEAD
// ============================================================================

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'unqualified'
  | 'converted';

export type LeadRating = 'hot' | 'warm' | 'cold';

export interface Lead {
  id: string;
  title: string;
  status: LeadStatus;
  rating: LeadRating;
  source?: string;
  companyName?: string;
  contactPerson?: string;          // Nombre de la persona de contacto
  email?: string;
  phone?: string;
  estimatedValue?: number;
  estimatedCloseDate?: string;     // YYYY-MM-DD (renamed from expectedCloseDate)
  convertedAt?: string;            // ISO 8601
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601

  // Relationships
  userId: number;
  contactId?: number;
  pipelineStageId?: number;

  // Included relationships (populated by SWR)
  user?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  pipelineStage?: PipelineStage;
  campaigns?: Campaign[];
}

export interface LeadFormData {
  title: string;
  status: LeadStatus;
  rating: LeadRating;
  source?: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  estimatedValue?: number;
  estimatedCloseDate?: string;     // Renamed from expectedCloseDate
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
  metadata?: Record<string, unknown>;

  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601

  // Relationships
  userId: number;

  // Included relationships
  user?: Record<string, unknown>;
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
    relationships?: Record<string, unknown>;
  };
}

export interface PipelineStagesResponse {
  data: Array<{
    id: string;
    type: 'pipeline-stages';
    attributes: Omit<PipelineStage, 'id'>;
  }>;
  links?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface LeadResponse {
  data: {
    id: string;
    type: 'leads';
    attributes: Omit<Lead, 'id' | 'user' | 'contact' | 'pipelineStage' | 'campaigns'>;
    relationships?: Record<string, unknown>;
  };
  included?: Record<string, unknown>[];
}

export interface LeadsResponse {
  data: Array<{
    id: string;
    type: 'leads';
    attributes: Omit<Lead, 'id' | 'user' | 'contact' | 'pipelineStage' | 'campaigns'>;
    relationships?: Record<string, unknown>;
  }>;
  included?: Record<string, unknown>[];
  links?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface CampaignResponse {
  data: {
    id: string;
    type: 'campaigns';
    attributes: Omit<Campaign, 'id' | 'user' | 'leads'>;
    relationships?: Record<string, unknown>;
  };
  included?: Record<string, unknown>[];
}

export interface CampaignsResponse {
  data: Array<{
    id: string;
    type: 'campaigns';
    attributes: Omit<Campaign, 'id' | 'user' | 'leads'>;
    relationships?: Record<string, unknown>;
  }>;
  included?: Record<string, unknown>[];
  links?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}
