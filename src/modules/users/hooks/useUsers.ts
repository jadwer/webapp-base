// src/modules/users/hooks/useUsers.ts

import { useEffect, useState, useCallback } from 'react'
import { getAllUsers } from '../services/usersService'
import { User } from '../types/user'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
      setError(null)
    } catch {
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

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
