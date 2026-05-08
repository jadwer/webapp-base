/**
 * Ejemplos de patrones que previenen errores de hidratación
 */
'use client'

import { useIsClient } from '@/hooks/useIsClient'
import { useState, useEffect } from 'react'

export default function HydrationSafeExamples() {
  const isClient = useIsClient()
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (isClient) {
      setCurrentTime(new Date().toLocaleString())
    }
  }, [isClient])

  return (
    <div className="p-4 border rounded bg-light">
      <h3>🔒 Ejemplos de Hidratación Segura</h3>
      
      {/* ✅ CORRECTO: Misma estructura hasta que se hidrate */}
      <div className="mb-3">
        <strong>Fecha/hora actual:</strong>
        {isClient ? (
          <span className="text-primary ms-2">{currentTime || 'Cargando...'}</span>
        ) : (
          <span className="text-muted ms-2">Cargando...</span>
        )}
      </div>

      {/* ✅ CORRECTO: Datos dinámicos después de hidratación */}
      <div className="mb-3">
        <strong>Window size:</strong>
        {isClient ? (
          <span className="text-info ms-2">
            {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}
          </span>
        ) : (
          <span className="text-muted ms-2">Calculando...</span>
        )}
      </div>

      {/* ✅ CORRECTO: Estado de autenticación */}
      <div className="alert alert-success">
        <strong>Patrón usado en AuthStatus:</strong><br/>
        <code>if (!isClient || isLoading) return &lt;fallback&gt;</code>
      </div>
    </div>
  )
}
