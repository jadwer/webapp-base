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
  
  if (isRelationshipError(error)) {
    return getRelationshipErrorMessage(error)
  }
  
  return getFirstErrorMessage(error)
}

export function isRelationshipError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number, data?: { errors?: JsonApiError[] } } }
    
    // Check for constraint violation status (409 Conflict or 422 Unprocessable Entity)
    if (axiosError.response?.status === 409 || axiosError.response?.status === 422) {
      const apiErrors = axiosError.response?.data?.errors || []
      
      // Check if any error mentions foreign key, constraint, or relationship keywords
      return apiErrors.some(err => {
        const message = (err.detail || err.title || '').toLowerCase()
        return message.includes('foreign key') ||
               message.includes('constraint') ||
               message.includes('referenced') ||
               message.includes('products') ||
               message.includes('relación') ||
               message.includes('asociado') ||
               message.includes('vinculado')
      })
    }
  }
  return false
}

export function getRelationshipErrorMessage(error: unknown): string {
  const parsedErrors = parseJsonApiErrors(error)
  
  for (const err of parsedErrors) {
    const message = err.message.toLowerCase()
    
    // Check for specific relationship error patterns
    if (message.includes('products') || message.includes('producto')) {
      if (message.includes('category') || message.includes('categoría')) {
        return 'No se puede eliminar la categoría porque tiene productos asociados. Primero elimine o reasigne los productos a otra categoría.'
      }
      if (message.includes('brand') || message.includes('marca')) {
        return 'No se puede eliminar la marca porque tiene productos asociados. Primero elimine o reasigne los productos a otra marca.'
      }
      if (message.includes('unit') || message.includes('unidad')) {
        return 'No se puede eliminar la unidad porque tiene productos asociados. Primero elimine o reasigne los productos a otra unidad.'
      }
    }
    
    // Generic relationship error
    if (message.includes('foreign key') || message.includes('constraint')) {
      return 'No se puede eliminar este registro porque está siendo utilizado por otros elementos. Primero elimine las referencias antes de continuar.'
    }
  }
  
  return 'No se puede eliminar este elemento porque está relacionado con otros registros del sistema.'
}