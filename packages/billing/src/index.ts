/**
 * Billing Module - Central Exports
 *
 * Mexican CFDI Electronic Invoicing (SAT compliance)
 * Complete workflow: Draft → Generate XML → Generate PDF → Stamp → Download/Cancel
 * Integrations: Stripe (payments) + SW/Smarter Web (PAC)
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Main entities
  CFDIInvoice,
  CFDIInvoiceFormData,
  CFDIItem,
  CFDIItemFormData,
  CompanySetting,
  CompanySettingFormData,
  // Type unions
  TipoComprobante,
  CFDIStatus,
  MetodoPago,
  // Filter types
  CFDIInvoicesFilters,
  CFDIItemsFilters,
  // Workflow types
  CFDIStampResponse,
  CFDICancelRequest,
  CFDICancelResponse,
  CFDIGenerateResponse,
  CFDIDownloadInfo,
  CreateCFDIInvoiceData,
  // Payment complement (REP)
  PaymentComplementResponse,
} from './types'

// ============================================================================
// SERVICES
// ============================================================================

export {
  cfdiInvoicesService,
  cfdiItemsService,
  companySettingsService,
} from './services'

// ============================================================================
// HOOKS
// ============================================================================

export {
  // CFDI Invoices hooks
  useCFDIInvoices,
  useCFDIInvoice,
  useCFDIInvoicesMutations,
  // CFDI Items hooks
  useCFDIItems,
  useCFDIItem,
  useCFDIItemsMutations,
  // Company Settings hooks
  useCompanySettings,
  useCompanySetting,
  useActiveCompanySetting,
  useCompanySettingsMutations,
  // Workflow hooks
  useCFDIWorkflow,
  // SalesOrder billing hooks (prefactura / facturar)
  useSalesOrderBillingMutations,
  // Payment complement (REP) hooks
  usePaymentComplements,
} from './hooks'

// ============================================================================
// TRANSFORMERS
// ============================================================================

export {
  // CFDI Invoice transformers
  transformJsonApiCFDIInvoice,
  transformCFDIInvoiceFormToJsonApi,
  transformCFDIInvoicesResponse,
  // CFDI Item transformers
  transformJsonApiCFDIItem,
  transformCFDIItemFormToJsonApi,
  transformCFDIItemsResponse,
  // Company Setting transformers
  transformJsonApiCompanySetting,
  transformCompanySettingFormToJsonApi,
  transformCompanySettingsResponse,
} from './utils/transformers'

// ============================================================================
// COMPONENTS
// ============================================================================

export { CFDIInvoicesAdminPage } from './components/CFDIInvoicesAdminPage'
export { BillingIndexPage } from './components/BillingIndexPage'
export { default as CFDIInvoiceForm } from './components/CFDIInvoiceForm'
export { default as CFDIInvoicesTable } from './components/CFDIInvoicesTable'
export { PaymentComplementsSection } from './components/PaymentComplementsSection'

// ============================================================================
// INVOICE SERIES (pantalla de folios/series; antes deep-import de las pages)
// ============================================================================

export {
  invoiceSeriesService,
  CFDI_TYPE_LABELS,
  SOURCE_TYPE_LABELS,
  type InvoiceSeries,
  type CreateInvoiceSeriesRequest,
  type UpdateInvoiceSeriesRequest,
} from './services/invoiceSeriesService'

// ============================================================================
// DOCUMENT LEGENDS (leyendas por documento)
// ============================================================================

export {
  documentLegendsService,
  LEGEND_DOCUMENT_TYPE_LABELS,
  type LegendDocumentType,
  type DocumentLegend,
  type DocumentLegendPlaceholder,
} from './services/documentLegendsService'
