'use client'

import { useAuth } from '@/modules/auth/lib/auth'
import { getDefaultRoute } from '@/lib/permissions'
import UserRoleDisplay from '@/ui/components/UserRoleDisplay'
import RoleGuard from '@/ui/components/RoleGuard'

export default function RoleBasedDemo() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" />
          <span>Cargando información del usuario...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No hay usuario autenticado
      </div>
    )
  }

  const defaultRoute = getDefaultRoute(user)

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🔐 Demostración del Sistema de Roles</h2>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Información del Usuario</h5>
            </div>
            <div className="card-body">
              <UserRoleDisplay />
              
              <div className="mt-3">
                <p><strong>Ruta por defecto:</strong> <code>{defaultRoute}</code></p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Estado:</strong> 
                  <span className={`badge ms-2 ${user.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                    {user.status || 'Sin estado'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Contenido Basado en Roles</h5>
            </div>
            <div className="card-body">
              
              {/* Contenido solo para super admins (god) */}
              <RoleGuard allowedRoles={['god']}>
                <div className="alert alert-dark">
                  <h6><i className="bi bi-shield-fill me-2"></i>Solo Super Administradores (God)</h6>
                  <p className="mb-0">Este contenido solo es visible para usuarios con rol de Super Admin.</p>
                  <ul className="mt-2 mb-0">
                    <li>Control total del sistema</li>
                    <li>Gestión de otros administradores</li>
                    <li>Configuraciones críticas</li>
                    <li>Auditoría completa</li>
                  </ul>
                </div>
              </RoleGuard>

              {/* Contenido solo para administradores */}
              <RoleGuard allowedRoles={['god', 'admin', 'administrator']}>
                <div className="alert alert-danger">
                  <h6><i className="bi bi-shield-check me-2"></i>Solo Administradores</h6>
                  <p className="mb-0">Este contenido solo es visible para usuarios con rol de administrador.</p>
                  <ul className="mt-2 mb-0">
                    <li>Gestión de usuarios</li>
                    <li>Configuración del sistema</li>
                    <li>Reportes avanzados</li>
                  </ul>
                </div>
              </RoleGuard>

              {/* Contenido solo para customers */}
              <RoleGuard allowedRoles={['customer', 'user']}>
                <div className="alert alert-primary">
                  <h6><i className="bi bi-person me-2"></i>Solo Clientes/Usuarios</h6>
                  <p className="mb-0">Este contenido es visible para clientes y usuarios regulares.</p>
                  <ul className="mt-2 mb-0">
                    <li>Mi perfil</li>
                    <li>Mis pedidos</li>
                    <li>Configuración personal</li>
                  </ul>
                </div>
              </RoleGuard>

              {/* Contenido para todos los usuarios autenticados */}
              <div className="alert alert-success">
                <h6><i className="bi bi-people me-2"></i>Todos los Usuarios</h6>
                <p className="mb-0">Este contenido es visible para cualquier usuario autenticado.</p>
                <ul className="mt-2 mb-0">
                  <li>Dashboard general</li>
                  <li>Perfil básico</li>
                  <li>Cambio de contraseña</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">📋 Flujo de Redirecciones</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <h6>⚡ Super Admin</h6>
                <p className="text-muted">Rol: <code>god</code></p>
                <p><strong>Redirige a:</strong> <code>/dashboard</code></p>
                <p><strong>Acceso a:</strong> Control total del sistema</p>
              </div>
              <div className="col-md-3">
                <h6>👑 Administradores</h6>
                <p className="text-muted">Rol: <code>admin</code> o <code>administrator</code></p>
                <p><strong>Redirige a:</strong> <code>/dashboard</code></p>
                <p><strong>Acceso a:</strong> Gestión general</p>
              </div>
              <div className="col-md-3">
                <h6>👤 Clientes</h6>
                <p className="text-muted">Rol: <code>customer</code> o <code>user</code></p>
                <p><strong>Redirige a:</strong> <code>/dashboard/profile</code></p>
                <p><strong>Acceso a:</strong> Perfil y funciones básicas</p>
              </div>
              <div className="col-md-3">
                <h6>❓ Sin Rol</h6>
                <p className="text-muted">Rol: <code>undefined</code> o desconocido</p>
                <p><strong>Redirige a:</strong> <code>/dashboard/profile</code></p>
                <p><strong>Acceso a:</strong> Funciones básicas por defecto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
