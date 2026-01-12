/**
 * Billing Module - CFDI Invoices Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { cfdiInvoicesService } from '../../services';
import {
  createMockCFDIInvoice,
  createMockCFDIInvoices,
  createMockStampResponse,
  createMockCancelResponse,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

// Mock transformers
vi.mock('../../utils/transformers', () => ({
  transformCFDIInvoicesResponse: vi.fn((data) => data),
  transformJsonApiCFDIInvoice: vi.fn((data) => data),
  transformCFDIInvoiceFormToJsonApi: vi.fn((data) => ({ type: 'cfdi_invoices', attributes: data })),
  transformCFDIItemFormToJsonApi: vi.fn((data) => ({ type: 'cfdi_items', attributes: data })),
}));

describe('CFDI Invoices Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  describe('getAll', () => {
    it('should fetch all CFDI invoices with includes', async () => {
      // Arrange
      const mockInvoices = createMockCFDIInvoices(3);
      const mockResponse = createMockAPICollectionResponse(
        mockInvoices.map(inv => ({
          id: inv.id,
          attributes: {
            series: inv.series,
            folio: inv.folio,
            status: inv.status,
          },
        })),
        'cfdi_invoices'
      );
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cfdiInvoicesService.getAll();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('include=companySetting')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch CFDI invoices with filters', async () => {
      // Arrange
      const mockInvoices = [createMockCFDIInvoice()];
      const mockResponse = createMockAPICollectionResponse(
        mockInvoices.map(inv => ({ id: inv.id, attributes: { status: inv.status } })),
        'cfdi_invoices'
      );
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cfdiInvoicesService.getAll({
        status: 'valid',
        tipoComprobante: 'I',
      });

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5Bstatus%5D=valid')
      );
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BtipoComprobante%5D=I')
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch single CFDI invoice by ID', async () => {
      // Arrange
      const mockInvoice = createMockCFDIInvoice();
      const mockResponse = { data: mockInvoice, included: [] };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cfdiInvoicesService.getById('1');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/cfdi-invoices/1?include=companySetting,contact,items'
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('create', () => {
    it('should create new CFDI invoice', async () => {
      // Arrange
      const mockInvoice = createMockCFDIInvoice();
      const mockResponse = { data: mockInvoice, included: [] };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const formData = {
        series: 'A',
        tipoComprobante: 'I' as const,
        metodoPago: 'PUE' as const,
        formaPago: '01',
        moneda: 'MXN',
        tipoCambio: 1,
        companySettingId: 1,
        contactId: 1,
        receptorRfc: 'XAXX010101000',
        receptorNombre: 'Test Receptor',
        receptorUsoCfdi: 'G03',
        receptorRegimenFiscal: '601',
        receptorDomicilioFiscal: '12345',
        subtotal: 100000,
        total: 116000,
        descuento: 0,
        iva: 16000,
        status: 'draft' as const,
        fechaEmision: '2025-01-15T10:00:00Z',
      };

      // Act
      const result = await cfdiInvoicesService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/cfdi-invoices',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'cfdi_invoices',
          }),
        })
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('createWithItems', () => {
    it('should create CFDI invoice with items', async () => {
      // Arrange
      const mockInvoice = createMockCFDIInvoice();
      const mockResponse = { data: mockInvoice, included: [] };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const data = {
        invoice: {
          series: 'A',
          tipoComprobante: 'I' as const,
          metodoPago: 'PUE' as const,
          formaPago: '01',
          moneda: 'MXN',
          tipoCambio: 1,
          companySettingId: 1,
          contactId: 1,
          receptorRfc: 'XAXX010101000',
          receptorNombre: 'Test Receptor',
          receptorUsoCfdi: 'G03',
          receptorRegimenFiscal: '601',
          receptorDomicilioFiscal: '12345',
          subtotal: 100000,
          total: 116000,
          descuento: 0,
          iva: 16000,
          status: 'draft' as const,
          fechaEmision: '2025-01-15T10:00:00Z',
        },
        items: [
          {
            cfdiInvoiceId: 1,
            claveProdServ: '01010101',
            cantidad: 1,
            claveUnidad: 'H87',
            unidad: 'Pieza',
            descripcion: 'Test Product',
            valorUnitario: 100000,
            importe: 100000,
            objetoImp: '02',
          },
        ],
      };

      // Act
      const result = await cfdiInvoicesService.createWithItems(data);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/cfdi-invoices',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'cfdi_invoices',
            relationships: expect.objectContaining({
              items: expect.any(Object),
            }),
          }),
        })
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('update', () => {
    it('should update CFDI invoice', async () => {
      // Arrange
      const mockInvoice = createMockCFDIInvoice();
      const mockResponse = { data: mockInvoice, included: [] };
      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      const formData = {
        series: 'A',
        tipoComprobante: 'I' as const,
        metodoPago: 'PUE' as const,
        formaPago: '01',
        moneda: 'MXN',
        tipoCambio: 1,
        companySettingId: 1,
        contactId: 1,
        receptorRfc: 'XAXX010101000',
        receptorNombre: 'Test Receptor',
        receptorUsoCfdi: 'G03',
        receptorRegimenFiscal: '601',
        receptorDomicilioFiscal: '12345',
        subtotal: 100000,
        total: 116000,
        descuento: 0,
        iva: 16000,
        status: 'draft' as const,
        fechaEmision: '2025-01-15T10:00:00Z',
      };

      // Act
      const result = await cfdiInvoicesService.update('1', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/cfdi-invoices/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('delete', () => {
    it('should delete CFDI invoice', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: null });

      // Act
      await cfdiInvoicesService.delete('1');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/cfdi-invoices/1');
    });
  });

  // ==========================================================================
  // CFDI WORKFLOW OPERATIONS
  // ==========================================================================

  describe('generateXML', () => {
    it('should generate XML for CFDI invoice', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          data: {
            id: '1',
            attributes: {
              xml_path: '/storage/cfdi/A-001.xml',
              status: 'generated',
            },
          },
        },
      });

      // Act
      const result = await cfdiInvoicesService.generateXML('1');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/cfdi-invoices/1/generate-xml');
      expect(result).toEqual({
        cfdiId: '1',
        xmlPath: '/storage/cfdi/A-001.xml',
        status: 'generated',
      });
    });
  });

  describe('generatePDF', () => {
    it('should generate PDF for CFDI invoice', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          data: {
            id: '1',
            attributes: {
              pdf_path: '/storage/cfdi/A-001.pdf',
              status: 'generated',
            },
          },
        },
      });

      // Act
      const result = await cfdiInvoicesService.generatePDF('1');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/cfdi-invoices/1/generate-pdf');
      expect(result).toEqual({
        cfdiId: '1',
        pdfPath: '/storage/cfdi/A-001.pdf',
        status: 'generated',
      });
    });
  });

  describe('stamp', () => {
    it('should stamp CFDI invoice with PAC', async () => {
      // Arrange
      const mockResponse = createMockStampResponse();
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          data: {
            id: '1',
            attributes: {
              uuid: mockResponse.uuid,
              fecha_timbrado: mockResponse.fechaTimbrado,
              status: 'valid',
            },
          },
        },
      });

      // Act
      const result = await cfdiInvoicesService.stamp('1');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/cfdi-invoices/1/stamp');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancel', () => {
    it('should cancel CFDI invoice', async () => {
      // Arrange
      const mockResponse = createMockCancelResponse();
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          data: {
            id: '1',
            attributes: {
              status: 'cancelled',
              fecha_cancelacion: mockResponse.fechaCancelacion,
            },
          },
        },
      });

      const cancelRequest = {
        motivo: '01',
        uuidReemplazo: null,
      };

      // Act
      const result = await cfdiInvoicesService.cancel('1', cancelRequest);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/cfdi-invoices/1/cancel',
        expect.objectContaining({
          motivo: '01',
          uuid_reemplazo: null,
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // DOWNLOAD OPERATIONS
  // ==========================================================================

  describe('downloadXML', () => {
    it('should download XML file', async () => {
      // Arrange
      const mockBlob = new Blob(['<xml></xml>'], { type: 'application/xml' });
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBlob });

      // Act
      const result = await cfdiInvoicesService.downloadXML('1');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/cfdi-invoices/1/download-xml',
        expect.objectContaining({
          responseType: 'blob',
        })
      );
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('downloadPDF', () => {
    it('should download PDF file', async () => {
      // Arrange
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBlob });

      // Act
      const result = await cfdiInvoicesService.downloadPDF('1');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/cfdi-invoices/1/download-pdf',
        expect.objectContaining({
          responseType: 'blob',
        })
      );
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('sendEmail', () => {
    it('should send CFDI by email', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({ data: null });

      // Act
      await cfdiInvoicesService.sendEmail('1', 'test@example.com');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/cfdi-invoices/1/send-email',
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  describe('error handling', () => {
    it('should handle errors when fetching invoices', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(cfdiInvoicesService.getAll()).rejects.toThrow();
    });

    it('should handle errors when stamping', async () => {
      // Arrange
      const error = createMockAxiosError(400, 'PAC Error');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(cfdiInvoicesService.stamp('1')).rejects.toThrow();
    });
  });
});
