'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/modules/roles'

interface RoleViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RoleViewPage({ params }: RoleViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { role, isLoading } = useRole(parseInt(resolvedParams.id))

  const handleEdit = () => {
    router.push(`/dashboard/roles/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/roles')
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

  if (!role) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Rol no encontrado
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a roles
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
              title="Volver a roles"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-shield text-primary me-2" />
                {role.name}
              </h1>
              <p className="text-muted mb-0">
                {role.permissions?.length || 0} permisos asignados
              </p>
            </div>
            <button className="btn btn-warning" onClick={handleEdit}>
              <i className="bi bi-pencil me-2" />
              Editar
            </button>
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2" />
                    Informacion del Rol
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Nombre</h6>
                      <p className="fs-5 mb-0">{role.name}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Descripcion</h6>
                      <p className="fs-5 mb-0">{role.description || 'Sin descripcion'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {role.permissions && role.permissions.length > 0 && (
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-key me-2" />
                      Permisos Asignados ({role.permissions.length})
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="d-flex flex-wrap gap-2">
                      {role.permissions.map((permission: { id: number; name: string }) => (
                        <span key={permission.id} className="badge bg-primary">
                          {permission.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
