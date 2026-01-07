// Finance Services - Phase 1
// Simple CRUD operations following AdminPageReal pattern

import axiosClient from '@/lib/axiosClient';
import {
  transformAPInvoicesFromAPI,
  transformAPInvoiceFromAPI,
  transformAPPaymentsFromAPI,
  transformAPPaymentFromAPI,
  transformARInvoicesFromAPI,
  transformARInvoiceFromAPI,
  transformARReceiptsFromAPI,
  transformARReceiptFromAPI,
  transformBankAccountsFromAPI,
  transformBankAccountFromAPI,
  transformAPInvoiceToAPI,
  transformAPPaymentToAPI,
  transformARInvoiceToAPI,
  transformARReceiptToAPI,
  transformPaymentApplicationsFromAPI,
  transformPaymentApplicationFromAPI,
  transformPaymentApplicationToAPI,
  transformPaymentMethodsFromAPI,
  transformPaymentMethodFromAPI,
  transformPaymentMethodToAPI,
  transformBankTransactionsFromAPI,
  transformBankTransactionFromAPI,
  transformBankTransactionToParsed,
  transformBankTransactionToAPI,
  transformBankTransactionUpdateToAPI,
} from '../utils/transformers';
import type {
  APInvoice,
  APPayment,
  ARInvoice,
  ARReceipt,
  BankAccount,
  BankAccountForm,
  APInvoiceForm,
  APPaymentForm,
  ARInvoiceForm,
  ARReceiptForm,
  PaymentApplication,
  PaymentApplicationForm,
  PaymentMethod,
  PaymentMethodForm,
  FinanceAPIResponse,
  ParsedBankTransaction,
  CreateBankTransactionRequest,
  UpdateBankTransactionRequest,
  BankTransactionFilters,
  BankTransactionSortOptions,
} from '../types';

