/**
 * VITEST SETUP
 * Configuración global para todos los tests
 * Incluye mocks, polyfills y utilidades
 */

import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// =================
// CLEANUP
// =================

// Cleanup después de cada test
afterEach(() => {
  cleanup()
})

// =================
// MOCKS GLOBALES
// =================

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams())
}))

// Mock axios client (will be replaced per test)
vi.mock('@/lib/axiosClient', () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

// =================
// DOM POLYFILLS
// =================

// Mock window.matchMedia (for responsive tests) - solo en happy-dom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })
}

// Mock IntersectionObserver (for virtualization tests)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver (for responsive components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// =================
// CONSOLE CONTROL
// =================

// Silence console.log durante tests (mantener errors y warnings)
const originalConsoleLog = console.log
beforeAll(() => {
  console.log = vi.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
})

// =================
// TEST UTILITIES
// =================

// Global test utilities
global.testUtils = {
  // Wait for DOM updates
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Create mock event
  createMockEvent: (type: string, properties = {}) => ({
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: { value: '' },
    ...properties
  }),
  
  // Mock local storage
  mockLocalStorage: () => {
    const storage: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => { storage[key] = value }),
      removeItem: vi.fn((key: string) => { delete storage[key] }),
      clear: vi.fn(() => { Object.keys(storage).forEach(key => delete storage[key]) })
    }
  }
}

// =================
// TYPE DECLARATIONS
// =================

declare global {
  var testUtils: {
    waitForNextTick: () => Promise<void>
    createMockEvent: (type: string, properties?: Record<string, unknown>) => Event
    mockLocalStorage: () => Storage
  }
}