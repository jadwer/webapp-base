'use client'

import { useState, useRef } from 'react'
import { Role } from '../types/role'
import { useRoles } from '../hooks/useRoles'
import { useRoleActions } from '../hooks/useRoles'
import { StatusMessage, LwTableWrap, LwIconButton, LwCountPill, getApiErrorMessage } from '@lwm/ui'
import { RoleForm } from './RoleForm'
import { toast } from '@lwm/ui'
import { ConfirmModal, type ConfirmModalHandle } from '@lwm/ui'
import { roleLabel } from '../../utils/roleLabels'

/** Nombre que se lee: la descripcion en espanol; si no hay, el nombre del rol de sistema. */
export const roleDisplayName = (role: Pick<Role, 'name' | 'description'>) => role.description || roleLabel(role.name)

interface RolesTableProps {
  onRoleSelect?: (role: Role) => void
  selectedRole?: Role | null
  /** Busqueda por nombre o descripcion (en el navegador: son pocos roles) */
  search?: string
}

export function RolesTable({ onRoleSelect, selectedRole, search = '' }: RolesTableProps) {
  const { roles, isLoading, error } = useRoles(['permissions'])
  const { deleteRole } = useRoleActions()
  
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    role: Role | null
  }>({ isOpen: false, role: null })

  const handleDelete = async (id: number) => {
    const confirmed = await confirmModalRef.current?.confirm('¿Eliminar este rol? Los usuarios que lo tienen conservan sus permisos directos.', {
      title: 'Eliminar rol',
      confirmText: 'Eliminar',
      confirmVariant: 'danger'
    })
    if (confirmed) {
      try {
        await deleteRole(id)
        // Ya no necesitamos mutate manual, useRoleActions lo hace automáticamente
      } catch (err) {
        toast.error(`No se pudo eliminar el rol: ${getApiErrorMessage(err, 'intenta de nuevo')}`)
      }
    }
  }

  const handleEdit = (role: Role) => {
    setEditModal({ isOpen: true, role })
  }

  const handleEditSuccess = () => {
    // Ya no necesitamos mutate manual, useRoleActions lo hace automáticamente
    setEditModal({ isOpen: false, role: null })
  }

  const term = search.trim().toLowerCase()
  const visible = term
    ? roles.filter((r) => `${r.name} ${roleDisplayName(r)}`.toLowerCase().includes(term))
    : roles

  if (error) {
    return (
      <StatusMessage
        type="danger"
        message="No se pudieron cargar los roles. Intenta recargar la página."
      />
    )
  }

  return (
    <>
      <LwTableWrap>
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th className="text-center">No</th>
              <th>Nombre</th>
              <th className="text-center">Permisos</th>
              <th>Fecha de creación</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center text-muted py-4">Cargando roles…</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted py-4">{term ? 'No se encontró ningún rol con esa búsqueda' : 'Todavía no hay roles'}</td></tr>
            ) : visible.map((role, i) => (
              <tr key={role.id} className={selectedRole?.id === role.id ? 'table-active' : undefined}>
                <td className="text-center text-muted">{String(i + 1).padStart(2, '0')}</td>
                <td>
                  {/* El nombre es un identificador de codigo (customer, guest); lo que se lee es la descripcion */}
                  <div>{roleDisplayName(role)}</div>
                  <div className="small text-muted">{role.name}</div>
                </td>
                <td className="text-center"><LwCountPill>{role.permissions?.length || 0} permisos</LwCountPill></td>
                <td className="text-nowrap">{role.created_at ? new Date(role.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</td>
                <td className="text-center text-nowrap">
                  {onRoleSelect ? <LwIconButton icon="bi-toggles" label={`Permisos del rol ${roleDisplayName(role)}`} onClick={() => onRoleSelect(role)} /> : null}
                  <LwIconButton icon="bi-pencil" label={`Editar rol ${roleDisplayName(role)}`} onClick={() => handleEdit(role)} />
                  <LwIconButton icon="bi-trash" label={`Eliminar rol ${roleDisplayName(role)}`} onClick={() => handleDelete(role.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </LwTableWrap>

      <ConfirmModal ref={confirmModalRef} />

      {/* Modal para editar rol */}
      {editModal.isOpen && editModal.role && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar rol</h5>
                <button
                  aria-label="Cerrar"
                  type="button"
                  className="btn-close"
                  onClick={() => setEditModal({ isOpen: false, role: null })}
                ></button>
              </div>
              <div className="modal-body">
                <RoleForm
                  role={editModal.role}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditModal({ isOpen: false, role: null })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
