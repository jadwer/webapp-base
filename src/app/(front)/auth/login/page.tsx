'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useAuth } from '@/modules/auth/lib/auth'
import { handleApiErrors } from '@/modules/auth/lib/handleApiErrors'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

import type { ErrorResponse } from '@/modules/auth/lib/handleApiErrors'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const registered = searchParams.get('registered') === 'true'

  const { login } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: redirect,
  })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (registered) {
      setStatus('Tu cuenta fue creada correctamente. Inicia sesión para continuar.')
    }
  }, [registered])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      await login({
        email,
        password,
        setErrors,
        setStatus,
      })
    } catch (error) {
      handleApiErrors(error as ErrorResponse, setErrors, setStatus)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="mb-4 text-center">Iniciar sesión</h1>

      {status && (
        <div className="alert alert-success" role="alert">
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email[0]}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            id="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password[0]}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Ingresar
        </button>
      </form>

      <p className="mt-4 text-center">
        ¿No tienes una cuenta?{' '}
        <Link href="/auth/register" className="text-decoration-none">
          ¡Regístrate ahora!
        </Link>
      </p>
    </div>
  )
}
