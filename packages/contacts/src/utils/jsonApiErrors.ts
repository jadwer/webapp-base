/**
 * Extraccion de errores de validacion JSON:API (422) para mostrarlos al usuario.
 *
 * Origen: bug en prod (2026-07-29). Un usuario paso 19 minutos llenando el
 * formulario de contacto, el backend respondio 422 y la UI solo mostro un
 * toast generico fugaz. Reporte resultante: "no puedo crear clientes".
 * Regla: NUNCA tragarse el detalle de un 422; el usuario necesita saber que
 * campo corregir.
 */

interface JsonApiErrorItem {
  detail?: string
  title?: string
  source?: { pointer?: string }
}

interface AxiosLikeError {
  response?: {
    status?: number
    data?: { errors?: JsonApiErrorItem[] }
  }
}

/** Etiquetas en espanol para los atributos del contacto (pointer JSON:API). */
const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre comercial',
  legalName: 'Razon social',
  taxId: 'RFC',
  email: 'Email',
  phone: 'Telefono',
  website: 'Sitio web',
  status: 'Estado',
  contactType: 'Tipo de contacto',
  creditLimit: 'Limite de credito',
  paymentTerms: 'Terminos de pago',
  classification: 'Clasificacion',
  regimenFiscal: 'Regimen fiscal',
  usoCfdi: 'Uso CFDI',
  creditMonths: 'Credito (meses)',
  bankAccountNumber: 'Cuenta bancaria',
  cuentaContable: 'Cuenta contable',
  referralSource: 'Como se entero',
  discountPct: 'Descuento pactado',
  commissionPctOverride: 'Comision override',
  defaultSalespersonId: 'Vendedor asignado',
  collectionsAgentId: 'Agente de cobranza',
  notes: 'Notas',
}

/** Traducciones de los mensajes de validacion mas comunes de Laravel. */
const MESSAGE_PATTERNS: Array<[RegExp, string]> = [
  [/has already been taken/i, 'ya esta registrado en otro contacto'],
  [/must be a valid email/i, 'no tiene formato de correo valido'],
  [/must be a valid url/i, 'debe ser una URL valida (incluye https://)'],
  [/format is invalid/i, 'tiene un formato invalido'],
  [/must not be greater than (\d+) characters/i, 'excede el largo maximo ($1 caracteres)'],
  [/may not be greater than (\d+) characters/i, 'excede el largo maximo ($1 caracteres)'],
  [/is required/i, 'es obligatorio'],
]

function fieldFromPointer(pointer?: string): string | null {
  if (!pointer) return null
  const attr = pointer.split('/').pop()
  return attr || null
}

function humanize(item: JsonApiErrorItem): string {
  const attr = fieldFromPointer(item.source?.pointer)
  const label = (attr && FIELD_LABELS[attr]) || attr || 'Dato'
  const raw = item.detail || item.title || 'valor invalido'

  for (const [pattern, replacement] of MESSAGE_PATTERNS) {
    const match = raw.match(pattern)
    if (match) {
      return `${label}: ${replacement.replace('$1', match[1] ?? '')}`
    }
  }

  // Sin traduccion conocida: mostrar el detalle original (mejor en ingles que mudo).
  return `${label}: ${raw}`
}

/**
 * Devuelve mensajes legibles de un error de validacion 422.
 * Para cualquier otro error (red, 500, etc.) devuelve [] y el caller
 * decide su mensaje generico.
 */
export function getValidationErrorMessages(error: unknown): string[] {
  const response = (error as AxiosLikeError)?.response
  if (response?.status !== 422 || !Array.isArray(response.data?.errors)) {
    return []
  }
  return response.data.errors.map(humanize)
}
