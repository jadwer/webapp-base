/**
 * Tipos de documento de contacto.
 *
 * ESPEJO EXACTO de la lista que valida el backend (no hay endpoint de
 * catalogo para estos tipos):
 * - api-base Modules/Contacts/app/Http/Controllers/Api/V1/ContactDocumentUploadController.php (store, document_type)
 * - api-base Modules/Contacts/app/JsonApi/V1/ContactDocuments/ContactDocumentRequest.php (documentType)
 * Si el backend cambia la lista, cambiarla aqui; el test
 * tests/utils/documentTypes.test.ts la fija para que no se desvie en silencio.
 */

export const CONTACT_DOCUMENT_TYPES = [
  'rfc',
  'cedula_fiscal',
  'ine',
  'constancia_sat',
  'opinion_sat',
  'certificado_sello',
  'comprobante_domicilio',
  'cotizacion',
  'orden_compra',
  'factura',
  'contrato',
  'otros',
] as const

export type ContactDocumentType = (typeof CONTACT_DOCUMENT_TYPES)[number]

export const CONTACT_DOCUMENT_TYPE_LABELS: Record<ContactDocumentType, string> = {
  rfc: 'RFC',
  cedula_fiscal: 'Cédula de identificación fiscal',
  ine: 'INE (identificación oficial)',
  constancia_sat: 'Constancia de situación fiscal',
  opinion_sat: 'Opinión de cumplimiento SAT',
  certificado_sello: 'Certificado de sello digital',
  comprobante_domicilio: 'Comprobante de domicilio',
  cotizacion: 'Cotización',
  orden_compra: 'Orden de compra',
  factura: 'Factura',
  contrato: 'Contrato',
  otros: 'Otros',
}

export const CONTACT_DOCUMENT_TYPE_ICONS: Record<ContactDocumentType, string> = {
  rfc: 'bi-file-earmark-check',
  cedula_fiscal: 'bi-file-earmark-check',
  ine: 'bi-person-badge',
  constancia_sat: 'bi-file-earmark-check',
  opinion_sat: 'bi-file-earmark-check',
  certificado_sello: 'bi-file-earmark-lock',
  comprobante_domicilio: 'bi-house',
  cotizacion: 'bi-file-earmark-text',
  orden_compra: 'bi-file-earmark-text',
  factura: 'bi-receipt',
  contrato: 'bi-file-earmark-text',
  otros: 'bi-file-earmark',
}

/** Etiqueta para mostrar; tolera valores viejos que ya no estan en la lista. */
export function contactDocumentTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Sin tipo'
  return CONTACT_DOCUMENT_TYPE_LABELS[type as ContactDocumentType] ?? type
}

export function contactDocumentTypeIcon(type: string | null | undefined): string {
  return CONTACT_DOCUMENT_TYPE_ICONS[type as ContactDocumentType] ?? 'bi-file-earmark'
}