// AP Invoices Service
export const apInvoicesService = {
  async getAll(params: Record<string, unknown> = {}): Promise<FinanceAPIResponse<APInvoice>> {
    const response = await axiosClient.get('/api/v1/ap-invoices', { params });
    const transformedData = transformAPInvoicesFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: APInvoice }> {
    const includeParam = includes.length > 0 ? `?include=${includes.join(',')}` : '';
    const response = await axiosClient.get(`/api/v1/ap-invoices/${id}${includeParam}`);
    return {
      data: transformAPInvoiceFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: APInvoiceForm): Promise<{ data: APInvoice }> {
    const payload = transformAPInvoiceToAPI(data);
    const response = await axiosClient.post('/api/v1/ap-invoices', payload);
    return {
      data: transformAPInvoiceFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<APInvoiceForm>): Promise<{ data: APInvoice }> {
    const response = await axiosClient.patch(`/api/v1/ap-invoices/${id}`, {
      data: {
        type: 'ap-invoices',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/ap-invoices/${id}`);
  },

  async post(id: string): Promise<{ data: APInvoice }> {
    const response = await axiosClient.post(`/api/v1/ap-invoices/${id}/post`);
    return response.data;
  },
};

// AP Payments Service
export const apPaymentsService = {
  async getAll(params: Record<string, unknown> = {}): Promise<FinanceAPIResponse<APPayment>> {
    const response = await axiosClient.get('/api/v1/payments', { params });
    const transformedData = transformAPPaymentsFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: APPayment }> {
    const includeParam = includes.length > 0 ? `?include=${includes.join(',')}` : '';
    const response = await axiosClient.get(`/api/v1/payments/${id}${includeParam}`);
    return {
      data: transformAPPaymentFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: APPaymentForm): Promise<{ data: APPayment }> {
    const payload = transformAPPaymentToAPI(data);
    const response = await axiosClient.post('/api/v1/payments', payload);
    return {
      data: transformAPPaymentFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<APPaymentForm>): Promise<{ data: APPayment }> {
    const response = await axiosClient.patch(`/api/v1/payments/${id}`, {
      data: {
        type: 'payments',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/payments/${id}`);
  },

  async post(id: string): Promise<{ data: APPayment }> {
    const response = await axiosClient.post(`/api/v1/payments/${id}/post`);
    return response.data;
  },
};

// AR Invoices Service
export const arInvoicesService = {
  async getAll(params: Record<string, unknown> = {}): Promise<FinanceAPIResponse<ARInvoice>> {
    const response = await axiosClient.get('/api/v1/ar-invoices', { params });
    const transformedData = transformARInvoicesFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: ARInvoice }> {
    const includeParam = includes.length > 0 ? `?include=${includes.join(',')}` : '';
    const response = await axiosClient.get(`/api/v1/ar-invoices/${id}${includeParam}`);
    return {
      data: transformARInvoiceFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: ARInvoiceForm): Promise<{ data: ARInvoice }> {
    const payload = transformARInvoiceToAPI(data);
    const response = await axiosClient.post('/api/v1/ar-invoices', payload);
    return {
      data: transformARInvoiceFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<ARInvoiceForm>): Promise<{ data: ARInvoice }> {
    const response = await axiosClient.patch(`/api/v1/ar-invoices/${id}`, {
      data: {
        type: 'ar-invoices',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/ar-invoices/${id}`);
  },

  async post(id: string): Promise<{ data: ARInvoice }> {
    const response = await axiosClient.post(`/api/v1/ar-invoices/${id}/post`);
    return response.data;
  },
};

// AR Receipts Service
export const arReceiptsService = {
  async getAll(params: Record<string, unknown> = {}): Promise<FinanceAPIResponse<ARReceipt>> {
    const response = await axiosClient.get('/api/v1/payments', { params });
    const transformedData = transformARReceiptsFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: ARReceipt }> {
    const includeParam = includes.length > 0 ? `?include=${includes.join(',')}` : '';
    const response = await axiosClient.get(`/api/v1/payments/${id}${includeParam}`);
    return {
      data: transformARReceiptFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: ARReceiptForm): Promise<{ data: ARReceipt }> {
    const payload = transformARReceiptToAPI(data);
    const response = await axiosClient.post('/api/v1/payments', payload);
    return {
      data: transformARReceiptFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<ARReceiptForm>): Promise<{ data: ARReceipt }> {
    const response = await axiosClient.patch(`/api/v1/payments/${id}`, {
      data: {
        type: 'payments',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/payments/${id}`);
  },

  async post(id: string): Promise<{ data: ARReceipt }> {
    const response = await axiosClient.post(`/api/v1/payments/${id}/post`);
    return response.data;
  },
};

// Bank Accounts Service
export const bankAccountsService = {
  async getAll(params: Record<string, unknown> = {}): Promise<FinanceAPIResponse<BankAccount>> {
    const response = await axiosClient.get('/api/v1/bank-accounts', { params });
    const transformedData = transformBankAccountsFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string): Promise<{ data: BankAccount }> {
    const response = await axiosClient.get(`/api/v1/bank-accounts/${id}`);
    return {
      data: transformBankAccountFromAPI(response.data.data)
    };
  },

  async create(data: BankAccountForm): Promise<{ data: BankAccount }> {
    const response = await axiosClient.post('/api/v1/bank-accounts', {
      data: {
        type: 'bank-accounts',
        attributes: data,
      },
    });
    return {
      data: transformBankAccountFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<BankAccount>): Promise<{ data: BankAccount }> {
    const response = await axiosClient.patch(`/api/v1/bank-accounts/${id}`, {
      data: {
        type: 'bank-accounts',
        id,
        attributes: data,
      },
    });
    return {
      data: transformBankAccountFromAPI(response.data.data)
    };
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/bank-accounts/${id}`);
  },
};

// Export individual functions for test compatibility
export const getAPInvoices = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};
  
  if (params?.filters) {
    const filters = params.filters as Record<string, unknown>;
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
  
  return apInvoicesService.getAll(queryParams);
};

export const getAPInvoice = (id: string) => apInvoicesService.getById(id).then(response => response.data);
export const createAPInvoice = (data: APInvoiceForm) => apInvoicesService.create(data).then(response => response.data);
export const updateAPInvoice = (id: string, data: Partial<APInvoiceForm>) => apInvoicesService.update(id, data).then(response => response.data);
export const deleteAPInvoice = (id: string) => apInvoicesService.delete(id);

export const getARInvoices = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};
  
  if (params?.filters) {
    const filters = params.filters as Record<string, unknown>;
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
  
  return arInvoicesService.getAll(queryParams);
};

export const getARInvoice = (id: string) => arInvoicesService.getById(id).then(response => response.data);
export const createARInvoice = (data: ARInvoiceForm) => arInvoicesService.create(data).then(response => response.data);
export const updateARInvoice = (id: string, data: Partial<ARInvoiceForm>) => arInvoicesService.update(id, data).then(response => response.data);
export const deleteARInvoice = (id: string) => arInvoicesService.delete(id);

export const getAPPayments = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};
  
  if (params?.filters) {
    const filters = params.filters as Record<string, unknown>;
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
  
  return apPaymentsService.getAll(queryParams);
};

export const getAPPayment = (id: string) => apPaymentsService.getById(id).then(response => response.data);
export const createAPPayment = (data: APPaymentForm) => apPaymentsService.create(data).then(response => response.data);
export const updateAPPayment = (id: string, data: Partial<APPaymentForm>) => apPaymentsService.update(id, data).then(response => response.data);
export const deleteAPPayment = (id: string) => apPaymentsService.delete(id);

export const getARReceipts = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};
  
  if (params?.filters) {
    const filters = params.filters as Record<string, unknown>;
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
  
  return arReceiptsService.getAll(queryParams);
};

export const getARReceipt = (id: string) => arReceiptsService.getById(id).then(response => response.data);
export const createARReceipt = (data: ARReceiptForm) => arReceiptsService.create(data).then(response => response.data);
export const updateARReceipt = (id: string, data: Partial<ARReceiptForm>) => arReceiptsService.update(id, data).then(response => response.data);
export const deleteARReceipt = (id: string) => arReceiptsService.delete(id);

export const getBankAccounts = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};
  
  if (params?.filters) {
    const filters = params.filters as Record<string, unknown>;
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
  
  return bankAccountsService.getAll(queryParams);
};

export const getBankAccount = (id: string) => bankAccountsService.getById(id).then(response => response.data);
export const createBankAccount = (data: BankAccountForm) => bankAccountsService.create(data).then(response => response.data);
export const updateBankAccount = (id: string, data: Partial<BankAccount>) => bankAccountsService.update(id, data).then(response => response.data);
export const deleteBankAccount = (id: string) => bankAccountsService.delete(id);
// Payment Applications Service
export const paymentApplicationsService = {
  async getAll(params: Record<string, unknown> = {}): Promise<FinanceAPIResponse<PaymentApplication>> {
    const response = await axiosClient.get('/api/v1/payment-applications', { params });
    const transformedData = transformPaymentApplicationsFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string, includes: string[] = []): Promise<{ data: PaymentApplication }> {
    const includeParam = includes.length > 0 ? '?include=' + includes.join(',') : '';
    const response = await axiosClient.get('/api/v1/payment-applications/' + id + includeParam);
    return {
      data: transformPaymentApplicationFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: PaymentApplicationForm): Promise<{ data: PaymentApplication }> {
    const payload = transformPaymentApplicationToAPI(data);
    const response = await axiosClient.post('/api/v1/payment-applications', payload);
    return {
      data: transformPaymentApplicationFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<PaymentApplicationForm>): Promise<{ data: PaymentApplication }> {
    const response = await axiosClient.patch('/api/v1/payment-applications/' + id, {
      data: {
        type: 'payment-applications',
        id,
        attributes: data,
      },
    });
    return {
      data: transformPaymentApplicationFromAPI(response.data.data)
    };
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete('/api/v1/payment-applications/' + id);
  },
};

// Payment Methods Service
export const paymentMethodsService = {
  async getAll(params: Record<string, unknown> = {}): Promise<FinanceAPIResponse<PaymentMethod>> {
    const response = await axiosClient.get('/api/v1/payment-methods', { params });
    const transformedData = transformPaymentMethodsFromAPI(response.data);
    return {
      jsonapi: response.data.jsonapi || { version: '1.0' },
      data: transformedData,
      meta: response.data.meta,
      links: response.data.links,
    };
  },

  async getById(id: string): Promise<{ data: PaymentMethod }> {
    const response = await axiosClient.get('/api/v1/payment-methods/' + id);
    return {
      data: transformPaymentMethodFromAPI(response.data.data)
    };
  },

  async create(data: PaymentMethodForm): Promise<{ data: PaymentMethod }> {
    const payload = transformPaymentMethodToAPI(data);
    const response = await axiosClient.post('/api/v1/payment-methods', payload);
    return {
      data: transformPaymentMethodFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<PaymentMethodForm>): Promise<{ data: PaymentMethod }> {
    const response = await axiosClient.patch('/api/v1/payment-methods/' + id, {
      data: {
        type: 'payment-methods',
        id,
        attributes: data,
      },
    });
    return {
      data: transformPaymentMethodFromAPI(response.data.data)
    };
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete('/api/v1/payment-methods/' + id);
  },
};

// Export individual functions for Payment Applications
export const getPaymentApplications = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};

  if (params?.filters) {
    const filters = params.filters as Record<string, unknown>;
    Object.keys(filters).forEach(key => {
      queryParams['filter[' + key + ']'] = filters[key];
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

  return paymentApplicationsService.getAll(queryParams);
};

export const getPaymentApplication = (id: string) => paymentApplicationsService.getById(id).then(response => response.data);
export const createPaymentApplication = (data: PaymentApplicationForm) => paymentApplicationsService.create(data).then(response => response.data);
export const updatePaymentApplication = (id: string, data: Partial<PaymentApplicationForm>) => paymentApplicationsService.update(id, data).then(response => response.data);
export const deletePaymentApplication = (id: string) => paymentApplicationsService.delete(id);

// Export individual functions for Payment Methods
export const getPaymentMethods = (params?: { filters?: Record<string, unknown>; pagination?: Record<string, unknown>; include?: string[]; sort?: string[] }) => {
  const queryParams: Record<string, unknown> = {};

  if (params?.filters) {
    const filters = params.filters as Record<string, unknown>;
    Object.keys(filters).forEach(key => {
      queryParams['filter[' + key + ']'] = filters[key];
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

  return paymentMethodsService.getAll(queryParams);
};

export const getPaymentMethod = (id: string) => paymentMethodsService.getById(id).then(response => response.data);
export const createPaymentMethod = (data: PaymentMethodForm) => paymentMethodsService.create(data).then(response => response.data);
export const updatePaymentMethod = (id: string, data: Partial<PaymentMethodForm>) => paymentMethodsService.update(id, data).then(response => response.data);
export const deletePaymentMethod = (id: string) => paymentMethodsService.delete(id);

// ===== BANK TRANSACTIONS SERVICE (v1.1) =====

export const bankTransactionsService = {
  /**
   * Get all bank transactions with optional filters, sorting, and pagination
   */
  async getAll(
    filters?: BankTransactionFilters,
    sort?: BankTransactionSortOptions,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: ParsedBankTransaction[]; meta?: { currentPage: number; perPage: number; total: number; lastPage: number } }> {
    const params: Record<string, string> = {};

    // Apply filters
    if (filters?.bankAccountId) params['filter[bank_account_id]'] = String(filters.bankAccountId);
    if (filters?.transactionType) params['filter[transaction_type]'] = filters.transactionType;
    if (filters?.reconciliationStatus) params['filter[reconciliation_status]'] = filters.reconciliationStatus;
    if (filters?.statementNumber) params['filter[statement_number]'] = filters.statementNumber;
    if (filters?.reference) params['filter[reference]'] = filters.reference;
    if (filters?.isActive !== undefined) params['filter[is_active]'] = filters.isActive ? '1' : '0';

    // Apply sorting
    if (sort) {
      const sortPrefix = sort.direction === 'desc' ? '-' : '';
      const fieldMap: Record<string, string> = {
        transactionDate: 'transaction_date',
        amount: 'amount',
        transactionType: 'transaction_type',
        reconciliationStatus: 'reconciliation_status',
        createdAt: 'created_at',
        statementNumber: 'statement_number',
      };
      params.sort = `${sortPrefix}${fieldMap[sort.field] || sort.field}`;
    }

    // Apply pagination
    params['page[number]'] = String(page);
    params['page[size]'] = String(pageSize);

    // Include relationships
    params.include = 'bankAccount,reconciledBy';

    const response = await axiosClient.get('/api/v1/bank-transactions', { params });
    const transformedData = transformBankTransactionsFromAPI(response.data);

    return {
      data: transformedData,
      meta: response.data.meta?.page ? {
        currentPage: response.data.meta.page.currentPage || page,
        perPage: response.data.meta.page.perPage || pageSize,
        total: response.data.meta.page.total || transformedData.length,
        lastPage: response.data.meta.page.lastPage || 1,
      } : undefined,
    };
  },

  /**
   * Get a single bank transaction by ID
   */
  async getById(id: string): Promise<ParsedBankTransaction> {
    const response = await axiosClient.get(`/api/v1/bank-transactions/${id}?include=bankAccount,reconciledBy`);
    const transaction = transformBankTransactionFromAPI(response.data.data, response.data.included || []);
    return transformBankTransactionToParsed(transaction);
  },

  /**
   * Create a new bank transaction
   */
  async create(data: CreateBankTransactionRequest): Promise<ParsedBankTransaction> {
    const payload = transformBankTransactionToAPI(data);
    const response = await axiosClient.post('/api/v1/bank-transactions', payload);
    const transaction = transformBankTransactionFromAPI(response.data.data);
    return transformBankTransactionToParsed(transaction);
  },

  /**
   * Update an existing bank transaction
   */
  async update(id: string, data: UpdateBankTransactionRequest): Promise<ParsedBankTransaction> {
    const payload = transformBankTransactionUpdateToAPI(id, data);
    const response = await axiosClient.patch(`/api/v1/bank-transactions/${id}`, payload);
    const transaction = transformBankTransactionFromAPI(response.data.data);
    return transformBankTransactionToParsed(transaction);
  },

  /**
   * Delete a bank transaction
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/bank-transactions/${id}`);
  },

  /**
   * Mark a transaction as reconciled
   */
  async reconcile(id: string, notes?: string): Promise<ParsedBankTransaction> {
    return this.update(id, {
      reconciliationStatus: 'reconciled',
      reconciledAt: new Date().toISOString(),
      reconciliationNotes: notes,
    });
  },

  /**
   * Mark a transaction as unreconciled
   */
  async unreconcile(id: string): Promise<ParsedBankTransaction> {
    return this.update(id, {
      reconciliationStatus: 'unreconciled',
      reconciledAt: undefined,
      reconciledById: undefined,
      reconciliationNotes: undefined,
    });
  },

  /**
   * Get transactions by bank account ID
   */
  async getByBankAccount(
    bankAccountId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: ParsedBankTransaction[]; meta?: { currentPage: number; perPage: number; total: number; lastPage: number } }> {
    return this.getAll({ bankAccountId }, { field: 'transactionDate', direction: 'desc' }, page, pageSize);
  },

  /**
   * Get unreconciled transactions
   */
  async getUnreconciled(
    bankAccountId?: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: ParsedBankTransaction[]; meta?: { currentPage: number; perPage: number; total: number; lastPage: number } }> {
    return this.getAll(
      { bankAccountId, reconciliationStatus: 'unreconciled' },
      { field: 'transactionDate', direction: 'asc' },
      page,
      pageSize
    );
  },
};

// Export individual functions for Bank Transactions
export const getBankTransactions = (params?: {
  filters?: BankTransactionFilters;
  sort?: BankTransactionSortOptions;
  page?: number;
  pageSize?: number;
}) => bankTransactionsService.getAll(params?.filters, params?.sort, params?.page, params?.pageSize);

export const getBankTransaction = (id: string) => bankTransactionsService.getById(id);
export const createBankTransaction = (data: CreateBankTransactionRequest) => bankTransactionsService.create(data);
export const updateBankTransaction = (id: string, data: UpdateBankTransactionRequest) => bankTransactionsService.update(id, data);
export const deleteBankTransaction = (id: string) => bankTransactionsService.delete(id);
export const reconcileBankTransaction = (id: string, notes?: string) => bankTransactionsService.reconcile(id, notes);
export const unreconcileBankTransaction = (id: string) => bankTransactionsService.unreconcile(id);
