'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '@/modules/auth/lib/auth'
import { handleApiErrors } from '@/modules/auth/lib/handleApiErrors'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import type { ErrorResponse } from '@/modules/auth/lib/handleApiErrors'

export default function RegisterPage() {
  const { register } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/dashboard',
  })

  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const [status, setStatus] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        setErrors,
        setStatus,
      })

      setStatus('Registro exitoso. Redirigiendo al login...')
      setTimeout(() => router.replace('/auth/login?registered=true'), 3000)
    } catch (error) {
      handleApiErrors(error as ErrorResponse, setErrors, setStatus)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="mb-4 text-center">Registro</h1>

      {status && (
        <div className="alert alert-success" role="alert">
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre completo</label>
          <input
            type="text"
            id="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name[0]}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email[0]}</div>
          )}
        </div>

        <div className="mb-3">
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

        <div className="mb-4">
          <label htmlFor="passwordConfirmation" className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            id="passwordConfirmation"
            className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
            value={passwordConfirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
            required
          />
          {errors.password_confirmation && (
            <div className="invalid-feedback">{errors.password_confirmation[0]}</div>
          )}
        </div>

        <button type="submit" className="btn btn-success w-100">
          Registrarse
        </button>
      </form>

      <p className="mt-4 text-center">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/auth/login" className="text-decoration-none">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
