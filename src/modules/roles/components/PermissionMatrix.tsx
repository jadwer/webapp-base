'use client'

import { useState } from 'react'
import { useRoles } from '../hooks/useRoles'
import { useGroupedPermissions } from '../hooks/usePermissions'
import { Skeleton } from '@/ui/Skeleton'

export function PermissionMatrix() {
  const { roles, isLoading: rolesLoading } = useRoles(['permissions'])
  const { groupedPermissions, isLoading: permissionsLoading } = useGroupedPermissions()
  
  const [selectedModule, setSelectedModule] = useState<string>('all')

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <Skeleton className="mb-3 placeholder" />
          <Skeleton className="placeholder" />
        </div>
      </div>
    )
  }

  const moduleKeys = Object.keys(groupedPermissions)
  const displayedPermissions = selectedModule === 'all' 
    ? Object.values(groupedPermissions).flat()
    : groupedPermissions[selectedModule] || []

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-grid-3x3-gap-fill me-2"></i>
            Matriz de Permisos
          </h5>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">Todos los módulos</option>
              {moduleKeys.map(module => (
                <option key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="card-body p-0">
        {displayedPermissions.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-grid display-1 text-muted"></i>
            <h6 className="mt-3 text-muted">No hay permisos disponibles</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-end">Permiso</th>
                  {roles.map(role => (
                    <th key={role.id} className="text-center border-start" style={{ minWidth: '80px' }}>
                      <div className="d-flex flex-column align-items-center">
                        <small className="fw-bold">{role.name}</small>
                        <span className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>
                          {role.permissions?.length || 0}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedPermissions.map(permission => (
                  <tr key={permission.id}>
                    <td className="border-end">
                      <div className="d-flex align-items-center">
                        <code className="text-primary small">{permission.name}</code>
                      </div>
                    </td>
                    {roles.map(role => {
                      const hasPermission = role.permissions?.some(p => p.id === permission.id)
                      return (
                        <td key={`${role.id}-${permission.id}`} className="text-center border-start">
                          {hasPermission ? (
                            <i className="bi bi-check-circle-fill text-success" title="Tiene permiso"></i>
                          ) : (
                            <i className="bi bi-x-circle text-muted" title="No tiene permiso"></i>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="card-footer bg-light">
        <div className="row text-center">
          <div className="col">
            <small className="text-muted">
              <i className="bi bi-check-circle-fill text-success me-1"></i>
              Tiene permiso
            </small>
          </div>
          <div className="col">
            <small className="text-muted">
              <i className="bi bi-x-circle me-1"></i>
              Sin permiso
            </small>
          </div>
          <div className="col">
            <small className="text-muted">
              Mostrando {displayedPermissions.length} permisos
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
