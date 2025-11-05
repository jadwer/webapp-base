// Accounting Services - Phase 1
// Simple CRUD operations for Chart of Accounts and Journal Entries

import axiosClient from '@/lib/axiosClient';
import {
  transformAccountsFromAPI,
  transformAccountFromAPI,
  transformAccountToAPI,
  transformJournalEntryToAPI,
  transformJournalLineToAPI,
} from '../utils/transformers';
import type {
  Account,
  JournalEntry,
  JournalLine,
  AccountForm,
  JournalEntryForm,
  JournalLineForm,
  JournalEntryWithLines,
  AccountingAPIResponse,
} from '../types';

// Accounts Service
export const accountsService = {
  async getAll(params: Record<string, any> = {}): Promise<AccountingAPIResponse<Account>> {
    const response = await axiosClient.get('/api/v1/accounts', { params });
    const transformedData = transformAccountsFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string): Promise<{ data: Account }> {
    const response = await axiosClient.get(`/api/v1/accounts/${id}`);
    return {
      data: transformAccountFromAPI(response.data.data)
    };
  },

  async create(data: AccountForm): Promise<{ data: Account }> {
    const payload = transformAccountToAPI(data);
    const response = await axiosClient.post('/api/v1/accounts', payload);
    return {
      data: transformAccountFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<AccountForm>): Promise<{ data: Account }> {
    const response = await axiosClient.patch(`/api/v1/accounts/${id}`, {
      data: {
        type: 'accounts',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/accounts/${id}`);
  },

  // Helper method to get only postable accounts for journal lines
  async getPostableAccounts(params: Record<string, any> = {}): Promise<AccountingAPIResponse<Account>> {
    return this.getAll({ ...params, 'filter[isPostable]': 1 });
  },
};

// Journal Entries Service
export const journalEntriesService = {
  async getAll(params: Record<string, any> = {}): Promise<AccountingAPIResponse<JournalEntry>> {
    const response = await axiosClient.get('/api/v1/journal-entries', { params });
    return response.data;
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: JournalEntry }> {
    const includeParam = includes.length > 0 ? `?include=${includes.join(',')}` : '';
    const response = await axiosClient.get(`/api/v1/journal-entries/${id}${includeParam}`);
    return response.data;
  },

  async create(data: JournalEntryForm): Promise<{ data: JournalEntry }> {
    const response = await axiosClient.post('/api/v1/journal-entries', {
      data: {
        type: 'journal-entries',
        attributes: data,
      },
    });
    return response.data;
  },

  async update(id: string, data: Partial<JournalEntryForm>): Promise<{ data: JournalEntry }> {
    const response = await axiosClient.patch(`/api/v1/journal-entries/${id}`, {
      data: {
        type: 'journal-entries',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/journal-entries/${id}`);
  },

  async post(id: string): Promise<{ data: JournalEntry }> {
    const response = await axiosClient.post(`/api/v1/journal-entries/${id}/post`);
    return response.data;
  },

  // Get with journal lines included
  async getWithLines(id: string): Promise<{ data: JournalEntry }> {
    return this.getById(id, ['journalLines', 'journalLines.account']);
  },
};

// Journal Lines Service  
export const journalLinesService = {
  async getAll(params: Record<string, any> = {}): Promise<AccountingAPIResponse<JournalLine>> {
    const response = await axiosClient.get('/api/v1/journal-lines', { params });
    return response.data;
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: JournalLine }> {
    const includeParam = includes.length > 0 ? `?include=${includes.join(',')}` : '';
    const response = await axiosClient.get(`/api/v1/journal-lines/${id}${includeParam}`);
    return response.data;
  },

  async create(data: JournalLineForm): Promise<{ data: JournalLine }> {
    const response = await axiosClient.post('/api/v1/journal-lines', {
      data: {
        type: 'journal-lines',
        attributes: data,
      },
    });
    return response.data;
  },

  async update(id: string, data: Partial<JournalLineForm>): Promise<{ data: JournalLine }> {
    const response = await axiosClient.patch(`/api/v1/journal-lines/${id}`, {
      data: {
        type: 'journal-lines',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/journal-lines/${id}`);
  },

  // Get lines for specific journal entry
  async getByJournalEntry(journalEntryId: string, includes: string[] = ['account']): Promise<AccountingAPIResponse<JournalLine>> {
    const params = {
      'filter[journalEntryId]': journalEntryId,
      include: includes.join(','),
    };
    return this.getAll(params);
  },
};

// Helper service for combined journal entry + lines operations
export const journalEntryService = {
  // Create journal entry with lines in a single operation
  async createWithLines(data: JournalEntryWithLines): Promise<{ data: JournalEntry }> {
    // First create the journal entry
    const { lines, ...entryData } = data;
    const entryResult = await journalEntriesService.create(entryData);
    
    // Then create the lines
    const journalEntryId = parseInt(entryResult.data.id);
    const linePromises = lines.map(line => 
      journalLinesService.create({
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
        memo: line.memo,
      })
    );
    
    await Promise.all(linePromises);
    
    // Return the entry with lines included
    return journalEntriesService.getWithLines(entryResult.data.id);
  },

  // Validate that debits equal credits
  validateBalance(lines: JournalLineForm[]): { isValid: boolean; totalDebit: number; totalCredit: number; difference: number } {
    const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isValid = difference < 0.01; // Allow for small rounding differences
    
    return {
      isValid,
      totalDebit,
      totalCredit,
      difference,
    };
  },
};

// Export individual functions for test compatibility
export const getAccounts = (params?: { filters?: any; pagination?: any; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, any> = {};
  
  if (params?.filters) {
    Object.keys(params.filters).forEach(key => {
      queryParams[`filter[${key}]`] = params.filters[key];
    });
  }
  
  if (params?.pagination) {
    if (params.pagination.page) queryParams['page[number]'] = params.pagination.page;
    if (params.pagination.size) queryParams['page[size]'] = params.pagination.size;
  }
  
  if (params?.include) {
    queryParams.include = params.include.join(',');
  }
  
  if (params?.sort) {
    queryParams.sort = params.sort.join(',');
  }
  
  return accountsService.getAll(queryParams);
};

export const getAccount = (id: string) => accountsService.getById(id).then(response => response.data);
export const createAccount = (data: AccountForm) => accountsService.create(data).then(response => response.data);
export const updateAccount = (id: string, data: Partial<AccountForm>) => accountsService.update(id, data).then(response => response.data);
export const deleteAccount = (id: string) => accountsService.delete(id);

export const getJournalEntries = (params?: { filters?: any; pagination?: any; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, any> = {};
  
  if (params?.filters) {
    Object.keys(params.filters).forEach(key => {
      queryParams[`filter[${key}]`] = params.filters[key];
    });
  }
  
  if (params?.pagination) {
    if (params.pagination.page) queryParams['page[number]'] = params.pagination.page;
    if (params.pagination.size) queryParams['page[size]'] = params.pagination.size;
  }
  
  if (params?.include) {
    queryParams.include = params.include.join(',');
  }
  
  if (params?.sort) {
    queryParams.sort = params.sort.join(',');
  }
  
  return journalEntriesService.getAll(queryParams);
};

export const getJournalEntry = (id: string, includes?: string[]) => {
  return journalEntriesService.getById(id, includes).then(response => response.data);
};

export const createJournalEntry = (data: JournalEntryForm) => journalEntriesService.create(data).then(response => response.data);
export const updateJournalEntry = (id: string, data: Partial<JournalEntryForm>) => journalEntriesService.update(id, data).then(response => response.data);
export const deleteJournalEntry = (id: string) => journalEntriesService.delete(id);

export const getJournalLines = (params?: { entryId?: string; filters?: any; include?: string[] }) => {
  const queryParams: Record<string, any> = {};
  
  if (params?.entryId) {
    queryParams['filter[entryId]'] = params.entryId;
  }
  
  if (params?.filters) {
    Object.keys(params.filters).forEach(key => {
      queryParams[`filter[${key}]`] = params.filters[key];
    });
  }
  
  if (params?.include) {
    queryParams.include = params.include.join(',');
  }
  
  return journalLinesService.getAll(queryParams);
};

export const createJournalLine = (data: JournalLineForm) => {
  return journalLinesService.create(data).then(response => response.data);
};