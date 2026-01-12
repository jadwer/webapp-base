// Accounting Services - Phase 1
// Simple CRUD operations for Chart of Accounts and Journal Entries

import axiosClient from '@/lib/axiosClient';
import {
  transformAccountsFromAPI,
  transformAccountFromAPI,
  transformAccountToAPI,
  transformJournalEntriesFromAPI,
  transformJournalEntryFromAPI,
} from '../utils/transformers';
import type {
  Account,
  JournalEntry,
  JournalLine,
  AccountFormData,
  JournalEntryFormData,
  JournalLineForm,
  JournalEntryWithLines,
  AccountingAPIResponse,
  ExchangeRate,
  FiscalPeriod,
} from '../types';

// Accounts Service
export const accountsService = {
  async getAll(params: Record<string, unknown> = {}): Promise<AccountingAPIResponse<Account>> {
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

  async create(data: AccountFormData): Promise<{ data: Account }> {
    const payload = transformAccountToAPI(data);
    const response = await axiosClient.post('/api/v1/accounts', payload);
    return {
      data: transformAccountFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<AccountFormData>): Promise<{ data: Account }> {
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
  async getPostableAccounts(params: Record<string, unknown> = {}): Promise<AccountingAPIResponse<Account>> {
    return this.getAll({ ...params, 'filter[isPostable]': 1 });
  },
};

// Journal Entries Service
export const journalEntriesService = {
  async getAll(params: Record<string, unknown> = {}): Promise<AccountingAPIResponse<JournalEntry>> {
    const response = await axiosClient.get('/api/v1/journal-entries', { params });
    const transformedData = transformJournalEntriesFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: JournalEntry }> {
    const includeParam = includes.length > 0 ? `?include=${includes.join(',')}` : '';
    const response = await axiosClient.get(`/api/v1/journal-entries/${id}${includeParam}`);
    return {
      data: transformJournalEntryFromAPI(response.data.data)
    };
  },

  async create(data: JournalEntryFormData): Promise<{ data: JournalEntry }> {
    const response = await axiosClient.post('/api/v1/journal-entries', {
      data: {
        type: 'journal-entries',
        attributes: data,
      },
    });
    return response.data;
  },

  async update(id: string, data: Partial<JournalEntryFormData>): Promise<{ data: JournalEntry }> {
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

  async approve(id: string): Promise<{ data: JournalEntry }> {
    const response = await axiosClient.post(`/api/v1/journal-entries/${id}/approve`);
    return response.data;
  },

  async reverse(id: string, reason: string, reversalDate: string): Promise<{ data: JournalEntry }> {
    const response = await axiosClient.post(`/api/v1/journal-entries/${id}/reverse`, {
      reason,
      reversal_date: reversalDate
    });
    return response.data;
  },

  // Get with journal lines included
  async getWithLines(id: string): Promise<{ data: JournalEntry }> {
    return this.getById(id, ['journalLines']);
  },
};

// Journal Lines Service
export const journalLinesService = {
  async getAll(params: Record<string, unknown> = {}): Promise<AccountingAPIResponse<JournalLine>> {
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

    // Then create the lines - convert accountId to string if needed
    const linePromises = lines.map(line =>
      journalLinesService.create({
        accountId: String(line.accountId),
        debit: String(line.debit),
        credit: String(line.credit),
        memo: 'memo' in line ? line.memo : ('description' in line ? String(line.description) : undefined),
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
export const getAccounts = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};

  if (params?.filters) {
    const filters = params.filters;
    Object.keys(filters).forEach(key => {
      queryParams[`filter[${key}]`] = filters[key];
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
export const createAccount = (data: AccountFormData) => accountsService.create(data).then(response => response.data);
export const updateAccount = (id: string, data: Partial<AccountFormData>) => accountsService.update(id, data).then(response => response.data);
export const deleteAccount = (id: string) => accountsService.delete(id);

export const getJournalEntries = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};

  if (params?.filters) {
    const filters = params.filters;
    Object.keys(filters).forEach(key => {
      queryParams[`filter[${key}]`] = filters[key];
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

export const createJournalEntry = (data: JournalEntryFormData) => journalEntriesService.create(data).then(response => response.data);
export const updateJournalEntry = (id: string, data: Partial<JournalEntryFormData>) => journalEntriesService.update(id, data).then(response => response.data);
export const deleteJournalEntry = (id: string) => journalEntriesService.delete(id);

export const getJournalLines = (params?: { entryId?: string; filters?: Record<string, unknown>; include?: string[] }) => {
  const queryParams: Record<string, unknown> = {};

  if (params?.entryId) {
    queryParams['filter[entryId]'] = params.entryId;
  }

  if (params?.filters) {
    const filters = params.filters;
    Object.keys(filters).forEach(key => {
      queryParams[`filter[${key}]`] = filters[key];
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

// ===== FISCAL PERIODS SERVICE =====

export interface PeriodSummary {
  period: { name: string; status: string };
  entries: { count: number; totalDebit: number };
  accounts: { revenue: number; expenses: number; netIncome: number };
}

export interface CloseChecklist {
  checklist: Array<{ item: string; status: 'complete' | 'pending' }>;
  canClose: boolean;
  pendingItems: number;
}

export const fiscalPeriodsService = {
  async getAll(params: Record<string, unknown> = {}): Promise<{ data: FiscalPeriod[] }> {
    const response = await axiosClient.get('/api/v1/fiscal-periods', { params });
    return {
      data: (response.data.data || []).map((item: { id: string; attributes: Record<string, unknown> }) => ({
        id: item.id,
        name: item.attributes.name as string,
        year: (item.attributes.year || item.attributes.fiscalYear || item.attributes.fiscal_year) as number,
        month: (item.attributes.month || item.attributes.periodNumber || item.attributes.period_number) as number,
        startDate: (item.attributes.startDate || item.attributes.start_date) as string,
        endDate: (item.attributes.endDate || item.attributes.end_date) as string,
        status: item.attributes.status as FiscalPeriod['status'],
        closedAt: (item.attributes.closedAt || item.attributes.closed_at) as string | null,
        closedById: (item.attributes.closedById || item.attributes.closed_by_id) as number | null,
        closingEntryId: (item.attributes.closingEntryId || item.attributes.closing_entry_id) as number | null,
        metadata: item.attributes.metadata as Record<string, unknown> | null,
        createdAt: (item.attributes.createdAt || item.attributes.created_at) as string,
        updatedAt: (item.attributes.updatedAt || item.attributes.updated_at) as string,
      }))
    };
  },

  async getById(id: string): Promise<{ data: FiscalPeriod }> {
    const response = await axiosClient.get(`/api/v1/fiscal-periods/${id}`);
    const item = response.data.data;
    return {
      data: {
        id: item.id,
        name: item.attributes.name as string,
        year: (item.attributes.year || item.attributes.fiscalYear || item.attributes.fiscal_year) as number,
        month: (item.attributes.month || item.attributes.periodNumber || item.attributes.period_number) as number,
        startDate: (item.attributes.startDate || item.attributes.start_date) as string,
        endDate: (item.attributes.endDate || item.attributes.end_date) as string,
        status: item.attributes.status as FiscalPeriod['status'],
        closedAt: (item.attributes.closedAt || item.attributes.closed_at) as string | null,
        closedById: (item.attributes.closedById || item.attributes.closed_by_id) as number | null,
        closingEntryId: (item.attributes.closingEntryId || item.attributes.closing_entry_id) as number | null,
        metadata: item.attributes.metadata as Record<string, unknown> | null,
        createdAt: (item.attributes.createdAt || item.attributes.created_at) as string,
        updatedAt: (item.attributes.updatedAt || item.attributes.updated_at) as string,
      }
    };
  },

  async getSummary(id: string): Promise<PeriodSummary> {
    const response = await axiosClient.get(`/api/v1/fiscal-periods/${id}/summary`);
    return response.data;
  },

  async getCloseChecklist(id: string): Promise<CloseChecklist> {
    const response = await axiosClient.get(`/api/v1/fiscal-periods/${id}/close-checklist`);
    return response.data;
  },

  async close(id: string): Promise<{ data: FiscalPeriod }> {
    const response = await axiosClient.post(`/api/v1/fiscal-periods/${id}/close`);
    return response.data;
  },

  async reopen(id: string): Promise<{ data: FiscalPeriod }> {
    const response = await axiosClient.post(`/api/v1/fiscal-periods/${id}/reopen`);
    return response.data;
  },

  async getOpenPeriods(): Promise<{ data: FiscalPeriod[] }> {
    return this.getAll({ 'filter[status]': 'open' });
  },

  async getByYear(year: number): Promise<{ data: FiscalPeriod[] }> {
    return this.getAll({ 'filter[year]': year, sort: 'month' });
  }
};

// ===== EXCHANGE RATES SERVICE =====

export const exchangeRatesService = {
  async getAll(params: Record<string, unknown> = {}): Promise<{ data: ExchangeRate[] }> {
    const response = await axiosClient.get('/api/v1/exchange-rates', { params });
    return {
      data: (response.data.data || []).map((item: { id: string; attributes: Record<string, unknown> }) => ({
        id: item.id,
        fromCurrency: (item.attributes.fromCurrency || item.attributes.from_currency) as string,
        toCurrency: (item.attributes.toCurrency || item.attributes.to_currency) as string,
        rate: item.attributes.rate as number,
        effectiveDate: (item.attributes.effectiveDate || item.attributes.effective_date) as string,
        source: item.attributes.source as string | null,
        status: item.attributes.status as ExchangeRate['status'],
        metadata: item.attributes.metadata as Record<string, unknown> | null,
        createdAt: (item.attributes.createdAt || item.attributes.created_at) as string,
        updatedAt: (item.attributes.updatedAt || item.attributes.updated_at) as string,
      }))
    };
  },

  async create(data: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate: string;
    source?: string;
  }): Promise<{ data: ExchangeRate }> {
    const response = await axiosClient.post('/api/v1/exchange-rates', {
      data: {
        type: 'exchange-rates',
        attributes: {
          fromCurrency: data.fromCurrency,
          toCurrency: data.toCurrency,
          rate: data.rate,
          effectiveDate: data.effectiveDate,
          source: data.source
        }
      }
    });
    const item = response.data.data;
    return {
      data: {
        id: item.id,
        fromCurrency: (item.attributes.fromCurrency || item.attributes.from_currency) as string,
        toCurrency: (item.attributes.toCurrency || item.attributes.to_currency) as string,
        rate: item.attributes.rate as number,
        effectiveDate: (item.attributes.effectiveDate || item.attributes.effective_date) as string,
        source: item.attributes.source as string | null,
        status: item.attributes.status as ExchangeRate['status'],
        metadata: item.attributes.metadata as Record<string, unknown> | null,
        createdAt: (item.attributes.createdAt || item.attributes.created_at) as string,
        updatedAt: (item.attributes.updatedAt || item.attributes.updated_at) as string,
      }
    };
  },

  async getCurrentRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
    const response = await this.getAll({
      'filter[from_currency]': fromCurrency,
      'filter[to_currency]': toCurrency,
      'sort': '-effectiveDate',
      'page[size]': 1
    });
    return response.data[0] || null;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/exchange-rates/${id}`);
  }
};

// ===== ACCOUNT BALANCES SERVICE =====

// Trial balance entry type for reports view (different from entity AccountBalance in types)
export interface TrialBalanceEntry {
  id: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  balance: number;
}

export const accountBalancesService = {
  async getByPeriod(fiscalPeriodId: number | string): Promise<{ data: TrialBalanceEntry[] }> {
    const response = await axiosClient.get('/api/v1/account-balances', {
      params: { 'filter[fiscal_period_id]': fiscalPeriodId }
    });
    return {
      data: (response.data.data || []).map((item: { id: string; attributes: Record<string, unknown> }) => ({
        id: item.id,
        accountId: item.attributes.accountId || item.attributes.account_id,
        accountCode: item.attributes.accountCode || item.attributes.account_code,
        accountName: item.attributes.accountName || item.attributes.account_name,
        debitBalance: item.attributes.debitBalance || item.attributes.debit_balance || 0,
        creditBalance: item.attributes.creditBalance || item.attributes.credit_balance || 0,
        balance: item.attributes.balance || 0,
      }))
    };
  },

  async getTrialBalance(fiscalPeriodId: number | string): Promise<{ data: TrialBalanceEntry[] }> {
    return this.getByPeriod(fiscalPeriodId);
  }
};