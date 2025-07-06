// src/modules/auth/lib/handleApiErrors.ts

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
export const handleApiErrors = (
  error: ErrorResponse,
  setErrors?: (errors: Record<string, string[]>) => void,
  setStatus?: (status: string | null) => void
): void => {
  if (error.response?.status === 422) {
    setErrors?.(error.response.data?.errors || {})
    setStatus?.(null)
  } else {
    throw error
  }
}
