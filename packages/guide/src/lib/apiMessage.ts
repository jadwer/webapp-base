/**
 * El detalle que responde la API (422 de Laravel, errores JSON:API o `error`
 * de los endpoints de accion). Regla 7: el rechazo del backend se muestra con
 * su texto, nunca con un mensaje generico si hay uno.
 */
export function apiMessage(caught: unknown, fallback = 'No se pudo completar la acción.'): string {
  const data = (
    caught as {
      response?: {
        data?: {
          message?: string
          error?: string
          errors?: Record<string, string[]> | Array<{ detail?: string }>
        }
      }
    }
  )?.response?.data
  if (!data) return fallback
  if (Array.isArray(data.errors)) return data.errors[0]?.detail ?? data.message ?? fallback
  if (data.errors) {
    const first = Object.values(data.errors)[0]?.[0]
    if (first) return first
  }
  return data.error ?? data.message ?? fallback
}
