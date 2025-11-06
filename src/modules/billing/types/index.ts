/**
 * Billing Module - TypeScript Types
 *
 * Mexican CFDI Electronic Invoicing (SAT compliance)
 * Entities: CFDIInvoice, CFDIItem, CompanySetting
 * Backend: Laravel JSON:API with PAC integration (SW - Smarter Web)
 */

// ============================================================================
// CFDI INVOICE
// ============================================================================

export type TipoComprobante = 'I' | 'E' | 'T' | 'N' | 'P' // Ingreso, Egreso, Traslado, Nomina, Pago
export type CFDIStatus = 'draft' | 'generated' | 'stamped' | 'valid' | 'cancelled' | 'error'
export type MetodoPago = 'PUE' | 'PPD' // Pago en Una Exhibicion, Pago en Parcialidades o Diferido

export interface CFDIInvoice {
  id: string

  // Foreign keys
  companySettingId: number
  contactId: number
  arInvoiceId?: number

  // CFDI Identification
  series: string
  folio: number
  uuid?: string // Assigned after stamping
  tipoComprobante: TipoComprobante

  // Customer (Receptor) Information
  receptorRfc: string
  receptorNombre: string
  receptorUsoCfdi: string // G01, G02, G03, etc.
  receptorRegimenFiscal: string
  receptorDomicilioFiscal: string

  // Amounts (stored in cents)
  subtotal: number
  total: number
  descuento: number
  iva: number
  ieps: number
  isrRetenido: number
  ivaRetenido: number

  // Currency
  moneda: string // MXN, USD, EUR, etc.
  tipoCambio: number

  // Payment Information
  formaPago: string // 01, 02, 03, etc. (SAT catalog)
  metodoPago: MetodoPago
  condicionesPago?: string

  // Related CFDI
  cfdiRelacionadoTipo?: string // 01, 02, 03, etc.
  cfdiRelacionadoUuids?: string[]

  // Status
  status: CFDIStatus

  // Dates
  fechaEmision: string
  fechaTimbrado?: string
  fechaCancelacion?: string

  // Files
  xmlPath?: string
  pdfPath?: string

  // Error handling
  errorMessage?: string

  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string

  // Included relationships
  companySetting?: CompanySetting
  contact?: Record<string, unknown>
  arInvoice?: Record<string, unknown>
  items?: CFDIItem[]
}

export interface CFDIInvoiceFormData {
  companySettingId: number
  contactId: number
  arInvoiceId?: number

  series: string
  tipoComprobante: TipoComprobante

  receptorRfc: string
  receptorNombre: string
  receptorUsoCfdi: string
  receptorRegimenFiscal: string
  receptorDomicilioFiscal: string

  subtotal: number
  total: number
  descuento: number
  iva: number
  ieps?: number
  isrRetenido?: number
  ivaRetenido?: number

  moneda: string
  tipoCambio: number

  formaPago: string
  metodoPago: MetodoPago
  condicionesPago?: string

  cfdiRelacionadoTipo?: string
  cfdiRelacionadoUuids?: string[]

  status: CFDIStatus
  fechaEmision: string
}

// ============================================================================
// CFDI ITEM
// ============================================================================

export interface CFDIItem {
  id: string
  cfdiInvoiceId: number

  // SAT Catalogs
  claveProdServ: string // SAT product/service code
  noIdentificacion?: string // SKU or internal code
  cantidad: number
  claveUnidad: string // SAT unit code
  unidad: string // Unit description
  descripcion: string
  valorUnitario: number // In cents
  importe: number // In cents
  descuento: number // In cents

  // Taxes
  objetoImp: string // 01, 02, 03, etc.
  trasladoImpuesto?: string // 002 = IVA
  trasladoTipoFactor?: string // Tasa, Cuota, Exento
  trasladoTasaOCuota?: string // 0.160000 for 16% IVA
  trasladoImporte?: number // In cents
  retencionImpuesto?: string
  retencionTipoFactor?: string
  retencionTasaOCuota?: string
  retencionImporte?: number // In cents

  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string

  // Included relationships
  cfdiInvoice?: CFDIInvoice
}

export interface CFDIItemFormData {
  cfdiInvoiceId: number
  claveProdServ: string
  noIdentificacion?: string
  cantidad: number
  claveUnidad: string
  unidad: string
  descripcion: string
  valorUnitario: number
  importe: number
  descuento?: number
  objetoImp: string
  trasladoImpuesto?: string
  trasladoTipoFactor?: string
  trasladoTasaOCuota?: string
  trasladoImporte?: number
  retencionImpuesto?: string
  retencionTipoFactor?: string
  retencionTasaOCuota?: string
  retencionImporte?: number
}

// ============================================================================
// COMPANY SETTING
// ============================================================================

export interface CompanySetting {
  id: string

  // Company Fiscal Information
  companyName: string
  rfc: string
  taxRegime: string // e.g., "601", "612"
  postalCode: string

  // Invoice Series & Folios
  invoiceSeries: string
  creditNoteSeries: string
  nextInvoiceFolio: number
  nextCreditNoteFolio: number

  // PAC Configuration
  pacProvider: string // "finkok", "sw", etc.
  pacUsername: string
  // pacPassword is encrypted, never exposed
  pacProductionMode: boolean

  // Digital Certificate (CSD)
  certificateFile: string // .cer file path
  keyFile: string // .key file path
  // keyPassword is encrypted, never exposed

  // Additional Settings
  logoPath?: string
  additionalSettings?: Record<string, unknown>

  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CompanySettingFormData {
  companyName: string
  rfc: string
  taxRegime: string
  postalCode: string
  invoiceSeries: string
  creditNoteSeries: string
  nextInvoiceFolio: number
  nextCreditNoteFolio: number
  pacProvider: string
  pacUsername: string
  pacPassword?: string // Only for create/update
  pacProductionMode: boolean
  certificateFile: string
  keyFile: string
  keyPassword?: string // Only for create/update
  logoPath?: string
  additionalSettings?: Record<string, unknown>
  isActive: boolean
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface CFDIInvoicesFilters {
  search?: string
  status?: CFDIStatus
  tipoComprobante?: TipoComprobante
  receptorRfc?: string
  dateFrom?: string
  dateTo?: string
}

export interface CFDIItemsFilters {
  cfdiInvoiceId?: number
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface CFDIStampResponse {
  cfdiId: string
  uuid: string
  fechaTimbrado: string
  status: CFDIStatus
}

export interface CFDICancelRequest {
  motivo: string // "01", "02", "03", "04"
  uuidReemplazo?: string // Required for motivo "01"
}

export interface CFDICancelResponse {
  cfdiId: string
  status: CFDIStatus
  fechaCancelacion: string
}

export interface CFDIGenerateResponse {
  cfdiId: string
  xmlPath?: string
  pdfPath?: string
  status: CFDIStatus
}

export interface CFDIDownloadInfo {
  xmlPath?: string
  pdfPath?: string
  uuid?: string
}

// ============================================================================
// COMPLETE INVOICE DATA
// ============================================================================

export interface CreateCFDIInvoiceData {
  invoice: CFDIInvoiceFormData
  items: CFDIItemFormData[]
}
