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
    } catch (err: unknown) {
      console.error('Error completo:', err)
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al guardar el usuario'
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data?: { errors?: unknown, message?: string } } }
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        } else if (axiosError.response?.data?.errors) {
          // Si son errores de validación JSON:API
          try {
            const errors = axiosError.response.data.errors
            if (Array.isArray(errors) && errors.length > 0 && errors[0].detail) {
              errorMessage = errors[0].detail
            }
          } catch {
            // Si no puede parsear los errores, mantiene el mensaje genérico
          }
        }
      }
      
      setError(errorMessage)
      onError?.(errorMessage)
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
