// src/modules/auth/tests/utils/test-utils.ts
import { User } from '@/lib/permissions'

/**
 * Mock User Factory
 * Crea un usuario de prueba con valores por defecto
 */
export const mockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  email_verified_at: '2025-01-01T00:00:00.000Z',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

/**
 * Mock Token
 * Genera un token de prueba
 */
export const mockToken = () => '1|test-token-abc123'

/**
 * Mock Login Response
 * Simula la respuesta de /api/auth/login
 */
export const mockLoginResponse = (token = mockToken()) => ({
  data: {
    access_token: token,
    token_type: 'Bearer',
  },
})

/**
 * Mock Profile Response (JSON:API)
 * Simula la respuesta de /api/v1/profile
 */
export const mockProfileResponse = (user = mockUser()) => ({
  data: {
    data: {
      id: String(user.id),
      type: 'users',
      attributes: {
        name: user.name,
        email: user.email,
        email_verified_at: user.email_verified_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      relationships: {
        roles: { data: [] },
        permissions: { data: [] },
      },
    },
  },
})

/**
 * Mock 422 Validation Error (JSON:API)
 * Simula error de validación del backend
 */
export const mock422Error = (field: string, message: string) => ({
  response: {
    status: 422,
    data: {
      errors: [
        {
          code: 'VALIDATION_ERROR',
          title: 'Validation Error',
          detail: message,
          source: {
            pointer: `/data/attributes/${field}`,
          },
        },
      ],
    },
  },
})

/**
 * Mock 401 Unauthorized Error
 * Simula error de autenticación
 */
export const mock401Error = (message = 'Unauthenticated') => ({
  response: {
    status: 401,
    data: {
      message,
    },
  },
})

/**
 * Mock 403 Forbidden Error
 * Simula error de permisos
 */
export const mock403Error = () => ({
  response: {
    status: 403,
    data: {
      message: 'Forbidden',
    },
  },
})

/**
 * Mock 500 Server Error
 * Simula error del servidor
 */
export const mock500Error = () => ({
  response: {
    status: 500,
    data: {
      message: 'Internal Server Error',
    },
  },
})

/**
 * Mock LocalStorage
 * Simula localStorage para tests
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      for (const key in store) {
        delete store[key]
      }
    },
  }
}

/**
 * Mock Router (Next.js)
 * Simula useRouter de Next.js
 */
export const mockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
})
