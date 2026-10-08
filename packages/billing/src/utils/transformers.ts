/**
 * Billing Module - JSON:API Transformers
 *
 * Contrato real (desde 2026-09-30 la API serializa exactamente el Schema):
 * atributos camelCase y tipos kebab-case (cfdi-invoices, cfdi-items,
 * company-settings, ar-invoices). Se lee camelCase con respaldo snake_case;
 * se escribe solo camelCase con las llaves que validan los Requests.
 */

import type {
  CFDIInvoice,
  CFDIInvoiceFormData,
  CFDIItem,
  CFDIItemFormData,
  CompanySetting,
  CompanySettingFormData,
} from '../types'

type JsonApiResource = Record<string, unknown>
type RelationshipData = { type?: unknown; id: unknown }

const toSnake = (key: string): string => key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)

/** Lector de atributos: camelCase del Schema con respaldo snake_case. */
function attrReader(resource: JsonApiResource) {
  const attributes = (resource.attributes as Record<string, unknown>) || {}
  return (camel: string): unknown => {
    const value = attributes[camel]
    return value !== undefined ? value : attributes[toSnake(camel)]
  }
}

function relatedOne(
  resource: JsonApiResource,
  name: string,
  type: string,
  included?: JsonApiResource[]
): JsonApiResource | undefined {
  const relationships = resource.relationships as Record<string, { data?: RelationshipData | null }> | undefined
  const data = relationships?.[name]?.data
  if (!data || !included) return undefined
  return included.find((inc) => inc.type === type && String(inc.id) === String(data.id))
}

function relatedMany(
  resource: JsonApiResource,
  name: string,
  type: string,
  included?: JsonApiResource[]
): JsonApiResource[] | undefined {
  const relationships = resource.relationships as Record<string, { data?: RelationshipData[] | null }> | undefined
  const data = relationships?.[name]?.data
  if (!Array.isArray(data) || !included) return undefined
  const ids = new Set(data.map((d) => String(d.id)))
  return included.filter((inc) => inc.type === type && ids.has(String(inc.id)))
}

const optNumber = (value: unknown): number | undefined =>
  value === null || value === undefined || value === '' ? undefined : Number(value)

const optString = (value: unknown): string | undefined =>
  value === null || value === undefined || value === '' ? undefined : String(value)

// ============================================================================
// CFDI INVOICE TRANSFORMERS
// ============================================================================

/**
 * Transform JSON:API CFDIInvoice resource (cfdi-invoices) to frontend type
 */
export function transformJsonApiCFDIInvoice(
  resource: JsonApiResource,
  included?: JsonApiResource[]
): CFDIInvoice {
  const attr = attrReader(resource)

  const companySetting = relatedOne(resource, 'companySetting', 'company-settings', included)
  const contact = relatedOne(resource, 'contact', 'contacts', included)
  const arInvoice = relatedOne(resource, 'arInvoice', 'ar-invoices', included)
  const items = relatedMany(resource, 'items', 'cfdi-items', included)

  return {
    id: String(resource.id),
    companySettingId: attr('companySettingId') as number,
    contactId: attr('contactId') as number,
    branchId: (attr('branchId') ?? null) as number | null,
    arInvoiceId: optNumber(attr('arInvoiceId')),
    series: String(attr('series') || ''),
    folio: attr('folio') as number,
    uuid: optString(attr('uuid')),
    tipoComprobante: (attr('tipoComprobante') as CFDIInvoice['tipoComprobante']) || 'I',
    receptorRfc: String(attr('receptorRfc') || ''),
    receptorNombre: String(attr('receptorNombre') || ''),
    receptorUsoCfdi: String(attr('receptorUsoCfdi') || ''),
    receptorRegimenFiscal: String(attr('receptorRegimenFiscal') || ''),
    receptorDomicilioFiscal: String(attr('receptorDomicilioFiscal') || ''),
    subtotal: attr('subtotal') as number,
    total: attr('total') as number,
    descuento: attr('descuento') as number,
    iva: attr('iva') as number,
    ieps: attr('ieps') as number,
    isrRetenido: attr('isrRetenido') as number,
    ivaRetenido: attr('ivaRetenido') as number,
    moneda: String(attr('moneda') || 'MXN'),
    tipoCambio: attr('tipoCambio') as number,
    formaPago: String(attr('formaPago') || '01'),
    metodoPago: (attr('metodoPago') as CFDIInvoice['metodoPago']) || 'PUE',
    condicionesPago: optString(attr('condicionesPago')),
    // Complemento de pago (REP, tipo P)
    arPaymentId: optNumber(attr('arPaymentId')),
    fechaPago: optString(attr('fechaPago')),
    montoPago: optNumber(attr('montoPago')),
    formaPagoP: optString(attr('formaPagoP')),
    numParcialidad: optNumber(attr('numParcialidad')),
    impSaldoInsoluto: optNumber(attr('impSaldoInsoluto')),
    cfdiRelacionadoTipo: optString(attr('cfdiRelacionadoTipo')),
    cfdiRelacionadoUuids: (attr('cfdiRelacionadoUuids') as string[] | null | undefined) || undefined,
    status: (attr('status') as CFDIInvoice['status']) || 'draft',
    fechaEmision: String(attr('fechaEmision') || ''),
    fechaTimbrado: optString(attr('fechaTimbrado')),
    fechaCancelacion: optString(attr('fechaCancelacion')),
    xmlPath: optString(attr('xmlPath')),
    pdfPath: optString(attr('pdfPath')),
    errorMessage: optString(attr('errorMessage')),
    metadata: (attr('metadata') as Record<string, unknown> | null | undefined) || undefined,
    createdAt: String(attr('createdAt') || ''),
    updatedAt: String(attr('updatedAt') || ''),
    // Relaciones incluidas
    companySetting: companySetting ? transformJsonApiCompanySetting(companySetting) : undefined,
    contact: contact ? { id: String(contact.id), ...(contact.attributes as Record<string, unknown>) } : undefined,
    arInvoice: arInvoice ? { id: String(arInvoice.id), ...(arInvoice.attributes as Record<string, unknown>) } : undefined,
    items: items?.map((item) => transformJsonApiCFDIItem(item)),
  }
}

