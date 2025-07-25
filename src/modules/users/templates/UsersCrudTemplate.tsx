'use client'

import { useRef, useState } from 'react'
import ToastNotifier, { ToastNotifierHandle } from '@/ui/ToastNotifier'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import { useUsers } from '../hooks/useUsers'
import { useUserForm } from '../hooks/useUserForm'
import { deleteUser } from '../services/usersService'
import { User } from '../types/user'
import UserForm from '../components/UserForm'
import UserTable from '../components/UserTable'

export default function UsersCrudTemplate() {
  const { users, loading: loadingUsers, error, refetch } = useUsers()
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const toastRef = useRef<ToastNotifierHandle>(null)
  const confirmRef = useRef<ConfirmModalHandle>(null)

  const { handleSubmit, loading: saving, error: saveError } = useUserForm({
    onSuccess: () => {
      setEditingUser(null)
      refetch()
      toastRef.current?.show('Usuario guardado con éxito', 'success')
    },
  })

  const handleEdit = (user: User) => {
    // Asegurarnos de que tenemos el rol correcto para editar
    const userToEdit = {
      ...user,
      // Si tenemos roles en el array, usar el primero; si no, usar el campo role como fallback
      role: user.roles && user.roles.length > 0 ? user.roles[0].name : user.role
    }
    setEditingUser(userToEdit)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmRef.current?.confirm('¿Estás seguro de eliminar este usuario?')
    if (!confirmed) return

    try {
      await deleteUser(id)
      toastRef.current?.show('Usuario eliminado con éxito', 'success')
      refetch()
    } catch {
      toastRef.current?.show('Error al eliminar el usuario', 'error')
    }
  }

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>

      <ToastNotifier ref={toastRef} />
      <ConfirmModal ref={confirmRef} />

      <div className="row">
        <div className="col-md-6">
          <h4>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
          <UserForm
            initialValues={editingUser || {}}
            onSubmit={(values) => handleSubmit(values, editingUser?.id)}
            loading={saving}
            error={saveError}
          />
          {editingUser && (
            <button 
              className="btn btn-secondary mt-2" 
              onClick={() => setEditingUser(null)}
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="col-md-6">
          <h4>Lista de Usuarios</h4>
          {loadingUsers && <p>Cargando...</p>}
          {error && <p className="text-danger">{error}</p>}
          <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}
