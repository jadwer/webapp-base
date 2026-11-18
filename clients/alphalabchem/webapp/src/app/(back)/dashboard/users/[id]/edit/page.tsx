'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { UserForm, useUser } from '@/modules/users'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { user, isLoading, error } = useUser(resolvedParams.id)

  if (isLoading) {
    return (
      <div className="container-fluid py-4 text-center text-muted">
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        Cargando usuario…
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">No se encontró el usuario.</div>
        <button type="button" className="btn btn-outline-primary" onClick={() => router.push('/dashboard/users')}>
          Volver a usuarios
        </button>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <UserForm
        key={user.id}
        user={user}
        onSuccess={() => router.push(`/dashboard/users/${user.id}`)}
        onCancel={() => router.push(`/dashboard/users/${user.id}`)}
      />
    </div>
  )
}
