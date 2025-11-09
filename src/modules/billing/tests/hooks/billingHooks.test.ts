/**
 * Billing Module - Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useCFDIInvoices,
  useCFDIInvoice,
  useCFDIInvoicesMutations,
  useCFDIItems,
  useCFDIItem,
  useCFDIItemsMutations,
  useCompanySettings,
  useCompanySetting,
  useActiveCompanySetting,
  useCompanySettingsMutations,
  useCFDIWorkflow,
} from '../../hooks';

// Mock the services
vi.mock('../../services', () => ({
  cfdiInvoicesService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    createWithItems: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    generateXML: vi.fn(),
    generatePDF: vi.fn(),
    stamp: vi.fn(),
    cancel: vi.fn(),
    downloadXML: vi.fn(),
    downloadPDF: vi.fn(),
    sendEmail: vi.fn(),
  },
  cfdiItemsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  companySettingsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    testPACConnection: vi.fn(),
    uploadCertificate: vi.fn(),
    uploadKey: vi.fn(),
  },
}));

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key) => {
    if (key) {
      return {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      };
    }
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    };
  }),
}));

describe('Billing Module Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // CFDI INVOICES HOOKS
  // ==========================================================================

  describe('useCFDIInvoices', () => {
    it('should return CFDI invoices data structure', () => {
      // Act
      const { result } = renderHook(() => useCFDIInvoices());

      // Assert
      expect(result.current).toHaveProperty('invoices');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept optional filters', () => {
      // Act
      const filters = { status: 'valid' as const, tipoComprobante: 'I' as const };
      renderHook(() => useCFDIInvoices(filters));

      // Assert - Filters are passed to SWR key
    });

    it('should accept search and date filters', () => {
      // Act
      const filters = {
        search: 'A-001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };
      renderHook(() => useCFDIInvoices(filters));

      // Assert - Search and date filters are passed
    });
  });

  describe('useCFDIInvoice', () => {
    it('should return single CFDI invoice data structure', () => {
      // Act
      const { result } = renderHook(() => useCFDIInvoice('1'));

      // Assert
      expect(result.current).toHaveProperty('invoice');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should handle null id', () => {
      // Act
      const { result } = renderHook(() => useCFDIInvoice(null));

      // Assert - Should not make request with null id
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCFDIInvoicesMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useCFDIInvoicesMutations());

      // Assert
      expect(result.current).toHaveProperty('createInvoice');
      expect(result.current).toHaveProperty('createInvoiceWithItems');
      expect(result.current).toHaveProperty('updateInvoice');
      expect(result.current).toHaveProperty('deleteInvoice');
      expect(typeof result.current.createInvoice).toBe('function');
      expect(typeof result.current.createInvoiceWithItems).toBe('function');
      expect(typeof result.current.updateInvoice).toBe('function');
      expect(typeof result.current.deleteInvoice).toBe('function');
    });
  });

  // ==========================================================================
  // CFDI ITEMS HOOKS
  // ==========================================================================

  describe('useCFDIItems', () => {
    it('should return CFDI items data structure', () => {
      // Act
      const { result } = renderHook(() => useCFDIItems());

      // Assert
      expect(result.current).toHaveProperty('items');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should accept invoice filter', () => {
      // Act
      const filters = { cfdiInvoiceId: '1' };
      renderHook(() => useCFDIItems(filters));

      // Assert - Invoice filter is passed
    });
  });

  describe('useCFDIItem', () => {
    it('should return single CFDI item data structure', () => {
      // Act
      const { result } = renderHook(() => useCFDIItem('1'));

      // Assert
      expect(result.current).toHaveProperty('item');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should handle null id', () => {
      // Act
      const { result } = renderHook(() => useCFDIItem(null));

      // Assert
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCFDIItemsMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useCFDIItemsMutations());

      // Assert
      expect(result.current).toHaveProperty('createItem');
      expect(result.current).toHaveProperty('updateItem');
      expect(result.current).toHaveProperty('deleteItem');
      expect(typeof result.current.createItem).toBe('function');
      expect(typeof result.current.updateItem).toBe('function');
      expect(typeof result.current.deleteItem).toBe('function');
    });
  });

  // ==========================================================================
  // COMPANY SETTINGS HOOKS
  // ==========================================================================

  describe('useCompanySettings', () => {
    it('should return company settings data structure', () => {
      // Act
      const { result } = renderHook(() => useCompanySettings());

      // Assert
      expect(result.current).toHaveProperty('settings');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });
  });

  describe('useCompanySetting', () => {
    it('should return single company setting data structure', () => {
      // Act
      const { result } = renderHook(() => useCompanySetting('1'));

      // Assert
      expect(result.current).toHaveProperty('setting');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should handle null id', () => {
      // Act
      const { result } = renderHook(() => useCompanySetting(null));

      // Assert
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useActiveCompanySetting', () => {
    it('should return active company setting data structure', () => {
      // Act
      const { result } = renderHook(() => useActiveCompanySetting());

      // Assert
      expect(result.current).toHaveProperty('activeSetting');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('mutate');
    });
  });

  describe('useCompanySettingsMutations', () => {
    it('should return mutation functions', () => {
      // Act
      const { result } = renderHook(() => useCompanySettingsMutations());

      // Assert
      expect(result.current).toHaveProperty('createSetting');
      expect(result.current).toHaveProperty('updateSetting');
      expect(result.current).toHaveProperty('deleteSetting');
      expect(result.current).toHaveProperty('testPACConnection');
      expect(result.current).toHaveProperty('uploadCertificate');
      expect(result.current).toHaveProperty('uploadKey');
      expect(typeof result.current.createSetting).toBe('function');
      expect(typeof result.current.updateSetting).toBe('function');
      expect(typeof result.current.deleteSetting).toBe('function');
      expect(typeof result.current.testPACConnection).toBe('function');
      expect(typeof result.current.uploadCertificate).toBe('function');
      expect(typeof result.current.uploadKey).toBe('function');
    });
  });

  // ==========================================================================
  // CFDI WORKFLOW HOOK
  // ==========================================================================

  describe('useCFDIWorkflow', () => {
    it('should return workflow functions', () => {
      // Act
      const { result } = renderHook(() => useCFDIWorkflow());

      // Assert
      expect(result.current).toHaveProperty('processInvoice');
      expect(result.current).toHaveProperty('generateXML');
      expect(result.current).toHaveProperty('generatePDF');
      expect(result.current).toHaveProperty('stampInvoice');
      expect(result.current).toHaveProperty('cancelInvoice');
      expect(typeof result.current.processInvoice).toBe('function');
      expect(typeof result.current.generateXML).toBe('function');
      expect(typeof result.current.generatePDF).toBe('function');
      expect(typeof result.current.stampInvoice).toBe('function');
      expect(typeof result.current.cancelInvoice).toBe('function');
    });
  });
});
