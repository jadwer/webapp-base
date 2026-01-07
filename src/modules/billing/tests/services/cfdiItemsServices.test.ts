/**
 * Billing Module - CFDI Items Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { cfdiItemsService } from '../../services';
import {
  createMockCFDIItem,
  createMockCFDIItems,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

// Mock transformers
vi.mock('../../utils/transformers', () => ({
  transformCFDIItemsResponse: vi.fn((data) => data),
  transformJsonApiCFDIItem: vi.fn((data) => data),
  transformCFDIItemFormToJsonApi: vi.fn((data) => ({ type: 'cfdi_items', attributes: data })),
}));

describe('CFDI Items Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('getAll', () => {
    it('should fetch all CFDI items', async () => {
      // Arrange
      const mockItems = createMockCFDIItems(3);
      const mockResponse = createMockAPICollectionResponse(
        mockItems.map(item => ({
          id: item.id,
          attributes: {
            descripcion: item.descripcion,
            cantidad: item.cantidad,
          },
        })),
        'cfdi_items'
      );
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cfdiItemsService.getAll();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/cfdi-items');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch CFDI items filtered by invoice', async () => {
      // Arrange
      const mockItems = [createMockCFDIItem()];
      const mockResponse = createMockAPICollectionResponse(
        mockItems.map(item => ({ id: item.id, attributes: { descripcion: item.descripcion } })),
        'cfdi_items'
      );
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cfdiItemsService.getAll({ cfdiInvoiceId: 1 });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BcfdiInvoiceId%5D=1')
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch single CFDI item by ID', async () => {
      // Arrange
      const mockItem = createMockCFDIItem();
      const mockResponse = { data: mockItem, included: [] };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cfdiItemsService.getById('1');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/cfdi-items/1');
      expect(result).toEqual(mockItem);
    });
  });

  describe('create', () => {
    it('should create new CFDI item', async () => {
      // Arrange
      const mockItem = createMockCFDIItem();
      const mockResponse = { data: mockItem, included: [] };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const formData = {
        cfdiInvoiceId: 1,
        claveProdServ: '01010101',
        cantidad: 1,
        claveUnidad: 'H87',
        unidad: 'Pieza',
        descripcion: 'Test Product',
        valorUnitario: 100000,
        importe: 100000,
        objetoImp: '02',
      };

      // Act
      const result = await cfdiItemsService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/cfdi-items',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'cfdi_items',
          }),
        })
      );
      expect(result).toEqual(mockItem);
    });
  });

  describe('update', () => {
    it('should update CFDI item', async () => {
      // Arrange
      const mockItem = createMockCFDIItem();
      const mockResponse = { data: mockItem, included: [] };
      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      const formData = {
        cfdiInvoiceId: 1,
        claveProdServ: '01010101',
        cantidad: 2,
        claveUnidad: 'H87',
        unidad: 'Pieza',
        descripcion: 'Updated Product',
        valorUnitario: 150000,
        importe: 300000,
        objetoImp: '02',
      };

      // Act
      const result = await cfdiItemsService.update('1', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/cfdi-items/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockItem);
    });
  });

  describe('delete', () => {
    it('should delete CFDI item', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: null });

      // Act
      await cfdiItemsService.delete('1');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/cfdi-items/1');
    });
  });

  describe('error handling', () => {
    it('should handle errors when fetching items', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(cfdiItemsService.getAll()).rejects.toThrow();
    });

    it('should handle errors when creating item', async () => {
      // Arrange
      const error = createMockAxiosError(422, 'Validation Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      const formData = {
        cfdiInvoiceId: 1,
        claveProdServ: '',
        cantidad: 0,
        claveUnidad: '',
        unidad: '',
        descripcion: '',
        valorUnitario: 0,
        importe: 0,
        objetoImp: '',
      };

      // Act & Assert
      await expect(cfdiItemsService.create(formData)).rejects.toThrow();
    });
  });
});
