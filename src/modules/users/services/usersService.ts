import axiosClient from '@/lib/axiosClient'
import { User } from '../types/user'

const RESOURCE = '/api/v1/users'

// Helper para limpiar y filtrar datos antes de enviar al backend
const prepareUserAttributes = (payload: Partial<User>): Record<string, unknown> => {
  const allowedFields = ['name', 'email', 'password', 'password_confirmation', 'status', 'role']
  
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key]) => allowedFields.includes(key))
      .filter(([, value]) => value !== undefined && value !== null)
  )
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axiosClient.get(RESOURCE)
  return response.data.data.map((item: { id: string; attributes: Omit<User, 'id'> }) => ({
    id: item.id,
    ...item.attributes
  }))
}

export const getUser = async (id: string): Promise<User> => {
  const response = await axiosClient.get(`${RESOURCE}/${id}`)
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const createUser = async (payload: Partial<User>): Promise<User> => {
  const attributesOnly = prepareUserAttributes(payload)
  
  const response = await axiosClient.post(RESOURCE, {
    data: {
      type: 'users',
      attributes: attributesOnly
    }
  })
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const attributesOnly = prepareUserAttributes(payload)
  
  const response = await axiosClient.patch(`${RESOURCE}/${id}`, {
    data: {
      id,
      type: 'users',
      attributes: attributesOnly
    }
  })
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const deleteUser = async (id: string): Promise<void> => {
  await axiosClient.delete(`${RESOURCE}/${id}`)
}
