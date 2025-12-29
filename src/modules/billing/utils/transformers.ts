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
  resource: Record<string, unknown>,
  included?: Record<string, unknown>[]
): CFDIInvoice {
  const attributes = resource.attributes as Record<string, unknown>

  // Map included relationships
  const relationships = resource.relationships as Record<string, { data?: { id: unknown } | Array<{ id: unknown }> }> | undefined

  const companySetting = included?.find(
    (inc) =>
      inc.type === 'company_settings' &&
      inc.id === (relationships?.companySetting?.data as { id: unknown } | undefined)?.id
  )
  const contact = included?.find(
    (inc) =>
      inc.type === 'contacts' &&
      inc.id === (relationships?.contact?.data as { id: unknown } | undefined)?.id
  )
  const arInvoice = included?.find(
    (inc) =>
      inc.type === 'ar_invoices' &&
      inc.id === (relationships?.arInvoice?.data as { id: unknown } | undefined)?.id
  )
  const items = included?.filter(
    (inc) =>
      inc.type === 'cfdi_items' &&
      (relationships?.items?.data as Array<{ id: unknown }> | undefined)?.some((item) => item.id === inc.id)
  )

  return {
    id: String(resource.id),
    companySettingId: attributes.company_setting_id as number,
    contactId: attributes.contact_id as number,
    arInvoiceId: (attributes.ar_invoice_id as number | undefined) || undefined,
    series: String(attributes.series || ''),
    folio: attributes.folio as number,
    uuid: (attributes.uuid as string | undefined) || undefined,
    tipoComprobante: (attributes.tipo_comprobante as CFDIInvoice['tipoComprobante']) || 'I',
    receptorRfc: String(attributes.receptor_rfc || ''),
    receptorNombre: String(attributes.receptor_nombre || ''),
    receptorUsoCfdi: String(attributes.receptor_uso_cfdi || ''),
    receptorRegimenFiscal: String(attributes.receptor_regimen_fiscal || ''),
    receptorDomicilioFiscal: String(attributes.receptor_domicilio_fiscal || ''),
    subtotal: attributes.subtotal as number,
    total: attributes.total as number,
    descuento: attributes.descuento as number,
    iva: attributes.iva as number,
    ieps: attributes.ieps as number,
    isrRetenido: attributes.isr_retenido as number,
    ivaRetenido: attributes.iva_retenido as number,
    moneda: String(attributes.moneda || 'MXN'),
    tipoCambio: attributes.tipo_cambio as number,
    formaPago: String(attributes.forma_pago || '01'),
    metodoPago: (attributes.metodo_pago as CFDIInvoice['metodoPago']) || 'PUE',
    condicionesPago: (attributes.condiciones_pago as string | undefined) || undefined,
    cfdiRelacionadoTipo: (attributes.cfdi_relacionado_tipo as string | undefined) || undefined,
    cfdiRelacionadoUuids: (attributes.cfdi_relacionado_uuids as string[] | undefined) || undefined,
    status: (attributes.status as CFDIInvoice['status']) || 'draft',
    fechaEmision: String(attributes.fecha_emision || ''),
    fechaTimbrado: (attributes.fecha_timbrado as string | undefined) || undefined,
    fechaCancelacion: (attributes.fecha_cancelacion as string | undefined) || undefined,
    xmlPath: (attributes.xml_path as string | undefined) || undefined,
    pdfPath: (attributes.pdf_path as string | undefined) || undefined,
    errorMessage: (attributes.error_message as string | undefined) || undefined,
    metadata: (attributes.metadata as Record<string, unknown> | undefined) || undefined,
    createdAt: String(attributes.created_at || ''),
    updatedAt: String(attributes.updated_at || ''),
    // Included relationships
    companySetting: companySetting
      ? transformJsonApiCompanySetting(companySetting)
      : undefined,
    contact: contact ? (contact.attributes as Record<string, unknown>) : undefined,
    arInvoice: arInvoice ? (arInvoice.attributes as Record<string, unknown>) : undefined,
    items: items?.map((item) => transformJsonApiCFDIItem(item)) || undefined,
  }
}

/**
 * Transform CFDIInvoiceFormData to JSON:API format
 */
