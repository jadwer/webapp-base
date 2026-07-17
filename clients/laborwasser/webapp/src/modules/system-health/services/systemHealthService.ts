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

/**
 * Los endpoints de system-health responden con envelope JSON:API
 * ({ data: { type, id, attributes: {...} } }). Los consumidores esperan los
 * campos planos (health.status, health.checks, health.environment), asi que
 * devolver response.data crudo dejaba todo en undefined y la pantalla pintaba
 * "unknown" / "No disponible" pese a que el backend responde 200 correcto.
 */
function unwrap<T>(payload: unknown): T {
  const body = payload as { data?: { attributes?: T } } | undefined
  return (body?.data?.attributes ?? payload) as T
}

export const systemHealthService = {
  /**
   * Public ping endpoint (no auth required)
   * Used for uptime monitoring services
   */
  async ping(): Promise<PingResponse> {
    const response = await axiosClient.get<unknown>(`${BASE_URL}/ping`)
    return unwrap<PingResponse>(response.data)
  },

  /**
   * Get complete system health status
   * Requires: system-health.index permission
   */
  async getFullStatus(): Promise<SystemHealthStatus> {
    const response = await axiosClient.get<unknown>(BASE_URL)
    return unwrap<SystemHealthStatus>(response.data)
  },

  /**
   * Get database health and metrics
   * Requires: system-health.database permission
   */
  async getDatabaseHealth(): Promise<DatabaseHealth> {
    const response = await axiosClient.get<unknown>(`${BASE_URL}/database`)
    return unwrap<DatabaseHealth>(response.data)
  },

  /**
   * Get storage health
   * Requires: system-health.storage permission
   */
  async getStorageHealth(): Promise<StorageCheck> {
    const response = await axiosClient.get<unknown>(`${BASE_URL}/storage`)
    return unwrap<StorageCheck>(response.data)
  },

  /**
   * Get queue health
   * Requires: system-health.queue permission
   */
  async getQueueHealth(): Promise<QueueCheck> {
    const response = await axiosClient.get<unknown>(`${BASE_URL}/queue`)
    return unwrap<QueueCheck>(response.data)
  },

  /**
   * Get error logs from Telescope
   * Requires: system-health.errors permission
   */
  async getErrorLogs(): Promise<ErrorMetrics> {
    const response = await axiosClient.get<unknown>(`${BASE_URL}/errors`)
    return unwrap<ErrorMetrics>(response.data)
  },

  /**
   * Get application metrics
   * Requires: system-health.metrics permission
   */
  async getApplicationMetrics(): Promise<ApplicationMetrics> {
    const response = await axiosClient.get<unknown>(`${BASE_URL}/metrics`)
    return unwrap<ApplicationMetrics>(response.data)
  },
}

export default systemHealthService
