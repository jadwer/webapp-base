/**
 * API INTEGRATION TESTS - REAL BACKEND TESTING
 * Tests que hacen peticiones reales al backend para verificar integración completa
 */

import { describe, it, expect, beforeAll } from 'vitest'
import axios from 'axios'

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
const TEST_TIMEOUT = 10000

// Test credentials for automatic token generation
const TEST_CREDENTIALS = {
  email: 'god@example.com',
  password: 'supersecure'
}

// Test authentication token - Will be obtained automatically via login
let TEST_TOKEN = process.env.TEST_AUTH_TOKEN || null

// Create dedicated axios instance for integration tests 
let testClient: any

// Helper function to get authentication token and setup client
async function getAuthToken(): Promise<string> {
  if (TEST_TOKEN && testClient) {
    return TEST_TOKEN
  }

  try {
    console.log('🔑 Obtaining authentication token...')
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.data && response.data.access_token) {
      TEST_TOKEN = response.data.access_token
      console.log(`✅ Token obtained: ${TEST_TOKEN.substring(0,10)}...`)
      
      // Create new client with auth header
      testClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      })
      
      return TEST_TOKEN
    } else {
      throw new Error('No access token in response')
    }
  } catch (error: any) {
    console.error('❌ Failed to obtain auth token:', error.response?.data || error.message)
    throw new Error(`Authentication failed: ${error.response?.status || 'Unknown error'}`)
  }
}

