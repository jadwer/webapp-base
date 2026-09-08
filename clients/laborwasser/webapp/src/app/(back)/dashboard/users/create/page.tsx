'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { UserForm } from '@/modules/users'

export default function CreateUserPage() {
  const router = useRouter()

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-link text-muted p-0 me-3"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4" />
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
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <UserForm
                onSuccess={() => router.push('/dashboard/users')}
                onCancel={() => router.back()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
