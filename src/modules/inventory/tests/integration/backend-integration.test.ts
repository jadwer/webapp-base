/**
 * @vitest-environment node
 * BACKEND INTEGRATION TEST - REAL API CALLS
 * Tests integración real con el backend usando environment node
 */

// Setup específico para integration tests
import '../../../../test/integration-setup'
import { describe, it, expect, beforeAll } from 'vitest'
import axios, { AxiosInstance } from 'axios'

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000'
const CREDENTIALS = { email: 'god@example.com', password: 'supersecure' }
const TEST_TIMEOUT = 15000

// Global authenticated client
let authenticatedClient: AxiosInstance
let authToken: string

describe('Backend Integration Tests - Node Environment', () => {
  beforeAll(async () => {
    console.log('🔧 Configurando autenticación...')
    
    // Step 1: Login to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, CREDENTIALS, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.data).toHaveProperty('access_token')
    
    authToken = loginResponse.data.access_token
    console.log(`✅ Autenticación exitosa - Usuario: ${loginResponse.data.user.name}`)
    console.log(`🔑 Token obtenido: ${authToken.substring(0, 15)}...`)

    // Step 2: Create authenticated client
    authenticatedClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    console.log('🚀 Cliente autenticado configurado\n')
  }, TEST_TIMEOUT)

  describe('Authentication & Connectivity', () => {
    it('should successfully authenticate and connect to backend', async () => {
      expect(authToken).toBeDefined()
      expect(authToken.length).toBeGreaterThan(50)
      expect(authenticatedClient).toBeDefined()
    })
  })

  describe('Warehouses API Integration', () => {
    it('should fetch all warehouses successfully', async () => {
      const response = await authenticatedClient.get('/api/v1/warehouses')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('jsonapi')
      expect(response.data.jsonapi.version).toBe('1.0')
      expect(Array.isArray(response.data.data)).toBe(true)

      console.log(`✅ Warehouses encontrados: ${response.data.data.length}`)
      
      if (response.data.data.length > 0) {
        const warehouse = response.data.data[0]
        expect(warehouse).toHaveProperty('type', 'warehouses')
        expect(warehouse).toHaveProperty('id')
        expect(warehouse).toHaveProperty('attributes')
        expect(warehouse.attributes).toHaveProperty('name')
        
        console.log(`📦 Primer warehouse: ${warehouse.attributes.name} (${warehouse.attributes.code})`)
      }
    }, TEST_TIMEOUT)

    it('should handle warehouse filtering correctly', async () => {
      const response = await authenticatedClient.get('/api/v1/warehouses', {
        params: { 'filter[name]': 'Almacén' }
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      expect(Array.isArray(response.data.data)).toBe(true)

      console.log(`✅ Warehouses con 'Almacén' encontrados: ${response.data.data.length}`)
    }, TEST_TIMEOUT)

    it('should support relationships inclusion', async () => {
      const response = await authenticatedClient.get('/api/v1/warehouses', {
        params: { 'include': 'locations' }
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      
      if (response.data.included) {
        console.log(`✅ Relationships incluidas: ${response.data.included.length} items`)
      }
    }, TEST_TIMEOUT)
  })

  describe('Locations API Integration', () => {
    it('should fetch warehouse locations successfully', async () => {
      const response = await authenticatedClient.get('/api/v1/warehouse-locations')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      expect(Array.isArray(response.data.data)).toBe(true)

      console.log(`✅ Locations encontradas: ${response.data.data.length}`)
    }, TEST_TIMEOUT)
  })

  describe('Stock API Integration', () => {
    it('should fetch stock data successfully', async () => {
      const response = await authenticatedClient.get('/api/v1/stocks')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      expect(Array.isArray(response.data.data)).toBe(true)

      console.log(`✅ Stock entries encontradas: ${response.data.data.length}`)
    }, TEST_TIMEOUT)
  })

  describe('Inventory Movements API Integration', () => {
    it('should fetch inventory movements successfully', async () => {
      const response = await authenticatedClient.get('/api/v1/inventory-movements')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      expect(Array.isArray(response.data.data)).toBe(true)

      console.log(`✅ Movements encontrados: ${response.data.data.length}`)
    }, TEST_TIMEOUT)

    it('should handle movement filtering by type', async () => {
      const response = await authenticatedClient.get('/api/v1/inventory-movements', {
        params: { 'filter[movementType]': 'entry' }
      })

      expect(response.status).toBe(200)
      console.log(`✅ Entry movements: ${response.data.data.length}`)
    }, TEST_TIMEOUT)

    it('should support movement sorting', async () => {
      const response = await authenticatedClient.get('/api/v1/inventory-movements', {
        params: { 'sort': '-movementDate' }
      })

      expect(response.status).toBe(200)
      console.log(`✅ Sorted movements: ${response.data.data.length}`)
    }, TEST_TIMEOUT)
  })

  describe('Error Handling Integration', () => {
    it('should handle 404 errors correctly', async () => {
      try {
        await authenticatedClient.get('/api/v1/warehouses/999999')
        throw new Error('Should have thrown 404')
      } catch (error: any) {
        expect(error.response.status).toBe(404)
        expect(error.response.data).toHaveProperty('errors')
        console.log('✅ 404 errors manejados correctamente')
      }
    }, TEST_TIMEOUT)
  })

  describe('Performance Integration', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now()
      
      await authenticatedClient.get('/api/v1/warehouses')
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(5000) // 5 seconds max
      
      console.log(`⚡ Response time: ${responseTime}ms`)
    }, TEST_TIMEOUT)
  })
})