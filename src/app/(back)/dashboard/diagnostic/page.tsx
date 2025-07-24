'use client'

import { useAuth } from '@/modules/auth/lib/auth'
import { useIsClient } from '@/hooks/useIsClient'
import { getUserRoles, isAdmin, isSuperAdmin } from '@/lib/permissions'

export default function DiagnosticPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const isClient = useIsClient()

  if (!isClient || isLoading) {
    return (
      <div className="container mt-4">
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No hay usuario autenticado. 
          <a href="/auth/login" className="alert-link ms-2">Iniciar sesión</a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">🔍 Diagnóstico del Sistema de Autenticación</h1>
      
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Estructura Completa del Usuario</h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded" style={{ fontSize: '12px', overflowX: 'auto' }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Información Básica</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>ID:</strong></td>
                    <td>{user.id}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>{user.name}</td>
                  </tr>
                  <tr>
                    <td><strong>Campo &apos;role&apos;:</strong></td>
                    <td>
                      {user.role ? (
                        <span className="badge bg-primary">{user.role}</span>
                      ) : (
                        <span className="text-muted">No definido</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Verificaciones de Roles</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Es Super Admin (god):</strong></td>
                    <td>
                      {isSuperAdmin(user) ? (
                        <span className="badge bg-danger">SÍ</span>
                      ) : (
                        <span className="badge bg-secondary">NO</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Es Admin:</strong></td>
                    <td>
                      {isAdmin(user) ? (
                        <span className="badge bg-warning">SÍ</span>
                      ) : (
                        <span className="badge bg-secondary">NO</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Roles detectados:</strong></td>
                    <td>
                      {getUserRoles(user).map(role => (
                        <span key={role} className="badge bg-info me-1">{role}</span>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Array de Roles (user.roles)</h5>
            </div>
            <div className="card-body">
              {user.roles && Array.isArray(user.roles) ? (
                <pre className="bg-light p-3 rounded" style={{ fontSize: '12px' }}>
                  {JSON.stringify(user.roles, null, 2)}
                </pre>
              ) : (
                <div className="text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  No se encontró array de roles o está vacío
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Array de Permisos (user.permissions)</h5>
            </div>
            <div className="card-body">
              {user.permissions && Array.isArray(user.permissions) ? (
                <pre className="bg-light p-3 rounded" style={{ fontSize: '12px' }}>
                  {JSON.stringify(user.permissions, null, 2)}
                </pre>
              ) : (
                <div className="text-muted">
                  <i className="bi bi-info-circle me-2"></i>
                  No se encontró array de permisos o está vacío
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="bi bi-lightbulb me-2"></i>
              Instrucciones de Diagnóstico
            </h6>
            <p className="mb-2">
              Esta página te ayuda a entender exactamente qué información está devolviendo tu API de autenticación.
            </p>
            <ul className="mb-0">
              <li>Revisa la &quot;Estructura Completa del Usuario&quot; para ver todos los campos disponibles</li>
              <li>Verifica que el campo &apos;role&apos; contenga el valor esperado (ejemplo: &apos;god&apos;)</li>
              <li>Si usas arrays de roles/permisos, revisa esas secciones</li>
              <li>Las verificaciones te muestran si nuestras funciones detectan correctamente los roles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
