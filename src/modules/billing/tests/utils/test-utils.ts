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
  serie: 'A',
  folio: '001',
  fecha: '2025-01-15T10:00:00Z',
  tipoComprobante: 'I',
  metodoPago: 'PUE',
  formaPago: '01',
  moneda: 'MXN',
  tipoCambio: 1,
  subTotal: 1000,
  descuento: 0,
  total: 1160,
  status: 'draft',
  companySettingId: '1',
  contactId: '1',
  emisorRfc: 'XAXX010101000',
  emisorNombre: 'Test Emisor',
  receptorRfc: 'XAXX010101000',
  receptorNombre: 'Test Receptor',
  receptorUsoCFDI: 'G03',
  uuid: null,
  fechaTimbrado: null,
  noCertificadoSAT: null,
  selloSAT: null,
  cadenaOriginalSAT: null,
  xmlPath: null,
  pdfPath: null,
  fechaCancelacion: null,
  motivoCancelacion: null,
  uuidReemplazo: null,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  ...overrides,
})

/**
 * Create multiple mock CFDI Invoices
 */
export const createMockCFDIInvoices = (count: number): CFDIInvoice[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCFDIInvoice({ id: String(i + 1), folio: String(i + 1).padStart(3, '0') })
  )
}

/**
 * Create mock CFDI Item
 */
export const createMockCFDIItem = (overrides?: Partial<CFDIItem>): CFDIItem => ({
  id: '1',
  cfdiInvoiceId: '1',
  claveProdServ: '01010101',
  noIdentificacion: 'PROD001',
  cantidad: 1,
  claveUnidad: 'H87',
  unidad: 'Pieza',
  descripcion: 'Test Product',
  valorUnitario: 1000,
  importe: 1000,
  descuento: 0,
  objetoImp: '02',
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
  razonSocial: 'Test Company SA de CV',
  rfc: 'XAXX010101000',
  regimenFiscal: '601',
  codigoPostal: '12345',
  isActive: true,
  pacProvider: 'SW',
  pacUser: 'test@example.com',
  pacPassword: 'encrypted_password',
  pacUrl: 'https://services.test.sw.com.mx',
  pacToken: null,
  certificatePath: '/path/to/cert.cer',
  keyPath: '/path/to/key.key',
  certificateNumber: '30001000000400002434',
  certificateValidFrom: '2023-01-01T00:00:00Z',
  certificateValidTo: '2027-01-01T00:00:00Z',
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
      razonSocial: `Test Company ${i + 1} SA de CV`,
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
