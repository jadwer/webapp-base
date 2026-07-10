/**
 * Demo Module - Types
 *
 * Shapes returned by the api-base demo endpoints:
 * GET  /api/v1/demo/status (public)
 * POST /api/v1/demo/reset  (auth sanctum, throttle 1/5min)
 */

export interface DemoStatus {
  demo_mode: boolean
  next_scheduled_reset: string | null
}

export interface DemoResetResponse {
  message: string
  reset_at: string
}
