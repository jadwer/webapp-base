/**
 * Billing Module - JSON:API Transformers
 *
 * Bidirectional transformers for CFDI entities
 * Handles snake_case (backend) <-> camelCase (frontend) conversion
 */

import type {
  CFDIInvoice,
  CFDIInvoiceFormData,
  CFDIItem,
  CFDIItemFormData,
  CompanySetting,
  CompanySettingFormData,
} from '../types'

// ============================================================================
// CFDI INVOICE TRANSFORMERS
// ============================================================================

/**
 * Transform JSON:API CFDIInvoice resource to frontend type
 */
export function transformJsonApiCFDIInvoice(
  resource: any,
  included?: any[]
): CFDIInvoice {
  const attributes = resource.attributes

  // Map included relationships
  const companySetting = included?.find(
    (inc) =>
      inc.type === 'company_settings' &&
      inc.id === resource.relationships?.companySetting?.data?.id
  )
  const contact = included?.find(
    (inc) =>
      inc.type === 'contacts' &&
      inc.id === resource.relationships?.contact?.data?.id
  )
  const arInvoice = included?.find(
    (inc) =>
      inc.type === 'ar_invoices' &&
      inc.id === resource.relationships?.arInvoice?.data?.id
  )
  const items = included?.filter(
    (inc) =>
      inc.type === 'cfdi_items' &&
      resource.relationships?.items?.data?.some((item: any) => item.id === inc.id)
  )

  return {
    id: resource.id,
    companySettingId: attributes.company_setting_id,
    contactId: attributes.contact_id,
    arInvoiceId: attributes.ar_invoice_id || undefined,
    series: attributes.series || '',
    folio: attributes.folio || 0,
    uuid: attributes.uuid || undefined,
    tipoComprobante: attributes.tipo_comprobante || 'I',
    receptorRfc: attributes.receptor_rfc || '',
    receptorNombre: attributes.receptor_nombre || '',
    receptorUsoCfdi: attributes.receptor_uso_cfdi || '',
    receptorRegimenFiscal: attributes.receptor_regimen_fiscal || '',
    receptorDomicilioFiscal: attributes.receptor_domicilio_fiscal || '',
    subtotal: attributes.subtotal || 0,
    total: attributes.total || 0,
    descuento: attributes.descuento || 0,
    iva: attributes.iva || 0,
    ieps: attributes.ieps || 0,
    isrRetenido: attributes.isr_retenido || 0,
    ivaRetenido: attributes.iva_retenido || 0,
    moneda: attributes.moneda || 'MXN',
    tipoCambio: attributes.tipo_cambio || 1,
    formaPago: attributes.forma_pago || '01',
    metodoPago: attributes.metodo_pago || 'PUE',
    condicionesPago: attributes.condiciones_pago || undefined,
    cfdiRelacionadoTipo: attributes.cfdi_relacionado_tipo || undefined,
    cfdiRelacionadoUuids: attributes.cfdi_relacionado_uuids || undefined,
    status: attributes.status || 'draft',
    fechaEmision: attributes.fecha_emision || '',
    fechaTimbrado: attributes.fecha_timbrado || undefined,
    fechaCancelacion: attributes.fecha_cancelacion || undefined,
    xmlPath: attributes.xml_path || undefined,
    pdfPath: attributes.pdf_path || undefined,
    errorMessage: attributes.error_message || undefined,
    metadata: attributes.metadata || undefined,
    createdAt: attributes.created_at || '',
    updatedAt: attributes.updated_at || '',
    // Included relationships
    companySetting: companySetting
      ? transformJsonApiCompanySetting(companySetting)
      : undefined,
    contact: contact ? contact.attributes : undefined,
    arInvoice: arInvoice ? arInvoice.attributes : undefined,
    items: items?.map((item) => transformJsonApiCFDIItem(item)) || undefined,
  }
}

/**
 * Transform CFDIInvoiceFormData to JSON:API format
 */
