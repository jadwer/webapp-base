import axiosClient from '@/lib/axiosClient'
import { Role } from '../types/user'

const RESOURCE = '/api/v1/roles'

export const getAllRoles = async (): Promise<Role[]> => {
  const response = await axiosClient.get(RESOURCE)
  return response.data.data.map((item: { id: string; attributes: Omit<Role, 'id'> }) => ({
    id: item.id,
    ...item.attributes
  }))
}
