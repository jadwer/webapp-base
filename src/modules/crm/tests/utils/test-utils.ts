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
  LeadStatus,
  LeadRating,
  CampaignType,
  CampaignStatus,
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
  order: 1,
  probability: 10,
  isActive: true,
  color: '#3498db',
  description: 'Initial contact stage',
  metadata: {},
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Creates a list of mock pipeline stages
 */
export const createMockPipelineStages = (count: number = 5): PipelineStage[] => {
  const stages = [
    { name: 'Prospecting', order: 1, probability: 10, color: '#3498db' },
    { name: 'Qualification', order: 2, probability: 25, color: '#9b59b6' },
    { name: 'Proposal', order: 3, probability: 50, color: '#f39c12' },
    { name: 'Negotiation', order: 4, probability: 75, color: '#e67e22' },
    { name: 'Closed Won', order: 5, probability: 100, color: '#27ae60' },
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
  expectedCloseDate: '2025-06-30',
  notes: 'Interested in enterprise plan',
  metadata: {},
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
