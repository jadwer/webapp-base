// src/modules/auth/lib/handleApiErrors.ts
import { parseJsonApiErrors } from '@/lib/parseJsonApiErrors'

export interface ErrorResponse {
  response?: {
    status?: number
    data?: {
      errors?: Record<string, string[]>
      message?: string
    }
  }
}

/**
 * Maneja errores de validación (422) de forma genérica.
 */
export function handleApiErrors(
  error: unknown,
  setErrors: (errors: Record<string, string[]>) => void,
  setStatus?: (msg: string | null) => void
) {
  if (!error || typeof error !== 'object') return

  const response = (error as any).response

  if (response?.status === 422 && Array.isArray(response.data?.errors)) {
    const parsed = parseJsonApiErrors(response.data.errors)
    setErrors(parsed)
  } else if (response?.status === 401) {
    setStatus?.('Credenciales inválidas')
  } else {
    console.error('Error no manejado:', error)
    setStatus?.('Ocurrió un error inesperado.')
  }
}