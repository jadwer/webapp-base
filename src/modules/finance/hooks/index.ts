// Finance Hooks - Phase 1
// Simple SWR-based data fetching following existing patterns

import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import {
  apInvoicesService,
  apPaymentsService,
  arInvoicesService,
  arReceiptsService,
  bankAccountsService,
} from '../services';
import type {
  BankAccount,
  APInvoiceForm,
  APPaymentForm,
  ARInvoiceForm,
  ARReceiptForm,
} from '../types';

// AP Invoices Hooks
export function useAPInvoices(params: Record<string, unknown> = {}) {
  // Format parameters correctly for the API
  const formattedParams: Record<string, unknown> = {};
  
  if (params.filters) {
    const filters = params.filters as Record<string, unknown>;
    Object.keys(filters).forEach(key => {
      formattedParams[`filter[${key}]`] = filters[key];
    });
  }

  if (params.pagination) {
    const pagination = params.pagination as Record<string, unknown>;
    if (pagination.page) formattedParams['page[number]'] = pagination.page;
    if (pagination.size) formattedParams['page[size]'] = pagination.size;
  }
  
  if (params.include) {
    const include = params.include as string[];
    if (include.length > 0) {
      formattedParams.include = include.join(',');
    }
  }

  if (params.sort) {
    const sort = params.sort as string[];
    if (sort.length > 0) {
      formattedParams.sort = sort.join(',');
    }
  }

  const key = ['/api/v1/a-p-invoices', formattedParams];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => apInvoicesService.getAll(formattedParams)
  );

  return {
    apInvoices: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useAPInvoice(id: string | null, includes: string[] = []) {
  const key = id ? ['/api/v1/a-p-invoices', id, includes] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => apInvoicesService.getById(id!, includes)
  );

  return {
    apInvoice: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useAPInvoiceMutations() {
  const { mutate } = useSWRConfig();

  const createAPInvoice = async (data: APInvoiceForm) => {
    const result = await apInvoicesService.create(data);
    mutate('/api/v1/a-p-invoices');
    return result;
  };

  const updateAPInvoice = async (id: string, data: Partial<APInvoiceForm>) => {
    const result = await apInvoicesService.update(id, data);
    mutate(`/api/v1/a-p-invoices/${id}`);
    mutate('/api/v1/a-p-invoices');
    return result;
  };

  const deleteAPInvoice = async (id: string) => {
    await apInvoicesService.delete(id);
    mutate('/api/v1/a-p-invoices');
  };

  const postAPInvoice = async (id: string) => {
    const result = await apInvoicesService.post(id);
    mutate(`/api/v1/a-p-invoices/${id}`);
    mutate('/api/v1/a-p-invoices');
    return result;
  };

  return {
    createAPInvoice,
    updateAPInvoice,
    deleteAPInvoice,
    postAPInvoice,
  };
}

// AP Payments Hooks
export function useAPPayments(params: Record<string, unknown> = {}) {
  // Format parameters correctly for the API
  const formattedParams: Record<string, unknown> = {};
  
  if (params.filters) {
    const filters = params.filters as Record<string, unknown>;
    Object.keys(filters).forEach(key => {
      formattedParams[`filter[${key}]`] = filters[key];
    });
  }

  if (params.pagination) {
    const pagination = params.pagination as Record<string, unknown>;
    if (pagination.page) formattedParams['page[number]'] = pagination.page;
    if (pagination.size) formattedParams['page[size]'] = pagination.size;
  }
  
  if (params.include) {
    const include = params.include as string[];
    if (include.length > 0) {
      formattedParams.include = include.join(',');
    }
  }

  if (params.sort) {
    const sort = params.sort as string[];
    if (sort.length > 0) {
      formattedParams.sort = sort.join(',');
    }
  }

  const key = ['/api/v1/payments', 'ap', formattedParams];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => apPaymentsService.getAll(formattedParams)
  );

  return {
    apPayments: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useAPPayment(id: string | null, includes: string[] = []) {
  const key = id ? ['/api/v1/payments', 'ap', id, includes] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => apPaymentsService.getById(id!, includes)
  );

  return {
    apPayment: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useAPPaymentMutations() {
  const { mutate } = useSWRConfig();

  const createAPPayment = async (data: APPaymentForm) => {
    const result = await apPaymentsService.create(data);
    mutate('/api/v1/payments');
    mutate('/api/v1/ap-invoices'); // Refresh invoices as status may change
    return result;
  };

  const updateAPPayment = async (id: string, data: Partial<APPaymentForm>) => {
    const result = await apPaymentsService.update(id, data);
    mutate(`/api/v1/payments/${id}`);
    mutate('/api/v1/payments');
    return result;
  };

  const deleteAPPayment = async (id: string) => {
    await apPaymentsService.delete(id);
    mutate('/api/v1/payments');
    mutate('/api/v1/ap-invoices');
  };

  const postAPPayment = async (id: string) => {
    const result = await apPaymentsService.post(id);
    mutate(`/api/v1/payments/${id}`);
    mutate('/api/v1/payments');
    mutate('/api/v1/ap-invoices');
    return result;
  };

  return {
    createAPPayment,
    updateAPPayment,
    deleteAPPayment,
    postAPPayment,
  };
}

// AR Invoices Hooks
export function useARInvoices(params: Record<string, unknown> = {}) {
  // Format parameters correctly for the API
  const formattedParams: Record<string, unknown> = {};
  
  if (params.filters) {
    const filters = params.filters as Record<string, unknown>;
    Object.keys(filters).forEach(key => {
      formattedParams[`filter[${key}]`] = filters[key];
    });
  }

  if (params.pagination) {
    const pagination = params.pagination as Record<string, unknown>;
    if (pagination.page) formattedParams['page[number]'] = pagination.page;
    if (pagination.size) formattedParams['page[size]'] = pagination.size;
  }
  
  if (params.include) {
    const include = params.include as string[];
    if (include.length > 0) {
      formattedParams.include = include.join(',');
    }
  }

  if (params.sort) {
    const sort = params.sort as string[];
    if (sort.length > 0) {
      formattedParams.sort = sort.join(',');
    }
  }

  const key = ['/api/v1/a-r-invoices', formattedParams];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => arInvoicesService.getAll(formattedParams)
  );

  return {
    arInvoices: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useARInvoice(id: string | null, includes: string[] = []) {
  const key = id ? ['/api/v1/a-r-invoices', id, includes] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => arInvoicesService.getById(id!, includes)
  );

  return {
    arInvoice: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useARInvoiceMutations() {
  const { mutate } = useSWRConfig();

  const createARInvoice = async (data: ARInvoiceForm) => {
    const result = await arInvoicesService.create(data);
    mutate('/api/v1/a-r-invoices');
    return result;
  };

  const updateARInvoice = async (id: string, data: Partial<ARInvoiceForm>) => {
    const result = await arInvoicesService.update(id, data);
    mutate(`/api/v1/a-r-invoices/${id}`);
    mutate('/api/v1/a-r-invoices');
    return result;
  };

  const deleteARInvoice = async (id: string) => {
    await arInvoicesService.delete(id);
    mutate('/api/v1/a-r-invoices');
  };

  const postARInvoice = async (id: string) => {
    const result = await arInvoicesService.post(id);
    mutate(`/api/v1/a-r-invoices/${id}`);
    mutate('/api/v1/a-r-invoices');
    return result;
  };

  return {
    createARInvoice,
    updateARInvoice,
    deleteARInvoice,
    postARInvoice,
  };
}

// AR Receipts Hooks
export function useARReceipts(params: Record<string, unknown> = {}) {
  // Format parameters correctly for the API
  const formattedParams: Record<string, unknown> = {};
  
  if (params.filters) {
    const filters = params.filters as Record<string, unknown>;
    Object.keys(filters).forEach(key => {
      formattedParams[`filter[${key}]`] = filters[key];
    });
  }

  if (params.pagination) {
    const pagination = params.pagination as Record<string, unknown>;
    if (pagination.page) formattedParams['page[number]'] = pagination.page;
    if (pagination.size) formattedParams['page[size]'] = pagination.size;
  }
  
  if (params.include) {
    const include = params.include as string[];
    if (include.length > 0) {
      formattedParams.include = include.join(',');
    }
  }

  if (params.sort) {
    const sort = params.sort as string[];
    if (sort.length > 0) {
      formattedParams.sort = sort.join(',');
    }
  }

  const key = ['/api/v1/payments', 'ar', formattedParams];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => arReceiptsService.getAll(formattedParams)
  );

  return {
    arReceipts: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useARReceipt(id: string | null, includes: string[] = []) {
  const key = id ? ['/api/v1/payments', 'ar', id, includes] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => arReceiptsService.getById(id!, includes)
  );

  return {
    arReceipt: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useARReceiptMutations() {
  const { mutate } = useSWRConfig();

  const createARReceipt = async (data: ARReceiptForm) => {
    const result = await arReceiptsService.create(data);
    mutate('/api/v1/payments');
    mutate('/api/v1/ar-invoices'); // Refresh invoices as status may change
    return result;
  };

  const updateARReceipt = async (id: string, data: Partial<ARReceiptForm>) => {
    const result = await arReceiptsService.update(id, data);
    mutate(`/api/v1/payments/${id}`);
    mutate('/api/v1/payments');
    return result;
  };

  const deleteARReceipt = async (id: string) => {
    await arReceiptsService.delete(id);
    mutate('/api/v1/payments');
    mutate('/api/v1/ar-invoices');
  };

  const postARReceipt = async (id: string) => {
    const result = await arReceiptsService.post(id);
    mutate(`/api/v1/payments/${id}`);
    mutate('/api/v1/payments');
    mutate('/api/v1/ar-invoices');
    return result;
  };

  return {
    createARReceipt,
    updateARReceipt,
    deleteARReceipt,
    postARReceipt,
  };
}

// Bank Accounts Hooks
export function useBankAccounts(params: Record<string, unknown> = {}) {
  const key = ['/api/v1/bank-accounts', params];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => bankAccountsService.getAll(params)
  );

  return {
    bankAccounts: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useBankAccount(id: string | null) {
  const key = id ? ['/api/v1/bank-accounts', id] : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => bankAccountsService.getById(id!)
  );

  return {
    bankAccount: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

export function useBankAccountMutations() {
  const { mutate } = useSWRConfig();

  const createBankAccount = async (data: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await bankAccountsService.create(data);
    mutate('/api/v1/bank-accounts');
    return result;
  };

  const updateBankAccount = async (id: string, data: Partial<BankAccount>) => {
    const result = await bankAccountsService.update(id, data);
    mutate(`/api/v1/bank-accounts/${id}`);
    mutate('/api/v1/bank-accounts');
    return result;
  };

  const deleteBankAccount = async (id: string) => {
    await bankAccountsService.delete(id);
    mutate('/api/v1/bank-accounts');
  };

  return {
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
  };
}
// Payment Applications Hooks
export {
  usePaymentApplications,
  usePaymentApplication,
  usePaymentApplicationsByPayment,
  usePaymentApplicationsByARInvoice,
  usePaymentApplicationsByAPInvoice,
  usePaymentApplicationMutations,
} from './usePaymentApplications'

// Payment Methods Hooks
export {
  usePaymentMethods,
  usePaymentMethod,
  useActivePaymentMethods,
  usePaymentMethodsRequiringReference,
  usePaymentMethodMutations,
} from './usePaymentMethods'

// Bank Transactions Hooks (v1.1)
export { useBankTransactions } from './useBankTransactions'
export { useBankTransaction } from './useBankTransaction'
export { useBankTransactionMutations } from './useBankTransactionMutations'
