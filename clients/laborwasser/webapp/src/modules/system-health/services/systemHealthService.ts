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

/**
 * Los endpoints de health devuelven 503 A PROPOSITO cuando algun check esta
 * en critical (asi los monitores externos detectan el problema), pero el
 * body trae el reporte COMPLETO. Un 503 con reporte es un resultado valido
 * que la pantalla debe pintar (estado critico en rojo), no un error de red.
 * Antes axios lo trataba como excepcion y la pagina solo mostraba
 * "Request failed with status code 503" ocultando el diagnostico
 * (visto en prod 2026-08-04: disco al 95% y la pantalla sin decirlo).
 * Sin body valido (Passenger caido, gateway), si se propaga como error.
 */
async function getHealth<T>(url: string): Promise<T> {
  const response = await axiosClient.get<unknown>(url, {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 503,
  })
  const body = response.data as { data?: { attributes?: unknown } } | undefined
  if (response.status === 503 && !body?.data?.attributes) {
    throw new Error('Service unavailable (503 sin reporte de health)')
  }
  return unwrap<T>(response.data)
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
    return getHealth<SystemHealthStatus>(BASE_URL)
  },

  /**
   * Get database health and metrics
   * Requires: system-health.database permission
   */
  async getDatabaseHealth(): Promise<DatabaseHealth> {
    return getHealth<DatabaseHealth>(`${BASE_URL}/database`)
  },

  /**
   * Get storage health
   * Requires: system-health.storage permission
   */
  async getStorageHealth(): Promise<StorageCheck> {
    return getHealth<StorageCheck>(`${BASE_URL}/storage`)
  },

  /**
   * Get queue health
   * Requires: system-health.queue permission
   */
  async getQueueHealth(): Promise<QueueCheck> {
    return getHealth<QueueCheck>(`${BASE_URL}/queue`)
  },

  /**
   * Get error logs from Telescope
   * Requires: system-health.errors permission
   */
  async getErrorLogs(): Promise<ErrorMetrics> {
    return getHealth<ErrorMetrics>(`${BASE_URL}/errors`)
  },

  /**
   * Get application metrics
   * Requires: system-health.metrics permission
   */
  async getApplicationMetrics(): Promise<ApplicationMetrics> {
    return getHealth<ApplicationMetrics>(`${BASE_URL}/metrics`)
  },
}

export default systemHealthService
