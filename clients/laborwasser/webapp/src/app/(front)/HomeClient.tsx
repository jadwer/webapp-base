'use client'

import dynamic from 'next/dynamic'

// Cargar el componente dinamicamente para evitar problemas de SSR/hidratacion
// (mismo patron que el monolito legado: legacy_files/lwm-stash/app/laborwasser-demo).
const LaborWasserLanding = dynamic(
  () => import('@/modules/landing').then((mod) => ({ default: mod.LaborWasserLanding })),
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

export default function HomeClient() {
  return <LaborWasserLanding />
}
