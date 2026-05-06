'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import UserForm from '@/modules/users/components/UserForm'
import { useUserForm } from '@/modules/users/hooks/useUserForm'

export default function CreateUserPage() {
  const router = useRouter()

  const { handleSubmit, loading, error } = useUserForm({
    onSuccess: () => {
      router.push('/dashboard/users')
    }
  })

  const handleCancel = () => {
    router.back()
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
                <i className="bi bi-person-plus text-primary me-2" />
                Nuevo Usuario
              </h1>
              <p className="text-muted mb-0">Crear una nueva cuenta de usuario</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <UserForm
                    initialValues={{}}
                    onSubmit={(values) => handleSubmit(values)}
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
