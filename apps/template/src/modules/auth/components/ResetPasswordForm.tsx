'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, ResetPasswordFormData } from '@/modules/auth/schemas/reset-password.schema'
import { useAuth } from '@/modules/auth/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import StatusMessage from '@/ui/StatusMessage'
import { Input } from '@/ui/components/base'
import styles from '@/modules/auth/styles/LoginForm.module.scss'

interface Props {
  token: string
  email: string
}

export function ResetPasswordForm({ token, email }: Props) {
  const { resetPassword } = useAuth()
  const router = useRouter()

  const [status, setStatus] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'danger' | 'info' | 'warning'>('info')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true)

    try {
      const success = await resetPassword({
        token: data.token,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        setErrors: (apiErrors) => {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages)
              ? messages.join(', ')
              : String(messages)

            setError(field as keyof ResetPasswordFormData, {
              type: 'manual',
              message: msg,
            })
          })
        },
        setStatus: (msg) => {
          setStatus(msg)
          setStatusType('danger')
        },
      })

      if (success) {
        setStatus('Tu contrasena ha sido restablecida. Redirigiendo al login...')
        setStatusType('success')
        setTimeout(() => router.replace('/auth/login?reset=true'), 3000)
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

      <input type="hidden" {...register('token')} />

      <div className="mb-3">
        <Input
          id="email"
          type="email"
          label="Correo electronico"
          leftIcon="bi-envelope"
          errorText={errors.email?.message}
          disabled
          {...register('email')}
        />
      </div>

      <div className="mb-3">
        <div style={{ position: 'relative' }}>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Nueva contrasena"
            placeholder="Tu nueva contrasena"
            leftIcon="bi-lock"
            errorText={errors.password?.message}
            autoFocus
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
            aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div style={{ position: 'relative' }}>
          <Input
            id="password_confirmation"
            type={showPasswordConfirmation ? 'text' : 'password'}
            label="Confirmar contrasena"
            placeholder="Confirma tu nueva contrasena"
            leftIcon="bi-lock-fill"
            errorText={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            className={styles.passwordToggle}
            aria-label={showPasswordConfirmation ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          >
            <i className={`bi ${showPasswordConfirmation ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Restableciendo...
            </>
          ) : (
            'Restablecer contrasena'
          )}
        </button>
      </div>
    </form>
  )
}
