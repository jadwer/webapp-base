/**
 * Accounting Module - Public API
 * Chart of Accounts + Journal Entries + reportes ejecutivos (balance,
 * estado de resultados, balanza, libros, ventas y compras).
 */

// Components (incluye SalesReports/PurchaseReports que consumen las
// paginas sales/reports y purchase/reports de las apps)
export * from './components';

// Hooks
export * from './hooks';
export * from './hooks/useReports';

// Services
export * from './services';
export * from './services/reportsService';

// Types
export * from './types';

// Utils (Transformers)
export * from './utils';
