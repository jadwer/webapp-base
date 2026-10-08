/**
 * Billing Module - CFDI Invoices Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../../lib/axiosClient';
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
vi.mock('../../lib/axiosClient');

// Mock transformers
vi.mock('../../utils/transformers', () => ({
  transformCFDIInvoicesResponse: vi.fn((data) => data),
  transformJsonApiCFDIInvoice: vi.fn((data) => data),
  transformCFDIInvoiceFormToJsonApi: vi.fn((data) => ({ type: 'cfdi-invoices', attributes: data })),
  transformCFDIItemFormToJsonApi: vi.fn((data) => ({ type: 'cfdi-items', attributes: data })),
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
        'cfdi-invoices'
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
        'cfdi-invoices'
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
        '/api/v1/cfdi-invoices/1?include=companySetting,contact,items'
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
        '/api/v1/cfdi-invoices',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'cfdi-invoices',
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

      // Assert: primero la factura (sin conceptos anidados), luego cada cfdi-item
      expect(axiosClient.post).toHaveBeenNthCalledWith(
        1,
        '/api/v1/cfdi-invoices',
        { data: expect.objectContaining({ type: 'cfdi-invoices' }) }
      );
      const invoicePayload = vi.mocked(axiosClient.post).mock.calls[0][1] as { data: Record<string, unknown> };
      expect(invoicePayload.data.relationships).toBeUndefined();
      expect(axiosClient.post).toHaveBeenNthCalledWith(
        2,
        '/api/v1/cfdi-items',
        {
          data: {
            type: 'cfdi-items',
            attributes: expect.objectContaining({ cfdiInvoiceId: 1, numeroLinea: 1 }),
          },
        }
      );
      expect(axiosClient.post).toHaveBeenCalledTimes(2);
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
        '/api/v1/cfdi-invoices/1',
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
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1');
    });
  });

  // ==========================================================================
  // CFDI WORKFLOW OPERATIONS
  // ==========================================================================

  describe('generateXML', () => {
    it('lee la respuesta real de generate-xml ({ message, xml, invoice_id })', async () => {
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: { message: 'XML CFDI generado correctamente', xml: '<cfdi/>', invoice_id: 1 },
      });

      const result = await cfdiInvoicesService.generateXML('1');

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1/generate-xml');
      expect(result).toEqual({ cfdiId: '1', message: 'XML CFDI generado correctamente' });
    });
  });

  describe('generatePDF', () => {
    it('lee la respuesta real de generate-pdf ({ message, pdf_path, pdf_url, invoice_id })', async () => {
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          message: 'PDF CFDI generado correctamente',
          pdf_path: 'cfdi/A-001.pdf',
          pdf_url: 'https://api.test/storage/cfdi/A-001.pdf',
          invoice_id: 1,
        },
      });

      const result = await cfdiInvoicesService.generatePDF('1');

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1/generate-pdf');
      expect(result).toEqual({
        cfdiId: '1',
        message: 'PDF CFDI generado correctamente',
        pdfPath: 'cfdi/A-001.pdf',
        pdfUrl: 'https://api.test/storage/cfdi/A-001.pdf',
      });
    });
  });

  describe('stamp', () => {
    it('lee data plano de stamp (sin attributes)', async () => {
      const mockResponse = createMockStampResponse();
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          message: 'CFDI timbrado correctamente',
          data: {
            id: 1,
            uuid: mockResponse.uuid,
            fecha_timbrado: mockResponse.fechaTimbrado,
            status: 'valid',
            folio_completo: 'A-1',
          },
        },
      });

      const result = await cfdiInvoicesService.stamp('1');

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1/stamp');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancel', () => {
    it('manda motivo_cancelacion / uuid_sustitucion y lee data plano', async () => {
      const mockResponse = createMockCancelResponse();
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          message: 'CFDI cancelado correctamente',
          data: {
            id: 1,
            uuid: 'ABCD',
            status: 'cancelled',
            fecha_cancelacion: mockResponse.fechaCancelacion,
            motivo: '02',
          },
        },
      });

      const result = await cfdiInvoicesService.cancel('1', { motivo: '02', uuidReemplazo: undefined });

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1/cancel', {
        motivo_cancelacion: '02',
        uuid_sustitucion: null,
      });
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
        '/api/v1/cfdi-invoices/1/download-xml',
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
        '/api/v1/cfdi-invoices/1/download-pdf',
        expect.objectContaining({
          responseType: 'blob',
        })
      );
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('sendEmail', () => {
    it('should send email for CFDI invoice', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: { message: 'Email sent successfully' },
      });

      // Act
      const result = await cfdiInvoicesService.sendEmail('1', 'test@example.com');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/cfdi-invoices/1/send-email',
        expect.objectContaining({
          email: 'test@example.com',
          include_xml: true,
        })
      );
      expect(result).toEqual({ message: 'Email sent successfully' });
    });
  });

  // ==========================================================================
  // SAT VALIDATION / CANCELLATION STATUS
  // ==========================================================================

  describe('validateSAT', () => {
    it('desenvuelve data y traduce estado del PAC', async () => {
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: {
          message: 'Validación completada',
          data: {
            status: 'S - Comprobante obtenido satisfactoriamente.',
            es_cancelable: 'Cancelable sin aceptación',
            estado: 'Vigente',
            validacion_efos: '200',
          },
        },
      });

      const result = await cfdiInvoicesService.validateSAT('1');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1/validate-sat');
      expect(result).toEqual({
        valid: true,
        uuid: '',
        status: 'Vigente',
        fechaEmision: '',
        rfcEmisor: '',
        rfcReceptor: '',
      });
    });

    it('estado Cancelado no es valido', async () => {
      vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: { estado: 'Cancelado' } } });

      const result = await cfdiInvoicesService.validateSAT('1');

      expect(result.valid).toBe(false);
      expect(result.status).toBe('Cancelado');
    });
  });

  describe('getCancellationStatus', () => {
    it('desenvuelve data', async () => {
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: { message: 'Estatus de cancelación obtenido', data: { status: 'cancellation_pending' } },
      });

      const result = await cfdiInvoicesService.getCancellationStatus('1');

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1/cancellation-status');
      expect(result).toEqual({ status: 'cancellation_pending', fechaCancelacion: undefined, acuse: undefined });
    });
  });

  // ==========================================================================
  // PREFACTURA
  // ==========================================================================

  describe('prefactura', () => {
    it('should fetch prefactura data', async () => {
      // Arrange
      const mockResult = { data: { total: 116000 } };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResult });

      // Act
      const result = await cfdiInvoicesService.prefactura('1');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/cfdi-invoices/1/prefactura');
      expect(result).toEqual(mockResult);
    });
  });

  describe('prefacturaDownload', () => {
    it('should download prefactura PDF as blob', async () => {
      // Arrange
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockBlob });

      // Act
      const result = await cfdiInvoicesService.prefacturaDownload('1');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/api/v1/cfdi-invoices/1/prefactura/download',
        expect.objectContaining({ responseType: 'blob' })
      );
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('prefacturaPreview', () => {
    it('should return the prefactura preview URL without making a request', () => {
      // Act
      const url = cfdiInvoicesService.prefacturaPreview('1');

      // Assert
      expect(url).toBe('/api/v1/cfdi-invoices/1/prefactura/preview');
      expect(axiosClient.get).not.toHaveBeenCalled();
    });
  });

  describe('prefacturaFromOrder', () => {
    it('should request prefactura PDF from a sales order', async () => {
      // Arrange
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockBlob });

      // Act
      const result = await cfdiInvoicesService.prefacturaFromOrder('5');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/sales-orders/5/prefactura',
        {},
        expect.objectContaining({ responseType: 'blob' })
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it('should forward optional receptor overrides', async () => {
      // Arrange
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockBlob });

      // Act
      await cfdiInvoicesService.prefacturaFromOrder('5', {
        receptorRfc: 'XAXX010101000',
        metodoPago: 'PPD',
        formaPago: '99',
      });

      // Assert: el endpoint valida llaves snake_case
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/sales-orders/5/prefactura',
        { receptor_rfc: 'XAXX010101000', metodo_pago: 'PPD', forma_pago: '99' },
        expect.objectContaining({ responseType: 'blob' })
      );
    });
  });

  describe('createFromOrder', () => {
    it('should create CFDI invoice from a sales order', async () => {
      // Arrange
      const mockResponse = { data: { id: '10', type: 'cfdi-invoices', attributes: { series: 'A', folio: 1 } } };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await cfdiInvoicesService.createFromOrder('5');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/sales-orders/5/facturar');
      expect(result).toEqual(mockResponse);
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
