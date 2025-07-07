import axiosClient from '@/lib/axiosClient'
import { User } from '../types/user'

const RESOURCE = '/api/v1/users'

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axiosClient.get(RESOURCE)
  return response.data.data.map((item: any) => ({
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
  const response = await axiosClient.post(RESOURCE, {
    data: {
      type: 'users',
      attributes: payload
    }
  })
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const response = await axiosClient.patch(`${RESOURCE}/${id}`, {
    data: {
      id,
      type: 'users',
      attributes: payload
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
