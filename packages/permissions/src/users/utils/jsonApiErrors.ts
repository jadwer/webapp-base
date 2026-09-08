/**
 * Extraccion de errores de validacion JSON:API (422) para mostrarlos al
 * usuario con detalle. Mismo criterio que @lwm/contacts: NUNCA tragarse
 * el detalle de un 422 tras un toast generico (bug prod 2026-07-29).
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

/** Etiquetas en espanol para los atributos del usuario (pointer JSON:API). */
const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  email: 'Email',
  status: 'Estado',
  password: 'Contrasena',
  password_confirmation: 'Confirmacion de contrasena',
  roles: 'Roles',
}

/** Traducciones de los mensajes de validacion mas comunes de Laravel. */
const MESSAGE_PATTERNS: Array<[RegExp, string]> = [
  [/has already been taken/i, 'ya esta registrado'],
  [/must be a valid email/i, 'no tiene formato de correo valido'],
  [/must be at least (\d+) characters/i, 'debe tener al menos $1 caracteres'],
  [/confirmation does not match/i, 'no coincide con la confirmacion'],
  [/format is invalid/i, 'tiene un formato invalido'],
  [/must not be greater than (\d+) characters/i, 'excede el largo maximo ($1 caracteres)'],
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

  // Sin traduccion conocida: mostrar el detalle original (mejor que mudo).
  return `${label}: ${raw}`
}

/**
 * Devuelve mensajes legibles de un error de validacion 422.
 * Para cualquier otro error (red, 500, etc.) devuelve [] y el caller
 * decide su mensaje generico.
 */
export function getUserValidationErrorMessages(error: unknown): string[] {
  const response = (error as AxiosLikeError)?.response
  if (response?.status !== 422 || !Array.isArray(response.data?.errors)) {
    return []
  }
  return response.data.errors.map(humanize)
}
