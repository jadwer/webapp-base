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
