'use client'

import dynamic from 'next/dynamic'

// Cargar el componente dinámicamente para evitar problemas de SSR/hidratación
const LaborWasserLandingEnhanced = dynamic(
  () => import('@/modules/laborwasser-landing').then((mod) => ({ default: mod.LaborWasserLandingEnhanced })),
  { 
    ssr: false,
    loading: () => (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando Labor Wasser...</p>
        </div>
      </div>
    )
  }
)

interface HomeClientProps {
  showFullCatalog?: boolean
  enableProductModal?: boolean
}

export default function HomeClient({ 
  showFullCatalog = false, 
  enableProductModal = true 
}: HomeClientProps) {
  return (
    <LaborWasserLandingEnhanced 
      showFullCatalog={showFullCatalog}
      enableProductModal={enableProductModal}
    />
  )
}