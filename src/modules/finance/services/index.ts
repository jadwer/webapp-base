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
} from '../utils/transformers';
import type {
  APInvoice,
  APPayment,
  ARInvoice,
  ARReceipt,
  BankAccount,
  APInvoiceForm,
  APPaymentForm,
  ARInvoiceForm,
  ARReceiptForm,
  FinanceAPIResponse,
} from '../types';

// AP Invoices Service
export const apInvoicesService = {
  async getAll(params: Record<string, any> = {}): Promise<FinanceAPIResponse<APInvoice>> {
    const response = await axiosClient.get('/api/v1/a-p-invoices', { params });
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
    const response = await axiosClient.get(`/api/v1/a-p-invoices/${id}${includeParam}`);
    return {
      data: transformAPInvoiceFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: APInvoiceForm): Promise<{ data: APInvoice }> {
    const payload = transformAPInvoiceToAPI(data);
    const response = await axiosClient.post('/api/v1/a-p-invoices', payload);
    return {
      data: transformAPInvoiceFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<APInvoiceForm>): Promise<{ data: APInvoice }> {
    const response = await axiosClient.patch(`/api/v1/a-p-invoices/${id}`, {
      data: {
        type: 'a-p-invoices',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/a-p-invoices/${id}`);
  },

  async post(id: string): Promise<{ data: APInvoice }> {
    const response = await axiosClient.post(`/api/v1/a-p-invoices/${id}/post`);
    return response.data;
  },
};

// AP Payments Service
export const apPaymentsService = {
  async getAll(params: Record<string, any> = {}): Promise<FinanceAPIResponse<APPayment>> {
    const response = await axiosClient.get('/api/v1/a-p-payments', { params });
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
    const response = await axiosClient.get(`/api/v1/a-p-payments/${id}${includeParam}`);
    return {
      data: transformAPPaymentFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: APPaymentForm): Promise<{ data: APPayment }> {
    const payload = transformAPPaymentToAPI(data);
    const response = await axiosClient.post('/api/v1/a-p-payments', payload);
    return {
      data: transformAPPaymentFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<APPaymentForm>): Promise<{ data: APPayment }> {
    const response = await axiosClient.patch(`/api/v1/a-p-payments/${id}`, {
      data: {
        type: 'a-p-payments',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/a-p-payments/${id}`);
  },

  async post(id: string): Promise<{ data: APPayment }> {
    const response = await axiosClient.post(`/api/v1/a-p-payments/${id}/post`);
    return response.data;
  },
};

// AR Invoices Service
export const arInvoicesService = {
  async getAll(params: Record<string, any> = {}): Promise<FinanceAPIResponse<ARInvoice>> {
    const response = await axiosClient.get('/api/v1/a-r-invoices', { params });
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
    const response = await axiosClient.get(`/api/v1/a-r-invoices/${id}${includeParam}`);
    return {
      data: transformARInvoiceFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: ARInvoiceForm): Promise<{ data: ARInvoice }> {
    const payload = transformARInvoiceToAPI(data);
    const response = await axiosClient.post('/api/v1/a-r-invoices', payload);
    return {
      data: transformARInvoiceFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<ARInvoiceForm>): Promise<{ data: ARInvoice }> {
    const response = await axiosClient.patch(`/api/v1/a-r-invoices/${id}`, {
      data: {
        type: 'a-r-invoices',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/a-r-invoices/${id}`);
  },

  async post(id: string): Promise<{ data: ARInvoice }> {
    const response = await axiosClient.post(`/api/v1/a-r-invoices/${id}/post`);
    return response.data;
  },
};

// AR Receipts Service
export const arReceiptsService = {
  async getAll(params: Record<string, any> = {}): Promise<FinanceAPIResponse<ARReceipt>> {
    const response = await axiosClient.get('/api/v1/a-r-receipts', { params });
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
    const response = await axiosClient.get(`/api/v1/a-r-receipts/${id}${includeParam}`);
    return {
      data: transformARReceiptFromAPI(response.data.data, response.data.included || [])
    };
  },

  async create(data: ARReceiptForm): Promise<{ data: ARReceipt }> {
    const payload = transformARReceiptToAPI(data);
    const response = await axiosClient.post('/api/v1/a-r-receipts', payload);
    return {
      data: transformARReceiptFromAPI(response.data.data)
    };
  },

  async update(id: string, data: Partial<ARReceiptForm>): Promise<{ data: ARReceipt }> {
    const response = await axiosClient.patch(`/api/v1/a-r-receipts/${id}`, {
      data: {
        type: 'a-r-receipts',
        id,
        attributes: data,
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/a-r-receipts/${id}`);
  },

  async post(id: string): Promise<{ data: ARReceipt }> {
    const response = await axiosClient.post(`/api/v1/a-r-receipts/${id}/post`);
    return response.data;
  },
};

// Bank Accounts Service
export const bankAccountsService = {
  async getAll(params: Record<string, any> = {}): Promise<FinanceAPIResponse<BankAccount>> {
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

  async create(data: any): Promise<{ data: BankAccount }> {
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
export const getAPInvoices = (params?: { filters?: any; pagination?: any; include?: string[]; sort?: string[] }) => {
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
  
  return apInvoicesService.getAll(queryParams);
};

export const getAPInvoice = (id: string) => apInvoicesService.getById(id).then(response => response.data);
export const createAPInvoice = (data: APInvoiceForm) => apInvoicesService.create(data).then(response => response.data);
export const updateAPInvoice = (id: string, data: Partial<APInvoiceForm>) => apInvoicesService.update(id, data).then(response => response.data);
export const deleteAPInvoice = (id: string) => apInvoicesService.delete(id);

export const getARInvoices = (params?: { filters?: any; pagination?: any; include?: string[]; sort?: string[] }) => {
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
  
  return arInvoicesService.getAll(queryParams);
};

export const getARInvoice = (id: string) => arInvoicesService.getById(id).then(response => response.data);
export const createARInvoice = (data: ARInvoiceForm) => arInvoicesService.create(data).then(response => response.data);
export const updateARInvoice = (id: string, data: Partial<ARInvoiceForm>) => arInvoicesService.update(id, data).then(response => response.data);
export const deleteARInvoice = (id: string) => arInvoicesService.delete(id);

export const getAPPayments = (params?: { filters?: any; pagination?: any; include?: string[]; sort?: string[] }) => {
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
  
  return apPaymentsService.getAll(queryParams);
};

export const getAPPayment = (id: string) => apPaymentsService.getById(id).then(response => response.data);
export const createAPPayment = (data: APPaymentForm) => apPaymentsService.create(data).then(response => response.data);
export const updateAPPayment = (id: string, data: Partial<APPaymentForm>) => apPaymentsService.update(id, data).then(response => response.data);
export const deleteAPPayment = (id: string) => apPaymentsService.delete(id);

export const getARReceipts = (params?: { filters?: any; pagination?: any; include?: string[]; sort?: string[] }) => {
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
  
  return arReceiptsService.getAll(queryParams);
};

export const getARReceipt = (id: string) => arReceiptsService.getById(id).then(response => response.data);
export const createARReceipt = (data: ARReceiptForm) => arReceiptsService.create(data).then(response => response.data);
export const updateARReceipt = (id: string, data: Partial<ARReceiptForm>) => arReceiptsService.update(id, data).then(response => response.data);
export const deleteARReceipt = (id: string) => arReceiptsService.delete(id);

export const getBankAccounts = (params?: { filters?: any; pagination?: any; include?: string[]; sort?: string[] }) => {
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
  
  return bankAccountsService.getAll(queryParams);
};

export const getBankAccount = (id: string) => bankAccountsService.getById(id).then(response => response.data);
export const createBankAccount = (data: any) => bankAccountsService.create(data).then(response => response.data);
export const updateBankAccount = (id: string, data: Partial<BankAccount>) => bankAccountsService.update(id, data).then(response => response.data);
export const deleteBankAccount = (id: string) => bankAccountsService.delete(id);