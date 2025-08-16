/**
 * ERROR TYPES
 * Types específicos para manejo de errores en el módulo inventory
 */

import type { AxiosError } from 'axios'
import type { JsonApiErrorResponse, JsonApiErrorObject } from '../utils/jsonApi'

// Standard API Error Response
export interface ApiErrorResponse {
  message?: string
  errors?: JsonApiErrorObject[]
  status?: number
  code?: string
}

// Axios Error with our API response structure
export interface ApiError extends AxiosError<ApiErrorResponse> {
  response: {
    data: ApiErrorResponse
    status: number
    statusText: string
    headers: Record<string, string>
  }
}

// Common error types we handle
export type KnownError = 
  | ApiError
  | Error
  | { message: string }
  | string

// Helper type guard functions
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    'data' in (error as any).response
  )
}

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

// Error message extractor
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (isApiError(error)) {
    return error.response?.data?.message || 'API Error occurred'
  }
  
  if (isError(error)) {
    return error.message
  }
  
  if (isErrorWithMessage(error)) {
    return error.message
  }
  
  return 'An unknown error occurred'
}

// Form validation error type
export interface FormValidationError {
  [fieldName: string]: string
}

// Error handler for components
export interface ErrorHandlerResult {
  message: string
  details?: string[]
  isValidationError: boolean
  status?: number
}

export function handleComponentError(error: unknown): ErrorHandlerResult {
  if (isApiError(error)) {
    const response = error.response.data
    const isValidationError = error.response.status === 422 || error.response.status === 400
    
    return {
      message: response.message || 'Server error occurred',
      details: response.errors?.map(err => err.detail || err.title || 'Unknown error'),
      isValidationError,
      status: error.response.status
    }
  }
  
  return {
    message: getErrorMessage(error),
    isValidationError: false
  }
}