export function transformCFDIInvoiceFormToJsonApi(
  data: CFDIInvoiceFormData
): any {
  return {
    type: 'cfdi_invoices',
    attributes: {
      company_setting_id: data.companySettingId,
      contact_id: data.contactId,
      ar_invoice_id: data.arInvoiceId || null,
      series: data.series,
      tipo_comprobante: data.tipoComprobante,
      receptor_rfc: data.receptorRfc,
      receptor_nombre: data.receptorNombre,
      receptor_uso_cfdi: data.receptorUsoCfdi,
      receptor_regimen_fiscal: data.receptorRegimenFiscal,
      receptor_domicilio_fiscal: data.receptorDomicilioFiscal,
      subtotal: data.subtotal,
      total: data.total,
      descuento: data.descuento,
      iva: data.iva,
      ieps: data.ieps || null,
      isr_retenido: data.isrRetenido || null,
      iva_retenido: data.ivaRetenido || null,
      moneda: data.moneda,
      tipo_cambio: data.tipoCambio,
      forma_pago: data.formaPago,
      metodo_pago: data.metodoPago,
      condiciones_pago: data.condicionesPago || null,
      cfdi_relacionado_tipo: data.cfdiRelacionadoTipo || null,
      cfdi_relacionado_uuids: data.cfdiRelacionadoUuids || null,
      status: data.status,
      fecha_emision: data.fechaEmision,
    },
  }
}

/**
 * Transform JSON:API CFDIInvoices collection response
 */
export function transformCFDIInvoicesResponse(apiResponse: any): {
  data: CFDIInvoice[]
  meta?: any
  links?: any
} {
  const included = apiResponse.included || []

  return {
    data: apiResponse.data.map((resource: any) =>
      transformJsonApiCFDIInvoice(resource, included)
    ),
    meta: apiResponse.meta,
    links: apiResponse.links,
  }
}

// ============================================================================
// CFDI ITEM TRANSFORMERS
// ============================================================================

/**
 * Transform JSON:API CFDIItem resource to frontend type
 */
export function transformJsonApiCFDIItem(
  resource: any,
  included?: any[]
): CFDIItem {
  const attributes = resource.attributes

  // Map included relationship
  const cfdiInvoice = included?.find(
    (inc) =>
      inc.type === 'cfdi_invoices' &&
      inc.id === resource.relationships?.cfdiInvoice?.data?.id
  )

  return {
    id: resource.id,
    cfdiInvoiceId: attributes.cfdi_invoice_id,
    claveProdServ: attributes.clave_prod_serv || '',
    noIdentificacion: attributes.no_identificacion || undefined,
    cantidad: attributes.cantidad || 0,
    claveUnidad: attributes.clave_unidad || '',
    unidad: attributes.unidad || '',
    descripcion: attributes.descripcion || '',
    valorUnitario: attributes.valor_unitario || 0,
    importe: attributes.importe || 0,
    descuento: attributes.descuento || 0,
    objetoImp: attributes.objeto_imp || '02',
    trasladoImpuesto: attributes.traslado_impuesto || undefined,
    trasladoTipoFactor: attributes.traslado_tipo_factor || undefined,
    trasladoTasaOCuota: attributes.traslado_tasa_o_cuota || undefined,
    trasladoImporte: attributes.traslado_importe || undefined,
    retencionImpuesto: attributes.retencion_impuesto || undefined,
    retencionTipoFactor: attributes.retencion_tipo_factor || undefined,
    retencionTasaOCuota: attributes.retencion_tasa_o_cuota || undefined,
    retencionImporte: attributes.retencion_importe || undefined,
    metadata: attributes.metadata || undefined,
    createdAt: attributes.created_at || '',
    updatedAt: attributes.updated_at || '',
    // Included relationships
    cfdiInvoice: cfdiInvoice
      ? transformJsonApiCFDIInvoice(cfdiInvoice)
      : undefined,
  }
}

/**
 * Transform CFDIItemFormData to JSON:API format
 */
