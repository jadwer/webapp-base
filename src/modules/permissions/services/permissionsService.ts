import axiosClient from '@/lib/axiosClient'
import { Permission, PermissionFormData } from '../types/permission'

const RESOURCE = '/api/v1/permissions'

export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await axiosClient.get(RESOURCE)
  return response.data.data.map((item: { id: string; attributes: any }) => ({
    id: item.id,
    name: item.attributes.name,
    guard_name: item.attributes.guard_name,
    created_at: item.attributes.createdAt,
    updated_at: item.attributes.updatedAt,
  }))
}

export const getPermission = async (id: string): Promise<Permission> => {
  const response = await axiosClient.get(`${RESOURCE}/${id}`)
  const { attributes } = response.data.data
  return {
    id: response.data.data.id,
    name: attributes.name,
    guard_name: attributes.guard_name,
    created_at: attributes.createdAt,
    updated_at: attributes.updatedAt,
  }
}

export const createPermission = async (payload: PermissionFormData): Promise<Permission> => {
  const response = await axiosClient.post(RESOURCE, {
    data: {
      type: 'permissions',
      attributes: payload
    }
  })
  const { attributes } = response.data.data
  return {
    id: response.data.data.id,
    name: attributes.name,
    guard_name: attributes.guard_name,
    created_at: attributes.createdAt,
    updated_at: attributes.updatedAt,
  }
}

export const updatePermission = async (id: string, payload: PermissionFormData): Promise<Permission> => {
  const response = await axiosClient.patch(`${RESOURCE}/${id}`, {
    data: {
      id,
      type: 'permissions',
      attributes: payload
    }
  })
  const { attributes } = response.data.data
  return {
    id: response.data.data.id,
    name: attributes.name,
    guard_name: attributes.guard_name,
    created_at: attributes.createdAt,
    updated_at: attributes.updatedAt,
  }
}

export const deletePermission = async (id: string): Promise<void> => {
  await axiosClient.delete(`${RESOURCE}/${id}`)
}
