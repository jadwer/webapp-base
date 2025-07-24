'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axiosClient'

export function ApiTestComponent() {
  const [testResult, setTestResult] = useState<string>('Cargando...')
  const [apiUrl, setApiUrl] = useState<string>('')
  const [authStatus, setAuthStatus] = useState<string>('')
  const [debugData, setDebugData] = useState<unknown>(null)

  useEffect(() => {
    // Mostrar la URL base que está usando
    setApiUrl(axios.defaults.baseURL || 'No configurada')
    
    // Verificar estado de autenticación
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    setAuthStatus(token ? `✅ Token presente (${token.substring(0, 20)}...)` : '❌ No hay token de autenticación')

    // Hacer una prueba de conexión
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection to:', axios.defaults.baseURL)
        console.log('Auth token:', token ? 'Present' : 'Missing')
        
        const response = await axios.get('/api/v1/roles?include=permissions')
        console.log('API Response:', response.data)
        setDebugData(response.data)
        setTestResult(`✅ Conexión exitosa - ${response.data?.data?.length || 0} roles encontrados`)
      } catch (error: unknown) {
        console.error('API Error:', error)
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
          const status = axiosError.response?.status
          const message = axiosError.response?.data?.message || axiosError.message
          setTestResult(`❌ Error ${status}: ${message}`)
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          setTestResult(`❌ Error: ${errorMessage}`)
        }
      }
    }

    testApiConnection()
  }, [])

  return (
    <div className="alert alert-info">
      <h6>🔧 Test de Conexión API</h6>
      <p><strong>URL Base:</strong> {apiUrl}</p>
      <p><strong>Autenticación:</strong> {authStatus}</p>
      <p><strong>Resultado:</strong> {testResult}</p>
      
      {debugData && (
        <details className="mt-3">
          <summary><strong>🔍 Datos recibidos (Debug)</strong></summary>
          <pre className="mt-2 p-2 bg-light border rounded" style={{ fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto' }}>
            {typeof debugData === 'object' ? JSON.stringify(debugData, null, 2) : String(debugData)}
          </pre>
        </details>
      )}
    </div>
  )
}
