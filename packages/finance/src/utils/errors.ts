// Mensaje legible de un error de API: JSON:API (errors[].detail), validacion
// Laravel ({ message, errors: { campo: [..] } }) o controlador custom ({ error }).
export const getFinanceErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data as Record<string, unknown> | undefined
    if (data) {
      const errors = data.errors
      if (Array.isArray(errors) && errors.length > 0) {
        return errors
          .map((e: Record<string, unknown>) => {
            const pointer = (e.source as Record<string, unknown> | undefined)?.pointer as string | undefined
            const field = pointer ? pointer.split('/').pop() : undefined
            const text = (e.detail || e.title || '') as string
            return field && !text.includes(field) ? `${field}: ${text}` : text
          })
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
  if (error instanceof Error && error.message) return error.message
  return fallback
}
