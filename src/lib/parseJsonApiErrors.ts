/**
 * Convierte errores de tipo JSON:API a estructura compatible con react-hook-form.
 *
 * Ejemplo de entrada:
 * [
 *   { source: { pointer: '/email' }, detail: 'El correo no está registrado.' }
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
    const field = pointer.replace(/^\//, '') // Ej. "/email" → "email"
    const message = typedError.detail ?? 'Error desconocido'

    if (!field) continue

    if (!result[field]) result[field] = []
    result[field].push(message)
  }

  return result
}
