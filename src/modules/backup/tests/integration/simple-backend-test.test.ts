/**
 * SIMPLE BACKEND INTEGRATION TEST
 * Test directo contra el backend para verificar funcionamiento
 */

import { describe, it, expect } from 'vitest'
import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000'

describe('Simple Backend Test', () => {
  it('should authenticate and fetch warehouses successfully', async () => {
    // Step 1: Login
    console.log('🔑 Logging in...')
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'god@example.com',
      password: 'supersecure'
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.data).toHaveProperty('access_token')
    
    const token = loginResponse.data.access_token
    console.log(`✅ Login successful - User: ${loginResponse.data.user?.name}`)
    console.log(`✅ Token: ${token.substring(0,15)}... (length: ${token.length})`)

    // Step 2: Use token to fetch warehouses
    console.log('🏢 Fetching warehouses...')
    console.log(`📡 Request URL: ${API_BASE_URL}/api/v1/warehouses`)
    console.log(`🔐 Authorization: Bearer ${token.substring(0,15)}...`)
    
    const warehousesResponse = await axios.get(`${API_BASE_URL}/api/v1/warehouses`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${token}`
      }
    })

    expect(warehousesResponse.status).toBe(200)
    expect(warehousesResponse.data).toHaveProperty('data')
    expect(warehousesResponse.data).toHaveProperty('jsonapi')
    expect(warehousesResponse.data.jsonapi.version).toBe('1.0')

    console.log(`✅ Found ${warehousesResponse.data.data.length} warehouses`)
    
    if (warehousesResponse.data.data.length > 0) {
      const warehouse = warehousesResponse.data.data[0]
      console.log(`📦 First warehouse: ${warehouse.attributes.name}`)
      
      expect(warehouse).toHaveProperty('type', 'warehouses')
      expect(warehouse).toHaveProperty('attributes')
      expect(warehouse.attributes).toHaveProperty('name')
    }
  }, 15000)
})