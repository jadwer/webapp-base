import { useState, useEffect } from 'react'
import { Role } from '../types/user'
import { getAllRoles } from '../services/rolesService'

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        setError(null)
        const rolesData = await getAllRoles()
        setRoles(rolesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar roles')
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  return { roles, loading, error }
}
