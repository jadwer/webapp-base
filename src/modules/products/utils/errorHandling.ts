import { JsonApiError } from '../types/api'

export interface ParsedError {
  message: string
  field?: string
  code?: string
}

export function parseJsonApiErrors(error: unknown): ParsedError[] {
  const errors: ParsedError[] = []
  
  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { errors?: JsonApiError[] } } }
    if (axiosError.response?.data?.errors) {
      const apiErrors: JsonApiError[] = axiosError.response.data.errors
      
      apiErrors.forEach(apiError => {
        errors.push({
          message: apiError.detail || apiError.title || 'Error desconocido',
          field: apiError.source?.pointer?.replace('/data/attributes/', ''),
          code: apiError.status
        })
      })
    }
  }
  // Handle network errors
  else if (error && typeof error === 'object' && 'request' in error) {
    errors.push({
      message: 'Error de conexión. Verifique su conexión a internet.',
      code: 'NETWORK_ERROR'
    })
  }
  // Handle other errors
  else if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMessage = error as { message: string }
    errors.push({
      message: errorWithMessage.message || 'Ha ocurrido un error inesperado',
      code: 'UNKNOWN_ERROR'
    })
  } else {
    errors.push({
      message: 'Ha ocurrido un error inesperado',
      code: 'UNKNOWN_ERROR'
    })
  }
  
  return errors
}

export function getFirstErrorMessage(error: unknown): string {
  const parsedErrors = parseJsonApiErrors(error)
  return parsedErrors[0]?.message || 'Error desconocido'
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const parsedErrors = parseJsonApiErrors(error)
  const fieldErrors: Record<string, string> = {}
  
  parsedErrors.forEach(err => {
    if (err.field) {
      fieldErrors[err.field] = err.message
    }
  })
  
  return fieldErrors
}

export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 422) {
      return true
    }
  }
  
  const parsedErrors = parseJsonApiErrors(error)
  return parsedErrors.some(err => err.code === '422')
}

export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error && 'request' in error) {
    const axiosError = error as { response?: unknown; request?: unknown }
    return !axiosError.response && Boolean(axiosError.request)
  }
  return false
}

export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } }
    return axiosError.response?.status === 401 || axiosError.response?.status === 403
  }
  return false
}

export function createErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Sin conexión a internet. Verifique su conexión.'
  }
  
  if (isAuthError(error)) {
    return 'No tiene permisos para realizar esta acción.'
  }
  
  if (isValidationError(error)) {
    return 'Por favor corrija los errores en el formulario.'
  }
  
  return getFirstErrorMessage(error)
}