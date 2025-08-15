/**
 * INTEGRATION TESTS SETUP
 * Configuración específica para tests de integración con environment node
 * Sin mocks de DOM, solo configuración para HTTP requests reales
 */

import { vi } from 'vitest'

// =================
// CONSOLE CONTROL
// =================

// Permitir console.log en integration tests para debugging
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
}

// Mantener logs visibles en integration tests
console.log = originalConsole.log
console.error = originalConsole.error
console.warn = originalConsole.warn
console.info = originalConsole.info

// =================
// HTTP CLIENT CONFIGURATION
// =================

// No mockeamos axios para integration tests - usamos requests reales
// Los integration tests deben hacer llamadas HTTP reales al backend

// =================
// TEST UTILITIES
// =================

// Utilities específicas para integration tests
global.integrationTestUtils = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create test data
  createTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Validate JSON:API response
  validateJsonApiResponse: (data: any) => {
    return (
      data &&
      typeof data === 'object' &&
      data.jsonapi &&
      data.jsonapi.version &&
      Array.isArray(data.data)
    )
  },
  
  // Extract token from login response
  extractToken: (loginResponse: any) => {
    if (loginResponse.data && loginResponse.data.access_token) {
      return loginResponse.data.access_token
    }
    throw new Error('No access token found in login response')
  }
}

// =================
// TYPE DECLARATIONS
// =================

declare global {
  var integrationTestUtils: {
    waitFor: (ms: number) => Promise<void>
    createTestId: () => string
    validateJsonApiResponse: (data: any) => boolean
    extractToken: (loginResponse: any) => string
  }
}