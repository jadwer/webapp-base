// Accounting Reports Service - APIs ya funcionando
// Conecta con los 7 reportes ejecutivos disponibles

import axiosClient from '@/lib/axiosClient';

export interface BalanceGeneralAccount {
  account_id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  balance: number;
  debits: string;
  credits: string;
}

export interface BalanceGeneralData {
  assets: {
    accounts: BalanceGeneralAccount[];
    total: number;
  };
  liabilities: {
    accounts: BalanceGeneralAccount[];
    total: number;
  };
  equity: {
    accounts: BalanceGeneralAccount[];
    total: number;
  };
}

export interface BalanceGeneralResponse {
  report_type: string;
  report_date: string;
  data: BalanceGeneralData;
  totals: {
    total_assets: number;
    total_liabilities_equity: number;
    balanced: boolean;
  };
}

export interface EstadoResultadosAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  balance: number;
}

export interface EstadoResultadosData {
  revenue: {
    accounts: EstadoResultadosAccount[];
    total: number;
  };
  expenses: {
    accounts: EstadoResultadosAccount[];
    total: number;
  };
  net_income: number;
}

export interface BalanzaComprobacionAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  debits: string;
  credits: string;
  balance: number;
}

export interface BalanzaComprobacionResponse {
  report_type: string;
  data: BalanzaComprobacionAccount[];
  totals: {
    total_debits: number;
    total_credits: number;
    balanced: boolean;
  };
}

export interface LibroDiarioEntry {
  entry_date: string;
  entry_number: string;
  description: string;
  account_code: string;
  account_name: string;
  debit: string;
  credit: string;
}

export interface LibroDiarioResponse {
  report_type: string;
  data: LibroDiarioEntry[];
  totals: {
    total_debits: number;
    total_credits: number;
  };
}

export interface LibroMayorEntry {
  entry_date: string;
  entry_number: string;
  description: string;
  debit: string;
  credit: string;
  balance: number;
}

export interface LibroMayorResponse {
  report_type: string;
  account: {
    id: number;
    code: string;
    name: string;
    type: string;
  };
  opening_balance: number;
  closing_balance: number;
  data: LibroMayorEntry[];
}

// Accounting Reports Service
export const accountingReportsService = {
  // Balance General
  async getBalanceGeneral(endDate?: string): Promise<BalanceGeneralResponse> {
    const params = endDate ? { end_date: endDate } : {};
    const response = await axiosClient.get('/api/v1/accounting/reports/balance-general', { params });
    return response.data;
  },

  // Estado de Resultados
  async getEstadoResultados(startDate?: string, endDate?: string): Promise<{ report_type: string; data: EstadoResultadosData }> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axiosClient.get('/api/v1/accounting/reports/estado-resultados', { params });
    return response.data;
  },

  // Balanza de Comprobación
  async getBalanzaComprobacion(endDate?: string): Promise<BalanzaComprobacionResponse> {
    const params = endDate ? { end_date: endDate } : {};
    const response = await axiosClient.get('/api/v1/accounting/reports/balanza-comprobacion', { params });
    return response.data;
  },

  // Libro Diario
  async getLibroDiario(params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  } = {}): Promise<LibroDiarioResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params.startDate) queryParams.start_date = params.startDate;
    if (params.endDate) queryParams.end_date = params.endDate;
    if (params.page) queryParams.page = params.page;
    if (params.perPage) queryParams.per_page = params.perPage;
    
    const response = await axiosClient.get('/api/v1/accounting/reports/libro-diario', { params: queryParams });
    return response.data;
  },

  // Libro Mayor
  async getLibroMayor(accountId: number, startDate?: string, endDate?: string): Promise<LibroMayorResponse> {
    const params: Record<string, string | number> = { account_id: accountId };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axiosClient.get('/api/v1/accounting/reports/libro-mayor', { params });
    return response.data;
  },
};

// Sales Reports Interfaces
export interface SalesReportData {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  top_customers: Array<{
    customer_id: number;
    customer_name: string;
    total_sales: number;
    total_orders: number;
  }>;
  sales_by_period: Array<{
    period: string;
    total_sales: number;
    total_orders: number;
  }>;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
    total_revenue: number;
  }>;
}

export interface SalesReportsResponse {
  report_type: string;
  period: number;
  data: SalesReportData;
}

// Purchase Reports Interfaces  
export interface PurchaseReportData {
  total_purchases: number;
  total_orders: number;
  average_order_value: number;
  top_suppliers: Array<{
    supplier_id: number;
    supplier_name: string;
    total_purchases: number;
    total_orders: number;
  }>;
  purchases_by_period: Array<{
    period: string;
    total_purchases: number;
    total_orders: number;
  }>;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_purchased: number;
    total_cost: number;
  }>;
}

export interface PurchaseReportsResponse {
  report_type: string;
  period: number;
  data: PurchaseReportData;
}

// Sales Reports Service
export const salesReportsService = {
  async getSalesOrdersReport(period?: number): Promise<SalesReportsResponse> {
    const params = period ? { period } : {};
    const response = await axiosClient.get('/api/v1/sales-orders/reports', { params });
    return response.data;
  },
};

// Purchase Reports Service  
export const purchaseReportsService = {
  async getPurchaseOrdersReport(period?: number): Promise<PurchaseReportsResponse> {
    const params = period ? { period } : {};
    const response = await axiosClient.get('/api/v1/purchase-orders/reports', { params });
    return response.data;
  },
};