// Mensaje legible de un error de API: JSON:API (errors[].detail), validacion
// Laravel ({ message, errors: { campo: [..] } }) o controlador custom ({ error }).
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data as Record<string, unknown> | undefined
    if (data) {
      const errors = data.errors
      if (Array.isArray(errors) && errors.length > 0) {
        return errors
          // Regla 9: el detalle llega en espanol con el nombre del campo; se
          // muestra tal cual, sin anteponer el puntero (atributo en ingles).
          .map((e: Record<string, unknown>) => (e.detail || e.title || '') as string)
          .filter(Boolean)
          .join(' | ') || fallback
      }
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors as Record<string, unknown>).flat().filter(Boolean)
        if (messages.length > 0) return messages.join(' | ')
      }
      if (typeof data.message === 'string' && data.message) return data.message
      if (typeof data.error === 'string' && data.error) return data.error
    }
  }
  // Regla 9: los mensajes genericos de axios vienen en ingles; se explican en espanol.
  const status = (error as { response?: { status?: number } } | null)?.response?.status
  if (status === 401) return 'La sesión expiró; vuelve a iniciar sesión.'
  if (status === 403) return 'No tienes permiso para esta acción.'
  if (status) return `${fallback} (error ${status})`
  if (error instanceof Error && error.message) {
    if (error.message === 'Network Error') return `${fallback}: no hay conexión con el servidor`
    if (/^timeout of \d+ms exceeded$/.test(error.message)) return `${fallback}: el servidor tardó demasiado en responder`
    if (/^Request failed with status code/.test(error.message)) return fallback
    return error.message
  }
  return fallback
}
