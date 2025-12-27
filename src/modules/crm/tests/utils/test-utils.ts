/**
 * CRM Module - Test Utilities
 *
 * Mock factories and test helpers for CRM entities
 */

import { vi } from 'vitest';
import type {
  PipelineStage,
  Lead,
  Campaign,
  Activity,
  Opportunity,
  LeadStatus,
  LeadRating,
  CampaignType,
  CampaignStatus,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  OpportunityStatus,
  ForecastCategory,
} from '../../types';

// ============================================================================
// MOCK FACTORIES
// ============================================================================

/**
 * Creates a mock PipelineStage object with optional overrides
 */
export const createMockPipelineStage = (
  overrides?: Partial<PipelineStage>
): PipelineStage => ({
  id: '1',
  name: 'Prospecting',
  stageType: 'lead',
  sortOrder: 1,
  probability: 10,
  isActive: true,
  isClosedWon: false,
  isClosedLost: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Creates a list of mock pipeline stages
 */
export const createMockPipelineStages = (count: number = 5): PipelineStage[] => {
  const stages = [
    { name: 'Prospecting', sortOrder: 1, probability: 10, stageType: 'lead' as const },
    { name: 'Qualification', sortOrder: 2, probability: 25, stageType: 'lead' as const },
    { name: 'Proposal', sortOrder: 3, probability: 50, stageType: 'opportunity' as const },
    { name: 'Negotiation', sortOrder: 4, probability: 75, stageType: 'opportunity' as const },
    { name: 'Closed Won', sortOrder: 5, probability: 100, stageType: 'opportunity' as const, isClosedWon: true },
  ];

  return stages.slice(0, count).map((stage, index) =>
    createMockPipelineStage({
      id: String(index + 1),
      ...stage,
    })
  );
};

/**
 * Creates a mock Lead object with optional overrides
 */
export const createMockLead = (overrides?: Partial<Lead>): Lead => ({
  id: '1',
  title: 'Potential customer from web form',
  status: 'new' as LeadStatus,
  rating: 'warm' as LeadRating,
  source: 'website',
  companyName: 'Acme Corporation',
  email: 'contact@acme.com',
  phone: '+52-555-1234',
  estimatedValue: 50000,
  estimatedCloseDate: '2025-06-30',
  notes: 'Interested in enterprise plan',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  userId: 1,
  contactId: 10,
  pipelineStageId: 1,
  ...overrides,
});

/**
 * Creates a list of mock leads
 */
export const createMockLeads = (count: number = 3): Lead[] => {
  const statuses: LeadStatus[] = ['new', 'contacted', 'qualified'];
  const ratings: LeadRating[] = ['hot', 'warm', 'cold'];
  const companies = ['Acme Corp', 'Tech Solutions', 'Global Industries'];

  return Array.from({ length: count }, (_, index) =>
    createMockLead({
      id: String(index + 1),
      title: `Lead from ${companies[index % companies.length]}`,
      status: statuses[index % statuses.length],
      rating: ratings[index % ratings.length],
      companyName: companies[index % companies.length],
      email: `contact${index + 1}@example.com`,
      estimatedValue: (index + 1) * 10000,
    })
  );
};

/**
 * Creates a mock Campaign object with optional overrides
 */
export const createMockCampaign = (overrides?: Partial<Campaign>): Campaign => ({
  id: '1',
  name: 'Q1 2025 Email Campaign',
  type: 'email' as CampaignType,
  status: 'active' as CampaignStatus,
  startDate: '2025-01-01',
  endDate: '2025-03-31',
  budget: 10000,
  actualCost: 7500,
  expectedRevenue: 50000,
  actualRevenue: 35000,
  targetAudience: 'Small business owners',
  description: 'Quarterly email campaign targeting SMBs',
  metadata: {},
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  userId: 1,
  ...overrides,
});

/**
 * Creates a list of mock campaigns
 */
export const createMockCampaigns = (count: number = 3): Campaign[] => {
  const types: CampaignType[] = ['email', 'social_media', 'event'];
  const statuses: CampaignStatus[] = ['planning', 'active', 'completed'];
  const names = ['Email Campaign', 'Social Media Ads', 'Webinar Series'];

  return Array.from({ length: count }, (_, index) =>
    createMockCampaign({
      id: String(index + 1),
      name: `Q${index + 1} 2025 ${names[index % names.length]}`,
      type: types[index % types.length],
      status: statuses[index % statuses.length],
      budget: (index + 1) * 5000,
      expectedRevenue: (index + 1) * 25000,
    })
  );
};

/**
 * Creates a mock Activity object with optional overrides
 */
export const createMockActivity = (overrides?: Partial<Activity>): Activity => ({
  id: '1',
  subject: 'Follow-up call with prospect',
  activityType: 'call' as ActivityType,
  status: 'pending' as ActivityStatus,
  description: 'Discuss pricing and timeline',
  activityDate: '2025-01-15',
  dueDate: '2025-01-20',
  duration: 30,
  outcome: undefined,
  priority: 'medium' as ActivityPriority,
  metadata: {},
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  userId: 1,
  leadId: 1,
  ...overrides,
});

/**
 * Creates a list of mock activities
 */
export const createMockActivities = (count: number = 3): Activity[] => {
  const types: ActivityType[] = ['call', 'email', 'meeting', 'note', 'task'];
  const statuses: ActivityStatus[] = ['pending', 'in_progress', 'completed'];
  const priorities: ActivityPriority[] = ['low', 'medium', 'high'];
  const subjects = [
    'Follow-up call',
    'Send proposal email',
    'Client meeting',
    'Internal note',
    'Review contract',
  ];

  return Array.from({ length: count }, (_, index) =>
    createMockActivity({
      id: String(index + 1),
      subject: subjects[index % subjects.length],
      activityType: types[index % types.length],
      status: statuses[index % statuses.length],
      priority: priorities[index % priorities.length],
      activityDate: `2025-01-${String(index + 10).padStart(2, '0')}`,
      dueDate: `2025-01-${String(index + 15).padStart(2, '0')}`,
      duration: (index + 1) * 15,
    })
  );
};

/**
 * Creates a mock Opportunity object with optional overrides
 */
export const createMockOpportunity = (overrides?: Partial<Opportunity>): Opportunity => {
  const amount = overrides?.amount ?? 100000;
  const probability = overrides?.probability ?? 50;
  return {
    id: '1',
    name: 'Enterprise Software License',
    description: 'Annual software license for enterprise client',
    amount,
    probability,
    expectedRevenue: amount * probability / 100,
    closeDate: '2025-06-30',
    status: 'open' as OpportunityStatus,
    stage: 'proposal',
    forecastCategory: 'pipeline' as ForecastCategory,
    source: 'website',
    nextStep: 'Schedule demo',
    metadata: {},
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    userId: 1,
    leadId: 1,
    pipelineStageId: 3,
    ...overrides,
  };
};

/**
 * Creates a list of mock opportunities
 */
export const createMockOpportunities = (count: number = 3): Opportunity[] => {
  const statuses: OpportunityStatus[] = ['open', 'won', 'lost'];
  const stages = ['proposal', 'negotiation', 'closed'];
  const categories: ForecastCategory[] = ['pipeline', 'best_case', 'commit'];
  const names = [
    'Enterprise License',
    'Consulting Project',
    'Support Contract',
  ];

  return Array.from({ length: count }, (_, index) => {
    const amount = (index + 1) * 50000;
    const probability = [50, 75, 25][index % 3];
    return createMockOpportunity({
      id: String(index + 1),
      name: names[index % names.length],
      amount,
      probability,
      expectedRevenue: amount * probability / 100,
      status: statuses[index % statuses.length],
      stage: stages[index % stages.length],
      forecastCategory: categories[index % categories.length],
      closeDate: `2025-0${index + 3}-30`,
    });
  });
};

// ============================================================================
// API RESPONSE MOCKS
// ============================================================================

/**
 * Creates a mock JSON:API response for a single resource
 */
export const createMockAPIResponse = <T extends Record<string, unknown>>(
  id: string,
  type: string,
  attributes: T
) => ({
  data: {
    id,
    type,
    attributes,
  },
});

/**
 * Creates a mock JSON:API collection response
 */
export const createMockAPICollectionResponse = <T extends Record<string, unknown>>(
  items: Array<{ id: string; attributes: T }>,
  type: string
) => ({
  data: items.map(item => ({
    id: item.id,
    type,
    attributes: item.attributes,
  })),
  meta: {
    total: items.length,
    per_page: 15,
    current_page: 1,
    last_page: 1,
  },
});

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Creates a mock axios error
 */
export const createMockAxiosError = (
  status: number,
  message: string
): Error => {
  const error = new Error(message) as Error & {
    response?: { status: number; data: { message: string } };
  };
  error.response = {
    status,
    data: { message },
  };
  return error;
};

/**
 * Waits for a specific condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 3000
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

/**
 * Mock console methods for cleaner test output
 * Note: This function should be called within test files, not in utils
 */
// export const mockConsole = () => {
//   const originalLog = console.log;
//   const originalError = console.error;
//   const originalWarn = console.warn;

//   beforeEach(() => {
//     console.log = vi.fn();
//     console.error = vi.fn();
//     console.warn = vi.fn();
//   });

//   afterEach(() => {
//     console.log = originalLog;
//     console.error = originalError;
//     console.warn = originalWarn;
//   });
// };
