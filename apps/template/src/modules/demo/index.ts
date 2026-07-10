/**
 * Demo Module
 *
 * Demo mode experience for the SaaS template deployed at
 * marcablanca.laborwasserdemexico.com. Shows a banner with the next
 * scheduled reset, a reset button and login cards with demo credentials.
 * Everything renders null unless NEXT_PUBLIC_DEMO_MODE=true AND the
 * backend confirms demo mode via GET /api/v1/demo/status.
 */

// Components
export { DemoBanner } from './components/DemoBanner'
export { DemoLoginCards } from './components/DemoLoginCards'

// Hooks
export { useDemoMode } from './hooks/useDemoMode'

// Services
export { demoService } from './services/demoService'

// Types
export type { DemoStatus, DemoResetResponse } from './types'
