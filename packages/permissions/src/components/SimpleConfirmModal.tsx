'use client'

interface SimpleConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: 'danger' | 'primary'
}

export default function SimpleConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'primary'
}: SimpleConfirmModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-backdrop fade show" onClick={onCancel}></div>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              disabled={isLoading}
            ></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn btn-${variant}`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading && (
                <span className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </span>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