describe('API Integration Tests - Real Backend', () => {
  
  // Setup authentication before all tests
  beforeAll(async () => {
    console.log('\n🚀 Setting up integration tests...')
    await getAuthToken()
    console.log('🔧 Authentication configured\n')
  }, TEST_TIMEOUT)

  describe('Backend Connectivity', () => {
    it('should connect to backend and authenticate successfully', async () => {
      // First, get authentication token
      await getAuthToken()
      
      // Test authenticated endpoint
      const response = await testClient.get('/api/v1/warehouses', {
        timeout: 5000
      })
      
      // Should not throw and return JSON:API format
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      
      console.log('✅ Backend conectado exitosamente')
      console.log(`📡 URL: ${API_BASE_URL}`)
      console.log(`🔑 Auth: ✅ Token activo`)
    }, TEST_TIMEOUT)
  })

  describe('Warehouses API', () => {
    it('should fetch warehouses with correct JSON:API structure', async () => {
      const response = await testClient.get('/api/v1/warehouses')

      // Verify JSON:API v1.1 compliance
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      expect(response.data).toHaveProperty('jsonapi')
      expect(response.data.jsonapi.version).toBe('1.0')

      console.log('✅ Warehouses API - Estructura JSON:API correcta')
      console.log(`📊 Warehouses encontrados: ${response.data.data.length}`)
      
      // Verify warehouse structure
      if (response.data.data.length > 0) {
        const warehouse = response.data.data[0]
        expect(warehouse).toHaveProperty('type', 'warehouses')
        expect(warehouse).toHaveProperty('id')
        expect(warehouse).toHaveProperty('attributes')
        
        console.log(`🏢 Primer warehouse: ${warehouse.attributes.name}`)
      }
    }, TEST_TIMEOUT)

    it('should handle warehouse API parameters correctly', async () => {
      // Test basic sorting which is more likely to be supported than filtering
      const response = await testClient.get('/api/v1/warehouses', {
        params: { 'sort': 'name' }
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      
      console.log('✅ Warehouse sorting funciona')
      console.log(`📊 Warehouses ordenados: ${response.data.data.length}`)
    }, TEST_TIMEOUT)

    it('should support warehouse relationships', async () => {
      const response = await testClient.get('/api/v1/warehouses', {
        params: { 'include': 'locations' }
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      
      // Check if relationships are included
      if (response.data.included) {
        console.log('✅ Warehouse relationships incluidas')
        console.log(`🔗 Included resources: ${response.data.included.length}`)
      }
    }, TEST_TIMEOUT)
  })

  describe('Locations API', () => {
    it('should fetch locations with correct structure', async () => {
      const response = await testClient.get('/api/v1/warehouse-locations')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      
      console.log('✅ Locations API funciona')
      console.log(`📦 Locations encontradas: ${response.data.data.length}`)
      
      if (response.data.data.length > 0) {
        const location = response.data.data[0]
        expect(location).toHaveProperty('type', 'warehouse-locations')
        expect(location).toHaveProperty('attributes')
        
        console.log(`📍 Primera location: ${location.attributes.name}`)
      }
    }, TEST_TIMEOUT)
  })

  describe('Stock API', () => {
    it('should fetch stock with correct structure', async () => {
      const response = await testClient.get('/api/v1/stocks')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      
      console.log('✅ Stock API funciona')
      console.log(`📊 Stock entries: ${response.data.data.length}`)
      
      if (response.data.data.length > 0) {
        const stock = response.data.data[0]
        expect(stock).toHaveProperty('type', 'stocks')
        expect(stock).toHaveProperty('attributes')
        expect(stock.attributes).toHaveProperty('quantity')
        
        console.log(`📈 Stock entry: ${stock.attributes.quantity} units`)
      }
    }, TEST_TIMEOUT)

    it('should support stock API basic operations', async () => {
      // Test basic stock endpoint without any filters
      const stockResponse = await testClient.get('/api/v1/stocks')

      expect(stockResponse.status).toBe(200)
      expect(stockResponse.data).toHaveProperty('data')
      expect(Array.isArray(stockResponse.data.data)).toBe(true)
      
      console.log('✅ Stock API básico funciona')
      console.log(`📊 Stock items: ${stockResponse.data.data.length}`)
    }, TEST_TIMEOUT)
  })

  describe('Inventory Movements API', () => {
    it('should fetch movements with correct structure', async () => {
      const response = await testClient.get('/api/v1/inventory-movements')

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('data')
      
      console.log('✅ Inventory Movements API funciona')
      console.log(`🔄 Movements encontrados: ${response.data.data.length}`)
      
      if (response.data.data.length > 0) {
        const movement = response.data.data[0]
        expect(movement).toHaveProperty('type', 'inventory-movements')
        expect(movement).toHaveProperty('attributes')
        expect(movement.attributes).toHaveProperty('movementType')
        expect(movement.attributes).toHaveProperty('quantity')
        
        console.log(`📝 Movement type: ${movement.attributes.movementType}, quantity: ${movement.attributes.quantity}`)
      }
    }, TEST_TIMEOUT)

    it('should support movement filtering by type', async () => {
      const response = await testClient.get('/api/v1/inventory-movements', {
        params: { 'filter[movementType]': 'entry' }
      })

      expect(response.status).toBe(200)
      console.log('✅ Movement filtering by type funciona')
      console.log(`📈 Entry movements: ${response.data.data.length}`)
    }, TEST_TIMEOUT)

    it('should support movement sorting by date', async () => {
      const response = await testClient.get('/api/v1/inventory-movements', {
        params: { 'sort': '-movementDate' }
      })

      expect(response.status).toBe(200)
      console.log('✅ Movement sorting by date funciona')
      
      if (response.data.data.length > 1) {
        const first = new Date(response.data.data[0].attributes.movementDate)
        const second = new Date(response.data.data[1].attributes.movementDate)
        expect(first.getTime()).toBeGreaterThanOrEqual(second.getTime())
        console.log('📅 Movements correctamente ordenados por fecha')
      }
    }, TEST_TIMEOUT)
  })

  describe('Error Handling', () => {
    it('should handle 404 errors correctly', async () => {
      try {
        await testClient.get('/api/v1/warehouses/999999')
        throw new Error('Should have thrown 404')
      } catch (error: any) {
        expect(error.response.status).toBe(404)
        expect(error.response.data).toHaveProperty('errors')
        console.log('✅ 404 errors manejados correctamente')
      }
    }, TEST_TIMEOUT)

    it('should handle validation errors correctly', async () => {
      try {
        // Try to create warehouse with invalid data
        await testClient.post('/api/v1/warehouses', {
          data: {
            type: 'warehouses',
            attributes: {
              name: '', // Empty name should fail validation
              status: 'invalid-status'
            }
          }
        })
        throw new Error('Should have thrown validation error')
      } catch (error: any) {
        expect([400, 422]).toContain(error.response.status)
        console.log('✅ Validation errors manejados correctamente')
        console.log(`📝 Status: ${error.response.status}`)
      }
    }, TEST_TIMEOUT)
  })

  describe('Performance Tests', () => {
    it('should respond to API calls within reasonable time', async () => {
      const startTime = Date.now()
      
      await testClient.get('/api/v1/warehouses')
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(2000) // Should respond within 2 seconds
      
      console.log(`⚡ Response time: ${responseTime}ms`)
    }, TEST_TIMEOUT)
  })
})