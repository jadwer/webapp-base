// Reports Hooks - SWR integration para reportes ejecutivos
// APIs: 7 reportes funcionando, solo necesitan UI

import useSWR from 'swr';
import { 
  accountingReportsService, 
  salesReportsService, 
  purchaseReportsService,
  type BalanceGeneralResponse,
  type BalanzaComprobacionResponse,
  type LibroDiarioResponse,
  type LibroMayorResponse,
  type SalesReportsResponse,
  type PurchaseReportsResponse,
} from '../services/reportsService';

// Balance General Hook
export function useBalanceGeneral(endDate?: string) {
  const { data, error, isLoading } = useSWR<BalanceGeneralResponse>(
    ['balance-general', endDate],
    () => accountingReportsService.getBalanceGeneral(endDate),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    balanceGeneral: data,
    isLoading,
    error,
  };
}

// Estado de Resultados Hook
export function useEstadoResultados(startDate?: string, endDate?: string) {
  const { data, error, isLoading } = useSWR(
    ['estado-resultados', startDate, endDate],
    () => accountingReportsService.getEstadoResultados(startDate, endDate),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    estadoResultados: data,
    isLoading,
    error,
  };
}

// Balanza de Comprobación Hook
export function useBalanzaComprobacion(endDate?: string) {
  const { data, error, isLoading } = useSWR<BalanzaComprobacionResponse>(
    ['balanza-comprobacion', endDate],
    () => accountingReportsService.getBalanzaComprobacion(endDate),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    balanzaComprobacion: data,
    isLoading,
    error,
  };
}

// Libro Diario Hook
export function useLibroDiario(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
} = {}) {
  const { data, error, isLoading } = useSWR<LibroDiarioResponse>(
    ['libro-diario', params],
    () => accountingReportsService.getLibroDiario(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    libroDiario: data,
    isLoading,
    error,
  };
}

// Libro Mayor Hook
export function useLibroMayor(accountId: number | null, startDate?: string, endDate?: string) {
  const { data, error, isLoading } = useSWR<LibroMayorResponse>(
    accountId ? ['libro-mayor', accountId, startDate, endDate] : null,
    accountId ? () => accountingReportsService.getLibroMayor(accountId, startDate, endDate) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    libroMayor: data,
    isLoading,
    error,
  };
}

// Sales Reports Hook
export function useSalesReports(period?: number) {
  const { data, error, isLoading } = useSWR<SalesReportsResponse>(
    ['sales-reports', period],
    () => salesReportsService.getSalesOrdersReport(period),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    salesReports: data,
    isLoading,
    error,
  };
}

// Purchase Reports Hook
export function usePurchaseReports(period?: number) {
  const { data, error, isLoading } = useSWR<PurchaseReportsResponse>(
    ['purchase-reports', period],
    () => purchaseReportsService.getPurchaseOrdersReport(period),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    purchaseReports: data,
    isLoading,
    error,
  };
}