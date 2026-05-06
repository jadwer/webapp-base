'use client'

import { useAuth } from '@/modules/auth/lib/auth'
import { useIsClient } from '@/hooks/useIsClient'
import { useState, useRef } from 'react'
import { useUsers } from '@/modules/users/hooks/useUsers'
import { useUserForm } from '@/modules/users/hooks/useUserForm'
import { User } from '@/modules/users/types/user'
import ToastNotifier, { ToastNotifierHandle } from '@/ui/ToastNotifier'

export default function UsersDiagnosticPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const isClient = useIsClient()
  const { users, loading: loadingUsers, error: usersError } = useUsers()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [testRole, setTestRole] = useState<string>('customer')
  const toastRef = useRef<ToastNotifierHandle>(null)

  const { handleSubmit, loading: saving, error: saveError } = useUserForm({
    onSuccess: () => {
      toastRef.current?.show('Usuario actualizado correctamente', 'success')
      setSelectedUser(null)
    },
    onError: (message) => {
      toastRef.current?.show(message, 'error')
    }
  })

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

  const handleTestUpdate = () => {
    if (!selectedUser) return
    
    const updateData = {
      ...selectedUser,
      role: testRole
    }
    
    console.log('🔧 Datos del usuario seleccionado:', selectedUser)
    console.log('🔧 Datos que se van a enviar:', updateData)
    console.log('🔧 Claves del objeto:', Object.keys(updateData))
    
    handleSubmit(updateData, selectedUser.id)
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">🔧 Diagnóstico de Actualización de Usuarios</h1>
      
      <ToastNotifier ref={toastRef} />

      <div className="row">
        <div className="col-12">
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              Propósito de esta página
            </h6>
            <p className="mb-0">
              Esta página te ayuda a diagnosticar problemas al actualizar usuarios, especialmente 
              cuando cambias roles. Selecciona un usuario, cambia su rol y observa cualquier error.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Usuarios Disponibles</h5>
            </div>
            <div className="card-body">
              {loadingUsers && (
                <div className="d-flex align-items-center gap-2">
                  <div className="spinner-border spinner-border-sm" />
                  <span>Cargando usuarios...</span>
                </div>
              )}

              {usersError && (
                <div className="alert alert-danger">
                  <strong>Error al cargar usuarios:</strong> {usersError}
                </div>
              )}

              {users && users.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol Actual</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr 
                          key={userItem.id} 
                          className={selectedUser?.id === userItem.id ? 'table-warning' : ''}
                        >
                          <td>{userItem.id}</td>
                          <td>{userItem.name}</td>
                          <td>{userItem.email}</td>
                          <td>
                            <span className={`badge ${
                              userItem.role === 'god' ? 'bg-danger' :
                              userItem.role === 'admin' ? 'bg-warning' :
                              userItem.role === 'tech' ? 'bg-info' :
                              'bg-secondary'
                            }`}>
                              {userItem.role || 'Sin rol'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              userItem.status === 'active' ? 'bg-success' : 'bg-danger'
                            }`}>
                              {userItem.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedUser(userItem)}
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de prueba */}
      {selectedUser && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Prueba de Actualización</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Usuario Seleccionado:</h6>
                    <ul className="list-unstyled">
                      <li><strong>ID:</strong> {selectedUser.id}</li>
                      <li><strong>Nombre:</strong> {selectedUser.name}</li>
                      <li><strong>Email:</strong> {selectedUser.email}</li>
                      <li><strong>Rol actual:</strong> <span className="badge bg-secondary">{selectedUser.role}</span></li>
                      <li><strong>Estado:</strong> <span className="badge bg-info">{selectedUser.status}</span></li>
                    </ul>
                    
                    <h6 className="mt-3">Estructura Completa:</h6>
                    <pre className="bg-light p-2 rounded" style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                      {JSON.stringify(selectedUser, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="col-md-6">
                    <h6>Cambiar Rol:</h6>
                    <div className="mb-3">
                      <select 
                        className="form-select"
                        value={testRole}
                        onChange={(e) => setTestRole(e.target.value)}
                      >
                        <option value="god">God</option>
                        <option value="admin">Admin</option>
                        <option value="tech">Tech</option>
                        <option value="customer">Customer</option>
                        <option value="guest">Guest</option>
                      </select>
                    </div>
                    
                    <button
                      className="btn btn-warning"
                      onClick={handleTestUpdate}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Actualizando...
                        </>
                      ) : (
                        `Cambiar rol a "${testRole}"`
                      )}
                    </button>
                  </div>
                </div>

                {saveError && (
                  <div className="mt-3">
                    <div className="alert alert-danger">
                      <h6 className="alert-heading">Error detectado:</h6>
                      <pre className="mb-0" style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                        {saveError}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-light">
            <h6 className="alert-heading">
              <i className="bi bi-lightbulb me-2"></i>
              Cómo usar esta herramienta
            </h6>
            <ol className="mb-0">
              <li>Selecciona un usuario de la tabla</li>
              <li>Elige un nuevo rol para ese usuario</li>
              <li>Haz clic en &quot;Cambiar rol&quot; y observa si hay errores</li>
              <li>Si hay un error, aparecerá en un cuadro rojo con detalles específicos</li>
              <li>Revisa la consola del navegador (F12) para más información técnica</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}