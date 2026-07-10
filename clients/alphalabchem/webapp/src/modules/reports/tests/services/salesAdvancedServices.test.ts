/**
 * Reports Module - Advanced Sales Services Tests
 *
 * Los 4 endpoints (sales-by-employee, sales-by-batch, sales-profitability,
 * sales-trend) responden { data: {...} } con keys snake_case. Los services
 * deben devolver { data: {...} } ya transformado a camelCase para que los
 * hooks (data?.data) entreguen al componente el shape que consume.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import {
  salesByEmployeeService,
  salesByBatchService,
  salesProfitabilityService,
  salesTrendService,
} from '../../services';

// Mock axios client
vi.mock('@/lib/axiosClient');

describe('salesByEmployeeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch with snake_case query params and transform response to camelCase', async () => {
    // Arrange - shape real del backend
    vi.mocked(axiosClient.get).mockResolvedValue({
      data: {
        data: {
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
          ],
          summary: {
            total_employees: 1,
            total_orders: 12,
            total_sales: 25000.5,
            total_cost: 15000.25,
            total_profit: 10000.25,
            average_margin: 40.0,
          },
        },
      },
    });

    // Act
    const result = await salesByEmployeeService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      employeeId: 5,
    });

    // Assert
    expect(axiosClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/reports/sales-by-employee?')
    );
    expect(axiosClient.get).toHaveBeenCalledWith(expect.stringContaining('employee_id=5'));
    expect(result.data.employees[0].employeeName).toBe('Juan Perez');
    expect(result.data.employees[0].marginPercentage).toBe(40.0);
    expect(result.data.employees[0].averageOrderValue).toBe(2083.38);
    expect(result.data.summary.totalSales).toBe(25000.5);
    expect(result.data.summary.averageMargin).toBe(40.0);
  });

  it('should return safe defaults when backend sends empty report', async () => {
    // Arrange
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: {} } });

    // Act
    const result = await salesByEmployeeService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    });

    // Assert - sin crash, arrays y numeros con default
    expect(result.data.employees).toEqual([]);
    expect(result.data.summary.totalSales).toBe(0);
  });
});

describe('salesByBatchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transform snake_case batches to camelCase', async () => {
    // Arrange
    vi.mocked(axiosClient.get).mockResolvedValue({
      data: {
        data: {
          period: { start_date: '2026-07-01', end_date: '2026-07-31' },
          report_type: 'sales_by_batch',
          currency: 'MXN',
          batches: [
            {
              batch_id: 7,
              batch_number: 'BATCH-001',
              lot_number: null,
              product_id: 3,
              product_name: 'Producto 3',
              product_sku: 'TEST-003',
              expiration_date: '2026-12-31',
              is_expiring_soon: true,
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
        },
      },
    });

    // Act
    const result = await salesByBatchService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      batchNumber: 'BATCH-001',
    });

    // Assert
    expect(axiosClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/reports/sales-by-batch?')
    );
    expect(axiosClient.get).toHaveBeenCalledWith(expect.stringContaining('batch_number=BATCH-001'));
    expect(result.data.batches[0].batchNumber).toBe('BATCH-001');
    expect(result.data.batches[0].quantitySold).toBe(42);
    expect(result.data.batches[0].isExpiringSoon).toBe(true);
    expect(result.data.summary.totalQuantitySold).toBe(42);
    expect(result.data.summary.totalRevenue).toBe(21000.0);
  });

  it('should return safe defaults when backend sends empty report', async () => {
    // Arrange
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: {} } });

    // Act
    const result = await salesByBatchService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    });

    // Assert
    expect(result.data.batches).toEqual([]);
    expect(result.data.summary.totalQuantitySold).toBe(0);
  });
});

describe('salesProfitabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transform the real production payload to camelCase (crash regression)', async () => {
    // Arrange - payload snake_case capturado en vivo
    vi.mocked(axiosClient.get).mockResolvedValue({
      data: {
        data: {
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
        },
      },
    });

    // Act
    const result = await salesProfitabilityService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      categoryId: 2,
    });

    // Assert
    expect(axiosClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/reports/sales-profitability?')
    );
    expect(axiosClient.get).toHaveBeenCalledWith(expect.stringContaining('category_id=2'));

    const product = result.data.products[0];
    // El crash de produccion era quantitySold undefined -> .toFixed revienta
    expect(product.quantitySold.toFixed(0)).toBe('10');
    expect(product.productCode).toBe('TEST-001');
    expect(product.categoryName).toBe('Productos de Prueba');
    expect(product.grossProfit).toBe(300.0);
    expect(product.marginPercentage).toBe(30.0);
    expect(product.averagePrice).toBe(100.0);
    expect(product.averageCost).toBe(70.0);
    expect(result.data.summary.totalRevenue).toBe(1000.0);
    expect(result.data.summary.averageMargin).toBe(30.0);
  });

  it('should return safe defaults when backend sends empty report', async () => {
    // Arrange
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: {} } });

    // Act
    const result = await salesProfitabilityService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    });

    // Assert
    expect(result.data.products).toEqual([]);
    expect(result.data.summary.totalQuantity).toBe(0);
  });
});

describe('salesTrendService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transform snake_case trends to camelCase', async () => {
    // Arrange
    vi.mocked(axiosClient.get).mockResolvedValue({
      data: {
        data: {
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
        },
      },
    });

    // Act
    const result = await salesTrendService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-07',
      groupBy: 'day',
    });

    // Assert
    expect(axiosClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/reports/sales-trend?')
    );
    expect(axiosClient.get).toHaveBeenCalledWith(expect.stringContaining('group_by=day'));
    expect(result.data.trends[0].orderCount).toBe(4);
    expect(result.data.trends[0].totalSales).toBe(8000.0);
    expect(result.data.trends[0].taxTotal).toBe(1103.45);
    expect(result.data.trends[0].averageOrderValue).toBe(2000.0);
    expect(result.data.summary.averagePerPeriod).toBe(8000.0);
  });

  it('should return safe defaults when backend sends empty report', async () => {
    // Arrange
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: {} } });

    // Act
    const result = await salesTrendService.get({
      startDate: '2026-07-01',
      endDate: '2026-07-07',
      groupBy: 'day',
    });

    // Assert
    expect(result.data.trends).toEqual([]);
    expect(result.data.summary.totalSales).toBe(0);
  });
});
