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
// Correct endpoints: /api/v1/reports/{report-type}
export const accountingReportsService = {
  // Balance General (Balance Sheet)
  // GET /api/v1/reports/balance-sheets?filter[asOfDate]=2026-01-12&filter[currency]=MXN
  async getBalanceGeneral(asOfDate?: string, currency: string = 'MXN'): Promise<BalanceGeneralResponse> {
    const params: Record<string, string> = { 'filter[currency]': currency };
    if (asOfDate) params['filter[asOfDate]'] = asOfDate;

    const response = await axiosClient.get('/api/v1/reports/balance-sheets', { params });
    return response.data;
  },

  // Estado de Resultados (Income Statement)
  // GET /api/v1/reports/income-statements?filter[startDate]=2026-01-01&filter[endDate]=2026-01-12
  async getEstadoResultados(startDate?: string, endDate?: string): Promise<{ report_type: string; data: EstadoResultadosData }> {
    const params: Record<string, string> = {};
    if (startDate) params['filter[startDate]'] = startDate;
    if (endDate) params['filter[endDate]'] = endDate;

    const response = await axiosClient.get('/api/v1/reports/income-statements', { params });
    return response.data;
  },

  // Balanza de Comprobacion (Trial Balance)
  // GET /api/v1/reports/trial-balances?filter[asOfDate]=2026-01-12
  async getBalanzaComprobacion(asOfDate?: string): Promise<BalanzaComprobacionResponse> {
    const params: Record<string, string> = {};
    if (asOfDate) params['filter[asOfDate]'] = asOfDate;

    const response = await axiosClient.get('/api/v1/reports/trial-balances', { params });
    return response.data;
  },

  // Flujo de Efectivo (Cash Flow)
  // GET /api/v1/reports/cash-flows?filter[startDate]=2026-01-01&filter[endDate]=2026-01-12
  async getCashFlow(startDate?: string, endDate?: string): Promise<LibroDiarioResponse> {
    const params: Record<string, string> = {};
    if (startDate) params['filter[startDate]'] = startDate;
    if (endDate) params['filter[endDate]'] = endDate;

    const response = await axiosClient.get('/api/v1/reports/cash-flows', { params });
    return response.data;
  },

  // Antiguedad Cuentas por Cobrar (AR Aging)
  // GET /api/v1/reports/ar-aging-reports
  async getARAgingReport(asOfDate?: string): Promise<LibroMayorResponse> {
    const params: Record<string, string> = {};
    if (asOfDate) params['filter[asOfDate]'] = asOfDate;

    const response = await axiosClient.get('/api/v1/reports/ar-aging-reports', { params });
    return response.data;
  },

  // Antiguedad Cuentas por Pagar (AP Aging)
  // GET /api/v1/reports/ap-aging-reports
  async getAPAgingReport(asOfDate?: string): Promise<LibroMayorResponse> {
    const params: Record<string, string> = {};
    if (asOfDate) params['filter[asOfDate]'] = asOfDate;

    const response = await axiosClient.get('/api/v1/reports/ap-aging-reports', { params });
    return response.data;
  },

  // Ventas por Cliente
  // GET /api/v1/reports/sales-by-customer-reports
  async getSalesByCustomerReport(startDate?: string, endDate?: string): Promise<unknown> {
    const params: Record<string, string> = {};
    if (startDate) params['filter[startDate]'] = startDate;
    if (endDate) params['filter[endDate]'] = endDate;

    const response = await axiosClient.get('/api/v1/reports/sales-by-customer-reports', { params });
    return response.data;
  },

  // Ventas por Producto
  // GET /api/v1/reports/sales-by-product-reports
  async getSalesByProductReport(startDate?: string, endDate?: string): Promise<unknown> {
    const params: Record<string, string> = {};
    if (startDate) params['filter[startDate]'] = startDate;
    if (endDate) params['filter[endDate]'] = endDate;

    const response = await axiosClient.get('/api/v1/reports/sales-by-product-reports', { params });
    return response.data;
  },

  // Compras por Proveedor
  // GET /api/v1/reports/purchase-by-supplier-reports
  async getPurchaseBySupplierReport(startDate?: string, endDate?: string): Promise<unknown> {
    const params: Record<string, string> = {};
    if (startDate) params['filter[startDate]'] = startDate;
    if (endDate) params['filter[endDate]'] = endDate;

    const response = await axiosClient.get('/api/v1/reports/purchase-by-supplier-reports', { params });
    return response.data;
  },

  // Compras por Producto
  // GET /api/v1/reports/purchase-by-product-reports
  async getPurchaseByProductReport(startDate?: string, endDate?: string): Promise<unknown> {
    const params: Record<string, string> = {};
    if (startDate) params['filter[startDate]'] = startDate;
    if (endDate) params['filter[endDate]'] = endDate;

    const response = await axiosClient.get('/api/v1/reports/purchase-by-product-reports', { params });
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