'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePermission } from '@/modules/permissions'

interface PermissionViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PermissionViewPage({ params }: PermissionViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { permission, isLoading } = usePermission(resolvedParams.id)

  const handleEdit = () => {
    router.push(`/dashboard/permissions/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/permissions')
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

  if (!permission) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Permiso no encontrado
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
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
              onClick={handleBack}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver a permisos"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-shield-check text-primary me-2" />
                Detalle del Permiso
              </h1>
              <p className="text-muted mb-0">
                {permission.name}
              </p>
            </div>
            <button
              className="btn btn-warning"
              onClick={handleEdit}
            >
              <i className="bi bi-pencil me-2" />
              Editar
            </button>
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <dl className="row mb-0">
                    <dt className="col-sm-4">ID</dt>
                    <dd className="col-sm-8">{permission.id}</dd>

                    <dt className="col-sm-4">Nombre</dt>
                    <dd className="col-sm-8">
                      <code>{permission.name}</code>
                    </dd>

                    <dt className="col-sm-4">Guard</dt>
                    <dd className="col-sm-8">
                      <span className="badge bg-secondary">{permission.guard_name}</span>
                    </dd>

                    {permission.created_at && (
                      <>
                        <dt className="col-sm-4">Creado</dt>
                        <dd className="col-sm-8">
                          {new Date(permission.created_at).toLocaleString('es-MX')}
                        </dd>
                      </>
                    )}

                    {permission.updated_at && (
                      <>
                        <dt className="col-sm-4">Actualizado</dt>
                        <dd className="col-sm-8">
                          {new Date(permission.updated_at).toLocaleString('es-MX')}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
