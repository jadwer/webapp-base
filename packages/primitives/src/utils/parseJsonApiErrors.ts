/**
 * Convierte errores de tipo JSON:API a estructura compatible con react-hook-form.
 *
 * Soporta dos formatos de source.pointer:
 * - Formato JSON:API completo: "/data/attributes/name" -> "name"
 * - Formato simple (legacy): "/email" -> "email"
 *
 * Ejemplo de entrada:
 * [
 *   { source: { pointer: '/data/attributes/email' }, detail: 'El correo no está registrado.' }
 * ]
 *
 * Salida:
 * {
 *   email: ['El correo no está registrado.']
 * }
 */

interface JsonApiError {
  source?: {
    pointer?: string;
  };
  detail?: string;
}

/**
 * Extrae el nombre del campo de un pointer JSON:API
 * - "/data/attributes/name" -> "name"
 * - "/data/attributes/firstName" -> "firstName"
 * - "/email" -> "email" (legacy format)
 */
function extractFieldFromPointer(pointer: string): string {
  // Formato JSON:API completo: /data/attributes/fieldName
  const jsonApiMatch = pointer.match(/^\/data\/attributes\/(.+)$/)
  if (jsonApiMatch) {
    return jsonApiMatch[1]
  }

  // Formato legacy: /fieldName
  return pointer.replace(/^\//, '')
}

export function parseJsonApiErrors(errors: unknown): Record<string, string[]> {
  if (!Array.isArray(errors)) return {}

  const result: Record<string, string[]> = {}

  for (const error of errors) {
    if (
      typeof error !== 'object' ||
      !error ||
      !('source' in error) ||
      !('detail' in error)
    ) continue

    const typedError = error as JsonApiError
    const pointer = typedError.source?.pointer ?? ''
    const field = extractFieldFromPointer(pointer)
    const message = typedError.detail ?? 'Error desconocido'

    if (!field) continue

    if (!result[field]) result[field] = []
    result[field].push(message)
  }

  return result
}
