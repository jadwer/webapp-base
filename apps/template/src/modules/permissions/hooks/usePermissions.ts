'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Permission, PermissionFormData } from '../types/permission'
import { 
  getAllPermissions, 
  getPermission, 
  createPermission, 
  updatePermission, 
  deletePermission 
} from '../services/permissionsService'

export function usePermissions() {
  const { data: permissions, error, mutate } = useSWR<Permission[]>('permissions', getAllPermissions)

  return {
    permissions: permissions || [],
    isLoading: !error && !permissions,
    isError: error,
    mutate
  }
}

export function usePermission(id: string) {
  const { data: permission, error } = useSWR<Permission>(
    id ? `permissions/${id}` : null, 
    () => getPermission(id)
  )

  return {
    permission,
    isLoading: !error && !permission,
    isError: error
  }
}

export function usePermissionActions() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = async (data: PermissionFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createPermission(data)
      setIsSubmitting(false)
      return result
    } catch (error) {
      setIsSubmitting(false)
      throw error
    }
  }

  const update = async (id: string, data: PermissionFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updatePermission(id, data)
      setIsSubmitting(false)
      return result
    } catch (error) {
      setIsSubmitting(false)
      throw error
    }
  }

  const remove = async (id: string) => {
    setIsSubmitting(true)
    try {
      await deletePermission(id)
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      throw error
    }
  }

  return {
    create,
    update,
    remove,
    isSubmitting
  }
}
