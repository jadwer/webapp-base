import axiosClient from '@/lib/axiosClient'
import type {
  Audit,
  AuditFilters,
  AuditQueryParams,
  AuditJsonApiResponse,
  AuditSingleJsonApiResponse,
  AuditJsonApiResource,
  FieldChange,
} from '../types'

const BASE_URL = '/api/v1/audits'

/**
 * Parse JSON string values from backend
 */
function parseJsonValue(value: string | null): Record<string, unknown> | null {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * Calculate field changes between old and new values
 */
function calculateChanges(
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null
): FieldChange[] {
  const changes: FieldChange[] = []

  if (oldValues && newValues) {
    const allFields = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
    for (const field of allFields) {
      if (JSON.stringify(oldValues[field]) !== JSON.stringify(newValues[field])) {
        changes.push({
          field,
          oldValue: oldValues[field],
          newValue: newValues[field],
        })
      }
    }
  } else if (newValues) {
    // Created event - all fields are new
    for (const [field, value] of Object.entries(newValues)) {
      changes.push({ field, oldValue: null, newValue: value })
    }
  } else if (oldValues) {
    // Deleted event - all fields are removed
    for (const [field, value] of Object.entries(oldValues)) {
      changes.push({ field, oldValue: value, newValue: null })
    }
  }

  return changes
}

/**
 * Transform JSON:API resource to Audit object
 */
function transformAudit(resource: AuditJsonApiResource): Audit {
  const oldValues = parseJsonValue(resource.attributes.oldValues)
  const newValues = parseJsonValue(resource.attributes.newValues)

  return {
    id: resource.id,
    event: resource.attributes.event,
    userId: resource.attributes.userId,
    auditableType: resource.attributes.auditableType,
    auditableId: resource.attributes.auditableId,
    oldValues,
    newValues,
    ipAddress: resource.attributes.ipAddress,
    userAgent: resource.attributes.userAgent,
    createdAt: resource.attributes.createdAt,
    updatedAt: resource.attributes.updatedAt,
    changes: calculateChanges(oldValues, newValues),
  }
}

/**
 * Build query params from filters
 */
function buildQueryParams(
  filters?: AuditFilters,
  sort?: string,
  page?: number,
  pageSize?: number
): AuditQueryParams {
  const params: AuditQueryParams = {}

  if (filters?.causer) {
    params['filter[causer]'] = String(filters.causer)
  }
  if (filters?.event) {
    params['filter[event]'] = filters.event
  }
  if (filters?.auditableType) {
    params['filter[auditableType]'] = filters.auditableType
  }
  if (filters?.auditableId) {
    params['filter[auditableId]'] = String(filters.auditableId)
  }

  if (sort) {
    params['sort'] = sort
  }

  if (page) {
    params['page[number]'] = page
  }
  if (pageSize) {
    params['page[size]'] = pageSize
  }

  return params
}

export const auditService = {
  /**
   * Get all audits with optional filters
   */
  async getAll(
    filters?: AuditFilters,
    sort: string = '-createdAt',
    page?: number,
    pageSize?: number
  ): Promise<{ audits: Audit[]; meta?: AuditJsonApiResponse['meta'] }> {
    const params = buildQueryParams(filters, sort, page, pageSize)
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value)
        }
        return acc
      }, {} as Record<string, string>)
    ).toString()

    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL
    const response = await axiosClient.get<AuditJsonApiResponse>(url)

    const audits = response.data.data.map((resource) => transformAudit(resource))

    return {
      audits,
      meta: response.data.meta,
    }
  },

  /**
   * Get a single audit by ID
   */
  async getById(id: string): Promise<Audit> {
    const response = await axiosClient.get<AuditSingleJsonApiResponse>(
      `${BASE_URL}/${id}`
    )
    return transformAudit(response.data.data)
  },

  /**
   * Get recent audits (shortcut for dashboard)
   */
  async getRecent(limit: number = 10): Promise<Audit[]> {
    const { audits } = await this.getAll(undefined, '-createdAt', 1, limit)
    return audits
  },

  /**
   * Get audits for a specific entity
   */
  async getByEntity(
    auditableType: string,
    auditableId: string | number
  ): Promise<Audit[]> {
    const { audits } = await this.getAll({
      auditableType,
      auditableId: String(auditableId),
    })
    return audits
  },

  /**
   * Get audits by a specific user
   */
  async getByUser(userId: string | number): Promise<Audit[]> {
    const { audits } = await this.getAll({
      causer: String(userId),
    })
    return audits
  },

  /**
   * Get login/logout/login_failed history for a user
   */
  async getLoginHistory(userId: string | number): Promise<Audit[]> {
    // Get login, logout, and login_failed events
    const [loginResult, logoutResult, failedResult] = await Promise.all([
      this.getAll({ causer: String(userId), event: 'login' }),
      this.getAll({ causer: String(userId), event: 'logout' }),
      this.getAll({ causer: String(userId), event: 'login_failed' }),
    ])

    // Combine and sort by date
    const combined = [
      ...loginResult.audits,
      ...logoutResult.audits,
      ...failedResult.audits,
    ]
    combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return combined
  },
}

export default auditService
