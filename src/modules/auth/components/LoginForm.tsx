'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/modules/auth/schemas/login.schema'
import { useAuth } from '@/modules/auth/lib/auth'
import { handleApiErrors } from '@/modules/auth/lib/handleApiErrors'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import StatusMessage from '@/ui/StatusMessage'

interface Props {
  redirect: string
  onLoginSuccess?: () => void
}

export function LoginForm({ redirect, onLoginSuccess }: Props) {
  const { login } = useAuth({ middleware: 'guest', redirectIfAuthenticated: redirect })

  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'

  const [status, setStatus] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'danger' | 'info' | 'warning'>('info')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (registered) {
      setStatus('Tu cuenta fue creada correctamente. Inicia sesión para continuar.')
      setStatusType('success')
    }
  }, [registered])

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login({
        ...data,
        setErrors: (apiErrors) => {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages)
              ? messages.join(', ')
              : String(messages)

            setError(field as keyof LoginFormData, {
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

      if (success === true) {
        onLoginSuccess?.()
      }
    } catch (error: unknown) {
      handleApiErrors(
        error as any,
        (apiErrors) => {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages)
              ? messages.join(', ')
              : String(messages)

            setError(field as keyof LoginFormData, {
              type: 'manual',
              message: msg,
            })
          })
        },
        (msg) => {
          setStatus(msg)
          setStatusType('danger')
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StatusMessage message={status} type={statusType} />

      <div className="mb-3">
        <label htmlFor="email" className="form-label">Correo electrónico</label>
        <input
          id="email"
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          {...register('email')}
          autoFocus
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Contraseña</label>
        <input
          id="password"
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          {...register('password')}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">Iniciar sesión</button>
      </div>
    </form>
  )
}