/**
 * Transform CFDIInvoiceFormData to JSON:API (cfdi-invoices).
 * Llaves exactas de CFDIInvoiceRequest. Los opcionales ausentes no se mandan:
 * en PATCH un null borraria el valor guardado (por ejemplo arInvoiceId).
 */
export function transformCFDIInvoiceFormToJsonApi(
  data: CFDIInvoiceFormData
): Record<string, unknown> {
  const attributes: Record<string, unknown> = {
    companySettingId: data.companySettingId,
    contactId: data.contactId,
    series: data.series,
    tipoComprobante: data.tipoComprobante,
    receptorRfc: data.receptorRfc,
    receptorNombre: data.receptorNombre,
    receptorUsoCfdi: data.receptorUsoCfdi || null,
    receptorRegimenFiscal: data.receptorRegimenFiscal || null,
    receptorDomicilioFiscal: data.receptorDomicilioFiscal || null,
    subtotal: data.subtotal,
    total: data.total,
    descuento: data.descuento ?? null,
    iva: data.iva ?? null,
    ieps: data.ieps ?? null,
    isrRetenido: data.isrRetenido ?? null,
    ivaRetenido: data.ivaRetenido ?? null,
    moneda: data.moneda || null,
    tipoCambio: data.tipoCambio ?? null,
    formaPago: data.formaPago || null,
    metodoPago: data.metodoPago || null,
    condicionesPago: data.condicionesPago || null,
    status: data.status,
    fechaEmision: data.fechaEmision,
  }

  if (data.folio !== undefined) attributes.folio = data.folio
  if (data.arInvoiceId !== undefined) attributes.arInvoiceId = data.arInvoiceId || null
  if (data.branchId !== undefined) attributes.branchId = data.branchId || null
  if (data.cfdiRelacionadoTipo !== undefined) attributes.cfdiRelacionadoTipo = data.cfdiRelacionadoTipo || null
  if (data.cfdiRelacionadoUuids !== undefined) attributes.cfdiRelacionadoUuids = data.cfdiRelacionadoUuids || null
  if (data.metadata !== undefined) attributes.metadata = data.metadata || null

  return {
    type: 'cfdi-invoices',
    attributes,
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
  const included = (apiResponse.included as JsonApiResource[]) || []

  return {
    data: (apiResponse.data as JsonApiResource[]).map((resource) =>
      transformJsonApiCFDIInvoice(resource, included)
    ),
    meta: apiResponse.meta as Record<string, unknown>,
    links: apiResponse.links as Record<string, unknown>,
  }
}

// ============================================================================
// CFDI ITEM TRANSFORMERS
// ============================================================================

interface ImpuestoLinea {
  base?: number
  impuesto?: string
  tipo_factor?: string
  tasa_o_cuota?: string | number
  importe?: number
}

/**
 * Transform JSON:API CFDIItem resource (cfdi-items) to frontend type.
 * Los campos traslado* / retencion* no existen en el Schema: se derivan del
 * primer renglon de impuestos.traslados / impuestos.retenciones.
 */
export function transformJsonApiCFDIItem(
  resource: JsonApiResource,
  included?: JsonApiResource[]
): CFDIItem {
  const attr = attrReader(resource)

  const cfdiInvoice = relatedOne(resource, 'cfdiInvoice', 'cfdi-invoices', included)
  const product = relatedOne(resource, 'product', 'products', included)

  const impuestos = (attr('impuestos') as Record<string, unknown> | null | undefined) || {}
  const traslado = (impuestos.traslados as ImpuestoLinea[] | undefined)?.[0]
  const retencion = (impuestos.retenciones as ImpuestoLinea[] | undefined)?.[0]

  return {
    id: String(resource.id),
    cfdiInvoiceId: attr('cfdiInvoiceId') as number,
    productId: (attr('productId') as number | null | undefined) ?? null,
    numeroLinea: (attr('numeroLinea') as number) || 1,
    claveProdServ: String(attr('claveProdServ') || ''),
    noIdentificacion: (attr('noIdentificacion') as string | null | undefined) ?? null,
    cantidad: attr('cantidad') as number,
    claveUnidad: String(attr('claveUnidad') || ''),
    unidad: String(attr('unidad') || ''),
    descripcion: String(attr('descripcion') || ''),
    valorUnitario: attr('valorUnitario') as number,
    importe: attr('importe') as number,
    descuento: attr('descuento') as number,
    impuestos,
    objetoImp: String(attr('objetoImp') || '02'),
    trasladoImpuesto: optString(traslado?.impuesto),
    trasladoTipoFactor: optString(traslado?.tipo_factor),
    trasladoTasaOCuota: optString(traslado?.tasa_o_cuota),
    trasladoImporte: optNumber(traslado?.importe),
    retencionImpuesto: optString(retencion?.impuesto),
    retencionTipoFactor: optString(retencion?.tipo_factor),
    retencionTasaOCuota: optString(retencion?.tasa_o_cuota),
    retencionImporte: optNumber(retencion?.importe),
    numeroPedimento: (attr('numeroPedimento') as string | null | undefined) ?? null,
    cuentaPredial: (attr('cuentaPredial') as Record<string, unknown> | null | undefined) ?? null,
    informacionAduanera: (attr('informacionAduanera') as Record<string, unknown> | null | undefined) ?? null,
    metadata: (attr('metadata') as Record<string, unknown> | null | undefined) ?? null,
    createdAt: String(attr('createdAt') || ''),
    updatedAt: String(attr('updatedAt') || ''),
    // Relaciones incluidas
    cfdiInvoice: cfdiInvoice ? transformJsonApiCFDIInvoice(cfdiInvoice) : undefined,
    product: product ? { id: String(product.id), ...(product.attributes as Record<string, unknown>) } : undefined,
  }
}

/**
 * Arma impuestos (JSON del modelo, llaves internas snake_case como las lee
 * CFDIXMLGenerator) a partir de los campos traslado* / retencion* del form.
 */
function buildImpuestos(data: CFDIItemFormData): Record<string, unknown> | null | undefined {
  if (data.impuestos !== undefined) return data.impuestos
  if (!data.trasladoImpuesto && !data.retencionImpuesto) return undefined

  const base = (data.importe || 0) - (data.descuento || 0)
  const traslados = data.trasladoImpuesto
    ? [{
        base,
        impuesto: data.trasladoImpuesto,
        tipo_factor: data.trasladoTipoFactor || 'Tasa',
        tasa_o_cuota: data.trasladoTasaOCuota || '0.000000',
        importe: data.trasladoImporte || 0,
      }]
    : []
  const retenciones = data.retencionImpuesto
    ? [{
        base,
        impuesto: data.retencionImpuesto,
        tipo_factor: data.retencionTipoFactor || 'Tasa',
        tasa_o_cuota: data.retencionTasaOCuota || '0.000000',
        importe: data.retencionImporte || 0,
      }]
    : []

  return { traslados, retenciones }
}

/**
 * Transform CFDIItemFormData to JSON:API (cfdi-items).
 * Llaves exactas de CFDIItemRequest.
 */
export function transformCFDIItemFormToJsonApi(data: CFDIItemFormData): Record<string, unknown> {
  const attributes: Record<string, unknown> = {
    cfdiInvoiceId: data.cfdiInvoiceId,
    numeroLinea: data.numeroLinea ?? 1,
    claveProdServ: data.claveProdServ,
    noIdentificacion: data.noIdentificacion || null,
    cantidad: data.cantidad,
    claveUnidad: data.claveUnidad,
    unidad: data.unidad || null,
    descripcion: data.descripcion,
    valorUnitario: data.valorUnitario,
    importe: data.importe,
    descuento: data.descuento || 0,
    objetoImp: data.objetoImp,
  }

  const impuestos = buildImpuestos(data)
  if (impuestos !== undefined) attributes.impuestos = impuestos
  if (data.productId !== undefined) attributes.productId = data.productId
  if (data.numeroPedimento !== undefined) attributes.numeroPedimento = data.numeroPedimento || null
  if (data.cuentaPredial !== undefined) attributes.cuentaPredial = data.cuentaPredial
  if (data.informacionAduanera !== undefined) attributes.informacionAduanera = data.informacionAduanera
  if (data.metadata !== undefined) attributes.metadata = data.metadata

  return {
    type: 'cfdi-items',
    attributes,
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
  const included = (apiResponse.included as JsonApiResource[]) || []

  return {
    data: (apiResponse.data as JsonApiResource[]).map((resource) =>
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
  // La API responde camelCase (Schema fuente unica); snake_case queda como respaldo
  const attr = (camel: string, snake: string): unknown => attributes[camel] ?? attributes[snake]

  return {
    id: String(resource.id),
    companyName: String(attr('companyName', 'company_name') || ''),
    rfc: String(attributes.rfc || ''),
    taxRegime: String(attr('taxRegime', 'tax_regime') || ''),
    postalCode: String(attr('postalCode', 'postal_code') || ''),
    invoiceSeries: String(attr('invoiceSeries', 'invoice_series') || ''),
    creditNoteSeries: String(attr('creditNoteSeries', 'credit_note_series') || ''),
    nextInvoiceFolio: attr('nextInvoiceFolio', 'next_invoice_folio') as number,
    nextCreditNoteFolio: attr('nextCreditNoteFolio', 'next_credit_note_folio') as number,
    pacProvider: String(attr('pacProvider', 'pac_provider') || 'sw'),
    pacUsername: String(attr('pacUsername', 'pac_username') || ''),
    pacProductionMode: attr('pacProductionMode', 'pac_production_mode') as boolean,
    certificateFile: String(attr('certificateFile', 'certificate_file') || ''),
    keyFile: String(attr('keyFile', 'key_file') || ''),
    logoPath: (attr('logoPath', 'logo_path') as string | undefined) || undefined,
    additionalSettings: (attr('additionalSettings', 'additional_settings') as Record<string, unknown> | undefined) || undefined,
    isActive: attr('isActive', 'is_active') as boolean,
    createdAt: String(attr('createdAt', 'created_at') || ''),
    updatedAt: String(attr('updatedAt', 'updated_at') || ''),
  }
}

/**
 * Transform CompanySettingFormData to JSON:API format.
 * Llaves del CompanySettingSchema (camelCase). El certificado (.cer), la llave
 * (.key) y su contrasena son readOnly: solo viajan por upload-certificate y
 * upload-key. pacPassword vacio no se manda para no borrar el guardado.
 */
export function transformCompanySettingFormToJsonApi(
  data: CompanySettingFormData
): Record<string, unknown> {
  return {
    type: 'company-settings',
    attributes: {
      companyName: data.companyName,
      rfc: data.rfc,
      taxRegime: data.taxRegime,
      postalCode: data.postalCode,
      invoiceSeries: data.invoiceSeries,
      creditNoteSeries: data.creditNoteSeries,
      nextInvoiceFolio: data.nextInvoiceFolio,
      nextCreditNoteFolio: data.nextCreditNoteFolio,
      pacProvider: data.pacProvider,
      pacUsername: data.pacUsername,
      ...(data.pacPassword ? { pacPassword: data.pacPassword } : {}),
      pacProductionMode: data.pacProductionMode,
      logoPath: data.logoPath || null,
      ...(data.additionalSettings !== undefined ? { additionalSettings: data.additionalSettings || null } : {}),
      isActive: data.isActive,
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
