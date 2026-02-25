'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CotizacionPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/cart')
  }, [router])

  return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Redirigiendo...</span>
      </div>
      <p className="mt-3 text-muted">Redirigiendo al carrito de cotizaciones...</p>
    </div>
  )
}
