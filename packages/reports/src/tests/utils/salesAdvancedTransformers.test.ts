/**
 * Reports Module - Advanced Sales Transformers Tests
 *
 * Verifica la transformacion snake_case (backend real) -> camelCase (frontend)
 * para los 4 reportes avanzados de ventas: employee, batch, profitability, trend.
 *
 * Los payloads snake_case replican el shape exacto que arma
 * api-base Modules/Reports SalesAdvancedReportService (byEmployee/byBatch/
 * generateProfitabilityReport/generateSalesTrend).
 */

import { describe, it, expect } from 'vitest';
import {
  transformSalesByEmployeeReport,
  transformSalesByBatchReport,
  transformProfitabilityReport,
  transformSalesTrendReport,
} from '../../utils/transformers';

// ============================================================================
// Payloads snake_case reales (shape del backend)
// ============================================================================

const employeePayload = {
  period: { start_date: '2026-07-01', end_date: '2026-07-31' },
  report_type: 'sales_by_employee',
  currency: 'MXN',
  employees: [
    {
      employee_id: 5,
      employee_name: 'Juan Perez',
      order_count: 12,
      total_sales: 25000.5,
      total_cost: 15000.25,
      gross_profit: 10000.25,
      margin_percentage: 40.0,
      average_order_value: 2083.38,
    },
    {
      employee_id: null,
      employee_name: 'Sin asignar',
      order_count: 3,
      total_sales: 4500,
      total_cost: 3150,
      gross_profit: 1350,
      margin_percentage: 30.0,
      average_order_value: 1500,
    },
  ],
  summary: {
    total_employees: 2,
    total_orders: 15,
    total_sales: 29500.5,
    total_cost: 18150.25,
    total_profit: 11350.25,
    average_margin: 38.47,
  },
};

const batchPayload = {
  period: { start_date: '2026-07-01', end_date: '2026-07-31' },
  report_type: 'sales_by_batch',
  currency: 'MXN',
  batches: [
    {
      batch_id: 7,
      batch_number: 'BATCH-001',
      lot_number: 'LOT-A1',
      product_id: 3,
      product_name: 'Producto de Prueba 3',
      product_sku: 'TEST-003',
      expiration_date: '2026-12-31',
      is_expiring_soon: false,
      quantity_sold: 42,
      unit_cost: 350.0,
      total_cost: 14700.0,
      estimated_revenue: 21000.0,
      movement_count: 4,
      gross_profit: 6300.0,
      margin_percentage: 30.0,
    },
  ],
  summary: {
    total_batches: 1,
    total_quantity_sold: 42,
    total_cost: 14700.0,
    total_revenue: 21000.0,
    total_profit: 6300.0,
    average_margin: 30.0,
  },
};

// Capturado en vivo del demo (sales-profitability)
const profitabilityPayload = {
  period: { start_date: '2026-07-01', end_date: '2026-07-31' },
  report_type: 'sales_profitability',
  currency: 'MXN',
  products: [
    {
      product_id: 1,
      product_code: 'TEST-001',
      product_name: 'Producto de Prueba 1',
      category_name: 'Productos de Prueba',
      quantity_sold: 10,
      revenue: 1000.0,
      cost: 700.0,
      gross_profit: 300.0,
      margin_percentage: 30.0,
      average_price: 100.0,
      average_cost: 70.0,
    },
  ],
  summary: {
    total_products: 1,
    total_quantity: 10,
    total_revenue: 1000.0,
    total_cost: 700.0,
    total_profit: 300.0,
    average_margin: 30.0,
  },
};

const trendPayload = {
  period: { start_date: '2026-07-01', end_date: '2026-07-07' },
  report_type: 'sales_trend',
  group_by: 'day',
  currency: 'MXN',
  trends: [
    {
      period: '2026-07-01',
      order_count: 4,
      total_sales: 8000.0,
      subtotal: 6896.55,
      tax_total: 1103.45,
      average_order_value: 2000.0,
    },
  ],
  summary: {
    total_periods: 1,
    total_orders: 4,
    total_sales: 8000.0,
    average_per_period: 8000.0,
  },
};

// ============================================================================
// transformSalesByEmployeeReport
// ============================================================================

describe('transformSalesByEmployeeReport', () => {
  it('should transform real snake_case payload to camelCase', () => {
    const result = transformSalesByEmployeeReport(employeePayload);

    expect(result.period).toEqual({ startDate: '2026-07-01', endDate: '2026-07-31' });
    expect(result.reportType).toBe('sales_by_employee');
    expect(result.currency).toBe('MXN');

    expect(result.employees).toHaveLength(2);
    expect(result.employees[0]).toEqual({
      employeeId: 5,
      employeeName: 'Juan Perez',
      orderCount: 12,
      totalSales: 25000.5,
      totalCost: 15000.25,
      grossProfit: 10000.25,
      marginPercentage: 40.0,
      averageOrderValue: 2083.38,
    });
    // employee_id null (Sin asignar) se preserva como null
    expect(result.employees[1].employeeId).toBeNull();

    expect(result.summary).toEqual({
      totalEmployees: 2,
      totalOrders: 15,
      totalSales: 29500.5,
      totalCost: 18150.25,
      totalProfit: 11350.25,
      averageMargin: 38.47,
    });
  });

  it('should coerce numeric strings with Number()', () => {
    const result = transformSalesByEmployeeReport({
      employees: [{ employee_id: '5', total_sales: '1500.50', margin_percentage: '12.5' }],
      summary: { total_sales: '1500.50' },
    });

    expect(result.employees[0].employeeId).toBe(5);
    expect(result.employees[0].totalSales).toBe(1500.5);
    expect(result.employees[0].marginPercentage).toBe(12.5);
    expect(result.summary.totalSales).toBe(1500.5);
  });

  it('should return safe defaults for empty payload without crashing', () => {
    const result = transformSalesByEmployeeReport({});

    expect(result.employees).toEqual([]);
    expect(result.summary.totalSales).toBe(0);
    expect(result.summary.averageMargin).toBe(0);
    expect(result.period).toEqual({ startDate: '', endDate: '' });
  });

  it('should not crash with undefined payload', () => {
    const result = transformSalesByEmployeeReport(undefined);

    expect(result.employees).toEqual([]);
    expect(result.summary.totalOrders).toBe(0);
  });
});

