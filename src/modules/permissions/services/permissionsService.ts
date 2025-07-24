import axiosClient from '@/lib/axiosClient'
import { Permission, PermissionFormData } from '../types/permission'

const RESOURCE = '/api/v1/permissions'

export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await axiosClient.get(RESOURCE)
  return response.data.data.map((item: { id: string; attributes: Omit<Permission, 'id'> }) => ({
    id: item.id,
    ...item.attributes
  }))
}

export const getPermission = async (id: string): Promise<Permission> => {
  const response = await axiosClient.get(`${RESOURCE}/${id}`)
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const createPermission = async (payload: PermissionFormData): Promise<Permission> => {
  const response = await axiosClient.post(RESOURCE, {
    data: {
      type: 'permissions',
      attributes: payload
    }
  })
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
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
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const deletePermission = async (id: string): Promise<void> => {
  await axiosClient.delete(`${RESOURCE}/${id}`)
}
