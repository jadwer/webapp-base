'use client'

import { useState, useEffect } from 'react'
import { axiosClient as axios } from '@lwm/auth'

interface ApiData {
  data?: unknown[]
  [key: string]: unknown
}

export function ApiTestComponent() {
  const [testResult, setTestResult] = useState<string>('Cargando...')
  const [apiUrl, setApiUrl] = useState<string>('')
  const [authStatus, setAuthStatus] = useState<string>('')
  const [debugData, setDebugData] = useState<ApiData | null>(null)

  useEffect(() => {
    // Mostrar la URL base que está usando
    setApiUrl(axios.defaults.baseURL || 'No configurada')
    
    // Verificar estado de autenticación. Solo en dev exponemos el prefijo del
    // token: en prod, ni siquiera 20 chars de un Sanctum token deben llegar al DOM.
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const isDev = process.env.NODE_ENV !== 'production'
    setAuthStatus(
      token
        ? (isDev ? `✅ Token presente (${token.substring(0, 20)}...)` : '✅ Token presente')
        : '❌ No hay token de autenticación'
    )

    // Hacer una prueba de conexión
    const testApiConnection = async () => {
      try {
        const response = await axios.get('/api/v1/roles?include=permissions')
        setDebugData(response.data)
        setTestResult(`✅ Conexión exitosa - ${response.data?.data?.length || 0} roles encontrados`)
      } catch (error: unknown) {
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
