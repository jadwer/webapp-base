/**
 * DEV AUTHENTICATION SCRIPT
 * Script para obtener token válido durante desarrollo
 * Usage: node scripts/dev-auth.js
 */

const axios = require('axios')

const DEV_CREDENTIALS = {
  email: 'god@example.com',
  password: 'supersecure'
}

const BACKEND_URL = 'http://127.0.0.1:8000'

async function authenticateAndGetToken() {
  try {
    console.log('🔐 Authenticating with Laravel Sanctum...')
    
    // Get CSRF cookie first (if needed)
    try {
      await axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`)
      console.log('✅ CSRF cookie obtained')
    } catch (error) {
      console.log('⚠️  CSRF cookie not needed or failed:', error.message)
    }

    // Login to get token
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: DEV_CREDENTIALS.email,
      password: DEV_CREDENTIALS.password
    }, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    })

    if (loginResponse.data && (loginResponse.data.token || loginResponse.data.access_token)) {
      const token = loginResponse.data.token || loginResponse.data.access_token
      console.log('✅ Token obtained successfully!')
      console.log('📋 Token:', token)
      console.log('')
      console.log('🔧 To use in browser, run:')
      console.log(`localStorage.setItem("access_token", "${token}")`)
      console.log('')
      console.log('🧪 To test with curl:')
      console.log(`curl -H "Authorization: Bearer ${token}" -H "Accept: application/vnd.api+json" "${BACKEND_URL}/api/v1/contacts"`)
      
      return token
    } else {
      console.error('❌ No token in response:', loginResponse.data)
      return null
    }

  } catch (error) {
    console.error('❌ Authentication failed:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    } else {
      console.error('Error:', error.message)
    }
    return null
  }
}

// Run if called directly
if (require.main === module) {
  authenticateAndGetToken()
}

module.exports = { authenticateAndGetToken }