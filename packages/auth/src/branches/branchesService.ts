/**
 * Sucursales: JSON:API contra /api/v1/branches (CRUD estandar).
 */

import axiosClient from '../lib/axiosClient'
import type { Branch, BranchFormData } from './types'

const RESOURCE = '/api/v1/branches'

interface BranchResource {
  id: string
  type: string
  attributes: Record<string, unknown>
}

const nullable = (value: unknown): string | null =>
  value === undefined || value === null || value === '' ? null : String(value)

export const transformBranch = (resource: BranchResource): Branch => {
  const a = resource.attributes || {}
  return {
    id: String(resource.id),
    name: String(a.name ?? ''),
    code: String(a.code ?? ''),
    address: nullable(a.address),
    city: nullable(a.city),
    state: nullable(a.state),
    postalCode: nullable(a.postalCode),
    phone: nullable(a.phone),
    email: nullable(a.email),
    isActive: Boolean(a.isActive ?? true),
    isMain: Boolean(a.isMain ?? false),
  }
}

const buildAttributes = (data: BranchFormData): Record<string, unknown> => ({
  name: data.name.trim(),
  code: data.code.trim().toUpperCase(),
  address: nullable(data.address),
  city: nullable(data.city),
  state: nullable(data.state),
  postalCode: nullable(data.postalCode),
  phone: nullable(data.phone),
  email: nullable(data.email),
  isActive: data.isActive,
  isMain: data.isMain,
})

export const branchesService = {
  /** Todas las sucursales (son pocas): principal primero y luego por nombre. */
  getAll: async (): Promise<Branch[]> => {
    const response = await axiosClient.get(RESOURCE, {
      params: { sort: 'name', 'page[size]': 100 },
    })
    const body = response.data as { data?: BranchResource[] }
    return (body.data || [])
      .map(transformBranch)
      .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.name.localeCompare(b.name, 'es'))
  },

  create: async (data: BranchFormData): Promise<Branch> => {
    const response = await axiosClient.post(RESOURCE, {
      data: { type: 'branches', attributes: buildAttributes(data) },
    })
    return transformBranch((response.data as { data: BranchResource }).data)
  },

  update: async (id: string, data: BranchFormData): Promise<Branch> => {
    const response = await axiosClient.patch(`${RESOURCE}/${id}`, {
      data: { type: 'branches', id: String(id), attributes: buildAttributes(data) },
    })
    return transformBranch((response.data as { data: BranchResource }).data)
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`${RESOURCE}/${id}`)
  },
}
