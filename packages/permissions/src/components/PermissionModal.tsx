'use client'

import { Permission, PermissionFormData } from '../types/permission'
import PermissionForm from './PermissionForm'

interface PermissionModalProps {
  isOpen: boolean
  permission?: Permission | null
  onClose: () => void
  onSubmit: (data: PermissionFormData) => Promise<void>
  isSubmitting: boolean
}

export default function PermissionModal({ 
  isOpen, 
  permission, 
  onClose, 
  onSubmit, 
  isSubmitting 
}: PermissionModalProps) {
  if (!isOpen) return null

  const handleSubmit = async (data: PermissionFormData) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-key me-2"></i>
              {permission ? 'Editar Permiso' : 'Crear Nuevo Permiso'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>
          <div className="modal-body">
            <PermissionForm
              permission={permission}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