// ============================================================================
// transformSalesByBatchReport
// ============================================================================

describe('transformSalesByBatchReport', () => {
  it('should transform real snake_case payload to camelCase', () => {
    const result = transformSalesByBatchReport(batchPayload);

    expect(result.reportType).toBe('sales_by_batch');
    expect(result.batches).toHaveLength(1);
    expect(result.batches[0]).toEqual({
      batchId: 7,
      batchNumber: 'BATCH-001',
      lotNumber: 'LOT-A1',
      productId: 3,
      productName: 'Producto de Prueba 3',
      productSku: 'TEST-003',
      expirationDate: '2026-12-31',
      isExpiringSoon: false,
      quantitySold: 42,
      unitCost: 350.0,
      totalCost: 14700.0,
      estimatedRevenue: 21000.0,
      grossProfit: 6300.0,
      marginPercentage: 30.0,
      movementCount: 4,
    });
    expect(result.summary).toEqual({
      totalBatches: 1,
      totalQuantitySold: 42,
      totalCost: 14700.0,
      totalRevenue: 21000.0,
      totalProfit: 6300.0,
      averageMargin: 30.0,
    });
  });

  it('should keep nullable fields as null and support .toFixed on quantitySold', () => {
    const result = transformSalesByBatchReport({
      batches: [{ batch_id: 1, batch_number: 'B-1', lot_number: null, expiration_date: null }],
    });

    expect(result.batches[0].lotNumber).toBeNull();
    expect(result.batches[0].expirationDate).toBeNull();
    // quantity_sold ausente -> 0, el componente hace .toFixed(0) directo
    expect(result.batches[0].quantitySold.toFixed(0)).toBe('0');
  });

  it('should return safe defaults for empty payload without crashing', () => {
    const result = transformSalesByBatchReport({});

    expect(result.batches).toEqual([]);
    expect(result.summary.totalQuantitySold).toBe(0);
    expect(result.summary.totalRevenue).toBe(0);
  });
});

// ============================================================================
// transformProfitabilityReport
// ============================================================================

describe('transformProfitabilityReport', () => {
  it('should transform real snake_case payload to camelCase', () => {
    const result = transformProfitabilityReport(profitabilityPayload);

    expect(result.reportType).toBe('sales_profitability');
    expect(result.currency).toBe('MXN');
    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toEqual({
      productId: 1,
      productCode: 'TEST-001',
      productName: 'Producto de Prueba 1',
      categoryName: 'Productos de Prueba',
      quantitySold: 10,
      revenue: 1000.0,
      cost: 700.0,
      grossProfit: 300.0,
      marginPercentage: 30.0,
      averagePrice: 100.0,
      averageCost: 70.0,
    });
    expect(result.summary).toEqual({
      totalProducts: 1,
      totalQuantity: 10,
      totalRevenue: 1000.0,
      totalCost: 700.0,
      totalProfit: 300.0,
      averageMargin: 30.0,
    });
  });

  it('should support .toFixed on quantitySold even when field is missing', () => {
    const result = transformProfitabilityReport({
      products: [{ product_id: 9, product_name: 'X' }],
    });

    // Este era el crash de produccion: product.quantitySold.toFixed(0)
    expect(result.products[0].quantitySold.toFixed(0)).toBe('0');
    expect(result.products[0].marginPercentage).toBe(0);
  });

  it('should return safe defaults for empty payload without crashing', () => {
    const result = transformProfitabilityReport({});

    expect(result.products).toEqual([]);
    expect(result.summary.totalQuantity).toBe(0);
    expect(result.summary.averageMargin).toBe(0);
  });
});

// ============================================================================
// transformSalesTrendReport
// ============================================================================

describe('transformSalesTrendReport', () => {
  it('should transform real snake_case payload to camelCase', () => {
    const result = transformSalesTrendReport(trendPayload);

    expect(result.reportType).toBe('sales_trend');
    expect(result.groupBy).toBe('day');
    expect(result.trends).toHaveLength(1);
    expect(result.trends[0]).toEqual({
      period: '2026-07-01',
      orderCount: 4,
      totalSales: 8000.0,
      subtotal: 6896.55,
      taxTotal: 1103.45,
      averageOrderValue: 2000.0,
    });
    expect(result.summary).toEqual({
      totalPeriods: 1,
      totalOrders: 4,
      totalSales: 8000.0,
      averagePerPeriod: 8000.0,
    });
  });

  it('should return safe defaults for empty payload without crashing', () => {
    const result = transformSalesTrendReport({});

    expect(result.trends).toEqual([]);
    expect(result.groupBy).toBe('day');
    expect(result.summary.totalSales).toBe(0);
    expect(result.summary.totalPeriods).toBe(0);
  });
});
