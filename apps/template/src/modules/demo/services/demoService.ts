import axiosClient from '@/lib/axiosClient'
import type { DemoStatus, DemoResetResponse } from '../types'

const BASE_URL = '/api/v1/demo'

export const demoService = {
  /**
   * Public demo status endpoint (no auth required).
   * Confirms whether the backend runs in demo mode and when the next
   * scheduled reset happens.
   */
  async getStatus(): Promise<DemoStatus> {
    const response = await axiosClient.get<DemoStatus>(`${BASE_URL}/status`)
    return response.data
  },

  /**
   * Reset the demo environment. Requires an authenticated user (sanctum)
   * and is throttled server-side (1 request / 5 min). Wipes ALL data,
   * including users and tokens: after a successful reset the current
   * session is gone and the user must log in again.
   */
  async reset(): Promise<DemoResetResponse> {
    const response = await axiosClient.post<DemoResetResponse>(`${BASE_URL}/reset`)
    return response.data
  },
}

export default demoService
