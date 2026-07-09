/**
 * Billing Module - Test Utilities
 *
 * Mock factories for CFDI entities, items, and company settings
 */

import type {
  CFDIInvoice,
  CFDIItem,
  CompanySetting,
  CFDIStampResponse,
  CFDICancelResponse,
  CFDIGenerateResponse,
} from '../../types'

// ============================================================================
// MOCK FACTORIES
// ============================================================================

/**
 * Create mock CFDI Invoice
 */
export const createMockCFDIInvoice = (
  overrides?: Partial<CFDIInvoice>
): CFDIInvoice => ({
  id: '1',
  series: 'A',
  folio: 1,
  tipoComprobante: 'I',
  receptorRfc: 'XAXX010101000',
  receptorNombre: 'Test Receptor',
  receptorUsoCfdi: 'G03',
  receptorRegimenFiscal: '601',
  receptorDomicilioFiscal: '12345',
  subtotal: 1000,
  total: 1160,
  descuento: 0,
  iva: 160,
  ieps: 0,
  isrRetenido: 0,
  ivaRetenido: 0,
  moneda: 'MXN',
  tipoCambio: 1,
  formaPago: '01',
  metodoPago: 'PUE',
  status: 'draft',
  companySettingId: 1,
  contactId: 1,
  fechaEmision: '2025-01-15T10:00:00Z',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  ...overrides,
})

/**
 * Create multiple mock CFDI Invoices
 */
export const createMockCFDIInvoices = (count: number): CFDIInvoice[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCFDIInvoice({ id: String(i + 1), folio: i + 1 })
  )
}

/**
 * Create mock CFDI Item
 */
export const createMockCFDIItem = (overrides?: Partial<CFDIItem>): CFDIItem => ({
  id: '1',
  cfdiInvoiceId: 1,
  productId: null,
  numeroLinea: 1,
  claveProdServ: '01010101',
  noIdentificacion: 'PROD001',
  cantidad: 1,
  claveUnidad: 'H87',
  unidad: 'Pieza',
  descripcion: 'Test Product',
  valorUnitario: 1000,
  importe: 1000,
  descuento: 0,
  impuestos: {},
  objetoImp: '02',
  numeroPedimento: null,
  cuentaPredial: null,
  informacionAduanera: null,
  metadata: null,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  ...overrides,
})

/**
 * Create multiple mock CFDI Items
 */
export const createMockCFDIItems = (count: number): CFDIItem[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCFDIItem({
      id: String(i + 1),
      noIdentificacion: `PROD${String(i + 1).padStart(3, '0')}`,
    })
  )
}

/**
 * Create mock Company Setting
 */
export const createMockCompanySetting = (
  overrides?: Partial<CompanySetting>
): CompanySetting => ({
  id: '1',
  companyName: 'Test Company SA de CV',
  rfc: 'XAXX010101000',
  taxRegime: '601',
  postalCode: '12345',
  invoiceSeries: 'A',
  creditNoteSeries: 'NC',
  nextInvoiceFolio: 1,
  nextCreditNoteFolio: 1,
  pacProvider: 'SW',
  pacUsername: 'test@example.com',
  pacProductionMode: false,
  certificateFile: '/path/to/cert.cer',
  keyFile: '/path/to/key.key',
  isActive: true,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  ...overrides,
})

/**
 * Create multiple mock Company Settings
 */
export const createMockCompanySettings = (count: number): CompanySetting[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCompanySetting({
      id: String(i + 1),
      companyName: `Test Company ${i + 1} SA de CV`,
      isActive: i === 0,
    })
  )
}

/**
 * Create mock CFDI Stamp Response
 */
export const createMockStampResponse = (
  overrides?: Partial<CFDIStampResponse>
): CFDIStampResponse => ({
  cfdiId: '1',
  uuid: '12345678-1234-1234-1234-123456789012',
  fechaTimbrado: '2025-01-15T10:30:00Z',
  status: 'valid',
  ...overrides,
})

/**
 * Create mock CFDI Cancel Response
 */
export const createMockCancelResponse = (
  overrides?: Partial<CFDICancelResponse>
): CFDICancelResponse => ({
  cfdiId: '1',
  status: 'cancelled',
  fechaCancelacion: '2025-01-15T11:00:00Z',
  ...overrides,
})

/**
 * Create mock CFDI Generate Response
 */
export const createMockGenerateResponse = (
  overrides?: Partial<CFDIGenerateResponse>
): CFDIGenerateResponse => ({
  cfdiId: '1',
  xmlPath: '/storage/cfdi/A-001.xml',
  pdfPath: '/storage/cfdi/A-001.pdf',
  status: 'generated',
  ...overrides,
})

// ============================================================================
// JSON:API RESPONSE HELPERS
// ============================================================================

/**
 * Create mock JSON:API single resource response
 */
export const createMockAPIResponse = (
  id: string,
  type: string,
  attributes: Record<string, unknown>
) => ({
  data: {
    id,
    type,
    attributes,
  },
})

/**
 * Create mock JSON:API collection response
 */
export const createMockAPICollectionResponse = (
  items: Array<{ id: string; attributes: Record<string, unknown> }>,
  type: string
) => ({
  data: items.map((item) => ({
    id: item.id,
    type,
    attributes: item.attributes,
  })),
  meta: {
    total: items.length,
    page: 1,
    perPage: 20,
  },
})

/**
 * Create mock Axios error
 */
export const createMockAxiosError = (status: number, message: string) => {
  const error = new Error(message) as Error & {
    response?: { status: number; data: { message: string } }
    isAxiosError: boolean
  }
  error.response = {
    status,
    data: { message },
  }
  error.isAxiosError = true
  return error
}
