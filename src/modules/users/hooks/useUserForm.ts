import { useState } from 'react'
import { createUser, updateUser } from '../services/usersService'
import { User } from '../types/user'

interface UseUserFormOptions {
  onSuccess?: () => void
  onError?: (message: string) => void
}

export const useUserForm = ({ onSuccess, onError }: UseUserFormOptions = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: Partial<User>, id?: string) => {
    setLoading(true)
    setError(null)
    try {
      if (id) {
        await updateUser(id, values)
      } else {
        await createUser(values)
      }
      onSuccess?.()
    } catch (err: any) {
      console.error(err)
      setError('Error al guardar el usuario')
      onError?.('Error al guardar el usuario')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    handleSubmit
  }
}
