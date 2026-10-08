import { describe, it, expect } from 'vitest'
import {
  CONTACT_DOCUMENT_TYPES,
  CONTACT_DOCUMENT_TYPE_LABELS,
  contactDocumentTypeLabel,
} from '../../utils/documentTypes'

// Lista literal del backend (ContactDocumentUploadController::store y
// ContactDocumentRequest). Si este test falla, revisar ambos archivos de api-base.
const BACKEND_DOCUMENT_TYPES = [
  'rfc', 'cedula_fiscal', 'ine', 'constancia_sat', 'opinion_sat', 'certificado_sello',
  'comprobante_domicilio', 'cotizacion', 'orden_compra', 'factura', 'contrato', 'otros',
]

describe('CONTACT_DOCUMENT_TYPES', () => {
  it('es exactamente la lista que valida el backend, en el mismo orden', () => {
    expect([...CONTACT_DOCUMENT_TYPES]).toEqual(BACKEND_DOCUMENT_TYPES)
  })

  it('cada tipo tiene etiqueta en espanol y no hay etiquetas sobrantes', () => {
    expect(Object.keys(CONTACT_DOCUMENT_TYPE_LABELS).sort()).toEqual([...BACKEND_DOCUMENT_TYPES].sort())
    for (const type of CONTACT_DOCUMENT_TYPES) {
      expect(CONTACT_DOCUMENT_TYPE_LABELS[type].length).toBeGreaterThan(0)
    }
  })

  it('muestra el valor crudo si llega un tipo desconocido', () => {
    expect(contactDocumentTypeLabel('constancia_sat')).toBe('Constancia de situación fiscal')
    expect(contactDocumentTypeLabel('legacy_type')).toBe('legacy_type')
    expect(contactDocumentTypeLabel(null)).toBe('Sin tipo')
  })
})
