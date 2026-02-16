'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/modules/auth/schemas/forgot-password.schema'
import { useAuth } from '@/modules/auth/lib/auth'
import { useState } from 'react'
import StatusMessage from '@/ui/StatusMessage'
import { Input } from '@/ui/components/base'

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth()

  const [status, setStatus] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'danger' | 'info' | 'warning'>('info')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)

    try {
      const success = await forgotPassword({
        email: data.email,
        setErrors: (apiErrors) => {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages)
              ? messages.join(', ')
              : String(messages)

            setError(field as keyof ForgotPasswordFormData, {
              type: 'manual',
              message: msg,
            })
          })
        },
        setStatus: (msg) => {
          setStatus(msg)
          setStatusType('success')
        },
      })

      if (!success) {
        setStatusType('danger')
      }
    } catch {
      setStatus('Ocurrio un error inesperado.')
      setStatusType('danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StatusMessage message={status} type={statusType} />

      <div className="mb-3">
        <Input
          id="email"
          type="email"
          label="Correo electronico"
          placeholder="tu@email.com"
          leftIcon="bi-envelope"
          errorText={errors.email?.message}
          autoFocus
          {...register('email')}
        />
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Enviando...
            </>
          ) : (
            'Enviar enlace de recuperacion'
          )}
        </button>
      </div>
    </form>
  )
}
