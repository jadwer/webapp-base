// Accounting Hooks - Phase 1
// Simple SWR-based data fetching for Chart of Accounts and Journal Entries

import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import {
  accountsService,
  journalEntriesService,
  journalLinesService,
  journalEntryService,
} from '../services';
import type {
  Account,
  JournalEntry,
  JournalLine,
  AccountForm,
  JournalEntryForm,
  JournalLineForm,
  JournalEntryWithLines,
} from '../types';

// Accounts Hooks
export function useAccounts(params: Record<string, any> = {}) {
  const key = ['/api/v1/accounts', params];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => accountsService.getAll(params)
  );

  return {
    accounts: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useAccount(id: string | null) {
  const key = id ? ['/api/v1/accounts', id] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => accountsService.getById(id!)
  );

  return {
    account: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function usePostableAccounts(params: Record<string, any> = {}) {
  const key = ['/api/v1/accounts/postable', params];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => accountsService.getPostableAccounts(params)
  );

  return {
    postableAccounts: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useAccountMutations() {
  const { mutate } = useSWRConfig();

  const createAccount = async (data: AccountForm) => {
    const result = await accountsService.create(data);
    mutate('/api/v1/accounts');
    return result;
  };

  const updateAccount = async (id: string, data: Partial<AccountForm>) => {
    const result = await accountsService.update(id, data);
    mutate(`/api/v1/accounts/${id}`);
    mutate('/api/v1/accounts');
    return result;
  };

  const deleteAccount = async (id: string) => {
    await accountsService.delete(id);
    mutate('/api/v1/accounts');
  };

  return {
    createAccount,
    updateAccount,
    deleteAccount,
  };
}

// Journal Entries Hooks
export function useJournalEntries(params: Record<string, any> = {}) {
  const key = ['/api/v1/journal-entries', params];
  
  // Format parameters correctly for JSON:API
  const formattedParams: Record<string, any> = {};
  
  if (params.filters) {
    Object.keys(params.filters).forEach(key => {
      formattedParams[`filter[${key}]`] = params.filters[key];
    });
  }
  
  if (params.pagination) {
    if (params.pagination.page) formattedParams['page[number]'] = params.pagination.page;
    if (params.pagination.size) formattedParams['page[size]'] = params.pagination.size;
  }
  
  if (params.include && params.include.length > 0) {
    formattedParams.include = params.include.join(',');
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => journalEntriesService.getAll(formattedParams)
  );

  return {
    journalEntries: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useJournalEntry(id: string | null, includes: string[] = []) {
  const key = id ? ['/api/v1/journal-entries', id, includes] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => journalEntriesService.getById(id!, includes)
  );

  return {
    journalEntry: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useJournalEntryWithLines(id: string | null) {
  const key = id ? ['/api/v1/journal-entries/with-lines', id] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => journalEntriesService.getWithLines(id!)
  );

  return {
    journalEntry: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useJournalEntryMutations() {
  const { mutate } = useSWRConfig();

  const createJournalEntry = async (data: JournalEntryForm) => {
    const result = await journalEntriesService.create(data);
    mutate('/api/v1/journal-entries');
    return result;
  };

  const createJournalEntryWithLines = async (data: JournalEntryWithLines) => {
    const result = await journalEntryService.createWithLines(data);
    mutate('/api/v1/journal-entries');
    return result;
  };

  const updateJournalEntry = async (id: string, data: Partial<JournalEntryForm>) => {
    const result = await journalEntriesService.update(id, data);
    mutate(`/api/v1/journal-entries/${id}`);
    mutate('/api/v1/journal-entries');
    return result;
  };

  const deleteJournalEntry = async (id: string) => {
    await journalEntriesService.delete(id);
    mutate('/api/v1/journal-entries');
  };

  const postJournalEntry = async (id: string) => {
    const result = await journalEntriesService.post(id);
    mutate(`/api/v1/journal-entries/${id}`);
    mutate('/api/v1/journal-entries');
    return result;
  };

  return {
    createJournalEntry,
    createJournalEntryWithLines,
    updateJournalEntry,
    deleteJournalEntry,
    postJournalEntry,
  };
}

// Journal Lines Hooks
export function useJournalLines(params: Record<string, any> = {}) {
  const key = ['/api/v1/journal-lines', params];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => journalLinesService.getAll(params)
  );

  return {
    journalLines: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useJournalLinesByEntry(journalEntryId: string | null, includes: string[] = ['account']) {
  const key = journalEntryId ? ['/api/v1/journal-lines/by-entry', journalEntryId, includes] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => journalLinesService.getByJournalEntry(journalEntryId!, includes)
  );

  return {
    journalLines: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useJournalLine(id: string | null, includes: string[] = []) {
  const key = id ? ['/api/v1/journal-lines', id, includes] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => journalLinesService.getById(id!, includes)
  );

  return {
    journalLine: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useJournalLineMutations() {
  const { mutate } = useSWRConfig();

  const createJournalLine = async (data: JournalLineForm) => {
    const result = await journalLinesService.create(data);
    mutate('/api/v1/journal-lines');
    mutate('/api/v1/journal-entries'); // May affect entry totals
    return result;
  };

  const updateJournalLine = async (id: string, data: Partial<JournalLineForm>) => {
    const result = await journalLinesService.update(id, data);
    mutate(`/api/v1/journal-lines/${id}`);
    mutate('/api/v1/journal-lines');
    mutate('/api/v1/journal-entries');
    return result;
  };

  const deleteJournalLine = async (id: string) => {
    await journalLinesService.delete(id);
    mutate('/api/v1/journal-lines');
    mutate('/api/v1/journal-entries');
  };

  return {
    createJournalLine,
    updateJournalLine,
    deleteJournalLine,
  };
}

// Utility Hooks
export function useJournalEntryValidation() {
  const validateBalance = (lines: JournalLineForm[]) => {
    return journalEntryService.validateBalance(lines);
  };

  return {
    validateBalance,
  };
}