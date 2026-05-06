'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserForm from '@/modules/users/components/UserForm'
import { useUserForm } from '@/modules/users/hooks/useUserForm'
import { getUser } from '@/modules/users/services/usersService'
import { User } from '@/modules/users/types/user'

interface EditUserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const { handleSubmit, loading, error } = useUserForm({
    onSuccess: () => {
      router.push('/dashboard/users')
    }
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(resolvedParams.id)
        // Convert roles array to single role name for the form
        const userWithRole = {
          ...userData,
          role: userData.roles && userData.roles.length > 0 ? userData.roles[0].name : undefined
        }
        setUser(userWithRole)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Error al cargar usuario')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [resolvedParams.id])

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (loadError || !user) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          {loadError || 'Usuario no encontrado'}
        </div>
        <button className="btn btn-secondary" onClick={handleCancel}>
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-pencil-square text-warning me-2" />
                Editar Usuario
              </h1>
              <p className="text-muted mb-0">Modificar los datos del usuario</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <UserForm
                    initialValues={user}
                    onSubmit={(values) => handleSubmit(values, resolvedParams.id)}
                    loading={loading}
                    error={error}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary mt-3"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