export function transformCFDIInvoiceFormToJsonApi(
  data: CFDIInvoiceFormData
): Record<string, unknown> {
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
export function transformCFDIInvoicesResponse(apiResponse: Record<string, unknown>): {
  data: CFDIInvoice[]
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
} {
  const included = (apiResponse.included as Record<string, unknown>[]) || []

  return {
    data: (apiResponse.data as Record<string, unknown>[]).map((resource: Record<string, unknown>) =>
      transformJsonApiCFDIInvoice(resource, included)
    ),
    meta: apiResponse.meta as Record<string, unknown>,
    links: apiResponse.links as Record<string, unknown>,
  }
}

// ============================================================================
// CFDI ITEM TRANSFORMERS
// ============================================================================

/**
 * Transform JSON:API CFDIItem resource to frontend type
 */
export function transformJsonApiCFDIItem(
  resource: Record<string, unknown>,
  included?: Record<string, unknown>[]
): CFDIItem {
  const attributes = resource.attributes as Record<string, unknown>

  // Map included relationship
  const relationships = resource.relationships as Record<string, { data?: { id: unknown } }> | undefined
  const cfdiInvoice = included?.find(
    (inc) =>
      inc.type === 'cfdi_invoices' &&
      inc.id === (relationships?.cfdiInvoice?.data as { id: unknown } | undefined)?.id
  )

  return {
    id: String(resource.id),
    cfdiInvoiceId: attributes.cfdi_invoice_id as number,
    productId: (attributes.product_id as number | null) ?? null,
    numeroLinea: (attributes.numero_linea as number) || 1,
    claveProdServ: String(attributes.clave_prod_serv || ''),
    noIdentificacion: (attributes.no_identificacion as string | null) ?? null,
    cantidad: attributes.cantidad as number,
    claveUnidad: String(attributes.clave_unidad || ''),
    unidad: String(attributes.unidad || ''),
    descripcion: String(attributes.descripcion || ''),
    valorUnitario: attributes.valor_unitario as number,
    importe: attributes.importe as number,
    descuento: attributes.descuento as number,
    impuestos: (attributes.impuestos as Record<string, unknown>) || {},
    objetoImp: String(attributes.objeto_imp || '02'),
    trasladoImpuesto: (attributes.traslado_impuesto as string | undefined) || undefined,
    trasladoTipoFactor: (attributes.traslado_tipo_factor as string | undefined) || undefined,
    trasladoTasaOCuota: (attributes.traslado_tasa_o_cuota as string | undefined) || undefined,
    trasladoImporte: (attributes.traslado_importe as number | undefined) || undefined,
    retencionImpuesto: (attributes.retencion_impuesto as string | undefined) || undefined,
    retencionTipoFactor: (attributes.retencion_tipo_factor as string | undefined) || undefined,
    retencionTasaOCuota: (attributes.retencion_tasa_o_cuota as string | undefined) || undefined,
    retencionImporte: (attributes.retencion_importe as number | undefined) || undefined,
    numeroPedimento: (attributes.numero_pedimento as string | null) ?? null,
    cuentaPredial: (attributes.cuenta_predial as Record<string, unknown> | null) ?? null,
    informacionAduanera: (attributes.informacion_aduanera as Record<string, unknown> | null) ?? null,
    metadata: (attributes.metadata as Record<string, unknown> | null) ?? null,
    createdAt: String(attributes.created_at || ''),
    updatedAt: String(attributes.updated_at || ''),
    // Included relationships
    cfdiInvoice: cfdiInvoice
      ? transformJsonApiCFDIInvoice(cfdiInvoice)
      : undefined,
  }
}

/**
 * Transform CFDIItemFormData to JSON:API format
 */
export function transformCFDIItemFormToJsonApi(data: CFDIItemFormData): Record<string, unknown> {
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
export function transformCFDIItemsResponse(apiResponse: Record<string, unknown>): {
  data: CFDIItem[]
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
} {
  const included = (apiResponse.included as Record<string, unknown>[]) || []

  return {
    data: (apiResponse.data as Record<string, unknown>[]).map((resource: Record<string, unknown>) =>
      transformJsonApiCFDIItem(resource, included)
    ),
    meta: apiResponse.meta as Record<string, unknown>,
    links: apiResponse.links as Record<string, unknown>,
  }
}

// ============================================================================
// COMPANY SETTING TRANSFORMERS
// ============================================================================

/**
 * Transform JSON:API CompanySetting resource to frontend type
 */
export function transformJsonApiCompanySetting(resource: Record<string, unknown>): CompanySetting {
  const attributes = resource.attributes as Record<string, unknown>

  return {
    id: String(resource.id),
    companyName: String(attributes.company_name || ''),
    rfc: String(attributes.rfc || ''),
    taxRegime: String(attributes.tax_regime || ''),
    postalCode: String(attributes.postal_code || ''),
    invoiceSeries: String(attributes.invoice_series || ''),
    creditNoteSeries: String(attributes.credit_note_series || ''),
    nextInvoiceFolio: attributes.next_invoice_folio as number,
    nextCreditNoteFolio: attributes.next_credit_note_folio as number,
    pacProvider: String(attributes.pac_provider || 'sw'),
    pacUsername: String(attributes.pac_username || ''),
    pacProductionMode: attributes.pac_production_mode as boolean,
    certificateFile: String(attributes.certificate_file || ''),
    keyFile: String(attributes.key_file || ''),
    logoPath: (attributes.logo_path as string | undefined) || undefined,
    additionalSettings: (attributes.additional_settings as Record<string, unknown> | undefined) || undefined,
    isActive: attributes.is_active as boolean,
    createdAt: String(attributes.created_at || ''),
    updatedAt: String(attributes.updated_at || ''),
  }
}

/**
 * Transform CompanySettingFormData to JSON:API format
 */
export function transformCompanySettingFormToJsonApi(
  data: CompanySettingFormData
): Record<string, unknown> {
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
export function transformCompanySettingsResponse(apiResponse: Record<string, unknown>): {
  data: CompanySetting[]
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
} {
  return {
    data: (apiResponse.data as Record<string, unknown>[]).map((resource: Record<string, unknown>) =>
      transformJsonApiCompanySetting(resource)
    ),
    meta: apiResponse.meta as Record<string, unknown>,
    links: apiResponse.links as Record<string, unknown>,
  }
}
