// src/modules/users/hooks/useUsers.ts

import { useEffect, useState, useCallback } from 'react'
import { getAllUsers } from '../services/usersService'
import { User } from '../types/user'

export function useUsers(options?: { trashed?: 'with' | 'only' | 'without' }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllUsers(options?.trashed ? { trashed: options.trashed } : undefined)
      setUsers(data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [options?.trashed])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers, // 👈 aquí está la magia
  }
}
