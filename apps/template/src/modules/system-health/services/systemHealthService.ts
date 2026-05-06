import axiosClient from '@/lib/axiosClient'
import type {
  SystemHealthStatus,
  PingResponse,
  DatabaseHealth,
  StorageCheck,
  QueueCheck,
  ErrorMetrics,
  ApplicationMetrics,
} from '../types'

const BASE_URL = '/api/v1/system-health'

export const systemHealthService = {
  /**
   * Public ping endpoint (no auth required)
   * Used for uptime monitoring services
   */
  async ping(): Promise<PingResponse> {
    const response = await axiosClient.get<PingResponse>(`${BASE_URL}/ping`)
    return response.data
  },

  /**
   * Get complete system health status
   * Requires: system-health.index permission
   */
  async getFullStatus(): Promise<SystemHealthStatus> {
    const response = await axiosClient.get<SystemHealthStatus>(BASE_URL)
    return response.data
  },

  /**
   * Get database health and metrics
   * Requires: system-health.database permission
   */
  async getDatabaseHealth(): Promise<DatabaseHealth> {
    const response = await axiosClient.get<DatabaseHealth>(`${BASE_URL}/database`)
    return response.data
  },

  /**
   * Get storage health
   * Requires: system-health.storage permission
   */
  async getStorageHealth(): Promise<StorageCheck> {
    const response = await axiosClient.get<StorageCheck>(`${BASE_URL}/storage`)
    return response.data
  },

  /**
   * Get queue health
   * Requires: system-health.queue permission
   */
  async getQueueHealth(): Promise<QueueCheck> {
    const response = await axiosClient.get<QueueCheck>(`${BASE_URL}/queue`)
    return response.data
  },

  /**
   * Get error logs from Telescope
   * Requires: system-health.errors permission
   */
  async getErrorLogs(): Promise<ErrorMetrics> {
    const response = await axiosClient.get<ErrorMetrics>(`${BASE_URL}/errors`)
    return response.data
  },

  /**
   * Get application metrics
   * Requires: system-health.metrics permission
   */
  async getApplicationMetrics(): Promise<ApplicationMetrics> {
    const response = await axiosClient.get<ApplicationMetrics>(`${BASE_URL}/metrics`)
    return response.data
  },
}

export default systemHealthService
