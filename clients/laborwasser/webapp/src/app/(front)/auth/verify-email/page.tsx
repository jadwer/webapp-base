'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from '@/lib/axiosClient'
import styles from '@/modules/auth/styles/AuthTemplate.module.scss'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const hash = searchParams.get('hash')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id || !hash) {
      setStatus('error')
      setMessage('Enlace de verificacion invalido.')
      return
    }

    axios.get(`/api/auth/email/verify/${id}/${hash}`)
      .then((res) => {
        setStatus('success')
        setMessage(res.data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Enlace de verificacion invalido o expirado.')
      })
  }, [id, hash])

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.brandIcon}>
            {status === 'loading' && <i className="bi bi-hourglass-split" aria-hidden="true"></i>}
            {status === 'success' && <i className="bi bi-check-circle" aria-hidden="true"></i>}
            {status === 'error' && <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>}
          </div>
          <h1 className={styles.authTitle}>
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && 'Correo verificado'}
            {status === 'error' && 'Error de verificacion'}
          </h1>
          <p className={styles.authSubtitle}>{message}</p>
        </div>

        {status === 'loading' && (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Verificando...</span>
            </div>
          </div>
        )}

        <div className={styles.authFooter}>
          {status === 'success' && (
            <p>
              <Link href="/auth/login">
                Iniciar sesion
              </Link>
            </p>
          )}
          {status === 'error' && (
            <p>
              <Link href="/auth/login">
                Volver al login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container py-5" style={{ maxWidth: 480 }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
