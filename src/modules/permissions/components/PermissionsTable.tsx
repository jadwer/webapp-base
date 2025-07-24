'use client'

import { Permission } from '../types/permission'

interface PermissionsTableProps {
  permissions: Permission[]
  isLoading: boolean
  onEdit: (permission: Permission) => void
  onDelete: (permission: Permission) => void
}

export default function PermissionsTable({ 
  permissions, 
  isLoading, 
  onEdit, 
  onDelete 
}: PermissionsTableProps) {
  if (isLoading) {
    return (
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Guard</th>
              <th scope="col">Creado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, index) => (
              <tr key={index}>
                <td><div className="placeholder-glow"><span className="placeholder col-6"></span></div></td>
                <td><div className="placeholder-glow"><span className="placeholder col-8"></span></div></td>
                <td><div className="placeholder-glow"><span className="placeholder col-4"></span></div></td>
                <td><div className="placeholder-glow"><span className="placeholder col-7"></span></div></td>
                <td><div className="placeholder-glow"><span className="placeholder col-10"></span></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No hay permisos registrados en el sistema.
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nombre</th>
            <th scope="col">Guard</th>
            <th scope="col">Creado</th>
            <th scope="col" style={{ width: '120px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>
                <span className="badge bg-light text-dark font-monospace">
                  {permission.id}
                </span>
              </td>
              <td>
                <strong>{permission.name}</strong>
              </td>
              <td>
                <span className={`badge ${permission.guard_name === 'api' ? 'bg-primary' : 'bg-secondary'}`}>
                  {permission.guard_name}
                </span>
              </td>
              <td className="text-muted small">
                {formatDate(permission.createdAt)}
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => onEdit(permission)}
                    title="Editar permiso"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => onDelete(permission)}
                    title="Eliminar permiso"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
