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
      console.log('🔄 Cargando usuarios...')
      const data = await getAllUsers()
      console.log('✅ Usuarios cargados:', data)
      setUsers(data)
      setError(null)
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios'
      setError(errorMessage)
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