export function transformCFDIItemFormToJsonApi(data: CFDIItemFormData): any {
  return {
    type: 'cfdi_items',
    attributes: {
      cfdi_invoice_id: data.cfdiInvoiceId,
      clave_prod_serv: data.claveProdServ,
      no_identificacion: data.noIdentificacion || null,
      cantidad: data.cantidad,
      clave_unidad: data.claveUnidad,
      unidad: data.unidad,
      descripcion: data.descripcion,
      valor_unitario: data.valorUnitario,
      importe: data.importe,
      descuento: data.descuento || 0,
      objeto_imp: data.objetoImp,
      traslado_impuesto: data.trasladoImpuesto || null,
      traslado_tipo_factor: data.trasladoTipoFactor || null,
      traslado_tasa_o_cuota: data.trasladoTasaOCuota || null,
      traslado_importe: data.trasladoImporte || null,
      retencion_impuesto: data.retencionImpuesto || null,
      retencion_tipo_factor: data.retencionTipoFactor || null,
      retencion_tasa_o_cuota: data.retencionTasaOCuota || null,
      retencion_importe: data.retencionImporte || null,
    },
  }
}

/**
 * Transform JSON:API CFDIItems collection response
 */
export function transformCFDIItemsResponse(apiResponse: any): {
  data: CFDIItem[]
  meta?: any
  links?: any
} {
  const included = apiResponse.included || []

  return {
    data: apiResponse.data.map((resource: any) =>
      transformJsonApiCFDIItem(resource, included)
    ),
    meta: apiResponse.meta,
    links: apiResponse.links,
  }
}

// ============================================================================
// COMPANY SETTING TRANSFORMERS
// ============================================================================

/**
 * Transform JSON:API CompanySetting resource to frontend type
 */
export function transformJsonApiCompanySetting(resource: any): CompanySetting {
  const attributes = resource.attributes

  return {
    id: resource.id,
    companyName: attributes.company_name || '',
    rfc: attributes.rfc || '',
    taxRegime: attributes.tax_regime || '',
    postalCode: attributes.postal_code || '',
    invoiceSeries: attributes.invoice_series || '',
    creditNoteSeries: attributes.credit_note_series || '',
    nextInvoiceFolio: attributes.next_invoice_folio || 1,
    nextCreditNoteFolio: attributes.next_credit_note_folio || 1,
    pacProvider: attributes.pac_provider || 'sw',
    pacUsername: attributes.pac_username || '',
    pacProductionMode: attributes.pac_production_mode || false,
    certificateFile: attributes.certificate_file || '',
    keyFile: attributes.key_file || '',
    logoPath: attributes.logo_path || undefined,
    additionalSettings: attributes.additional_settings || undefined,
    isActive: attributes.is_active || true,
    createdAt: attributes.created_at || '',
    updatedAt: attributes.updated_at || '',
  }
}

/**
 * Transform CompanySettingFormData to JSON:API format
 */
export function transformCompanySettingFormToJsonApi(
  data: CompanySettingFormData
): any {
  return {
    type: 'company_settings',
    attributes: {
      company_name: data.companyName,
      rfc: data.rfc,
      tax_regime: data.taxRegime,
      postal_code: data.postalCode,
      invoice_series: data.invoiceSeries,
      credit_note_series: data.creditNoteSeries,
      next_invoice_folio: data.nextInvoiceFolio,
      next_credit_note_folio: data.nextCreditNoteFolio,
      pac_provider: data.pacProvider,
      pac_username: data.pacUsername,
      pac_password: data.pacPassword || null,
      pac_production_mode: data.pacProductionMode,
      certificate_file: data.certificateFile,
      key_file: data.keyFile,
      key_password: data.keyPassword || null,
      logo_path: data.logoPath || null,
      additional_settings: data.additionalSettings || null,
      is_active: data.isActive,
    },
  }
}

/**
 * Transform JSON:API CompanySettings collection response
 */
export function transformCompanySettingsResponse(apiResponse: any): {
  data: CompanySetting[]
  meta?: any
  links?: any
} {
  return {
    data: apiResponse.data.map((resource: any) =>
      transformJsonApiCompanySetting(resource)
    ),
    meta: apiResponse.meta,
    links: apiResponse.links,
  }
}
