'use client'

import dynamic from 'next/dynamic'

// Load lazily to avoid SSR/hydration issues that some tenant landings (rich
// product carousels, GrapesJS-rendered sections) require.
const DemoLanding = dynamic(
  () => import('@/modules/example-landing').then((mod) => ({ default: mod.DemoLanding })),
  {
    ssr: false,
    loading: () => (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    ),
  }
)

interface HomeClientProps {
  showFullCatalog?: boolean
  enableProductModal?: boolean
}

export default function HomeClient(props: HomeClientProps = {}) {
  return <DemoLanding {...props} />
}
