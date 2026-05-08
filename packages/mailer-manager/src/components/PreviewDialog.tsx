'use client'

interface PreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  subject: string
  html: string
}

export default function PreviewDialog({ isOpen, onClose, subject, html }: PreviewDialogProps) {
  if (!isOpen) return null

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye me-2"></i>
              Vista Previa
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-0">
            <div className="bg-light border-bottom px-3 py-2">
              <small className="text-muted">Asunto:</small>
              <strong className="ms-2">{subject}</strong>
            </div>
            <div style={{ height: '70vh', overflow: 'auto' }}>
              <iframe
                srcDoc={html}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
