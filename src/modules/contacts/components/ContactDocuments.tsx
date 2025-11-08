/**
 * CONTACT DOCUMENTS COMPONENT
 * Gestión de documentos fiscales y archivos de contactos
 * Subida de archivos, verificación y administración de documentos
 */

'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/ui/components/base/Button'
import type { ContactDocument } from '../types'

interface ContactDocumentsProps {
  contactId?: string
  documents: ContactDocument[]
  onUploadDocument: (file: File, documentType: string, notes?: string) => Promise<void>
  onDeleteDocument: (id: string) => void
  onDownloadDocument: (id: string) => void
  onVerifyDocument?: (id: string) => void
  isLoading?: boolean
  className?: string
}

interface DocumentUploadData {
  documentType: 'tax_certificate' | 'business_license' | 'rfc' | 'other'
  notes: string
  file: File | null
}

const initialUploadForm: DocumentUploadData = {
  documentType: 'rfc',
  notes: '',
  file: null
}

export const ContactDocuments: React.FC<ContactDocumentsProps> = ({
  documents,
  onUploadDocument,
  onDeleteDocument,
  onDownloadDocument,
  onVerifyDocument,
  isLoading = false,
  className = ''
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadData, setUploadData] = useState<DocumentUploadData>(initialUploadForm)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypeLabels = {
    rfc: 'RFC (Registro Federal de Contribuyentes)',
    tax_certificate: 'Certificado de Situación Fiscal',
    business_license: 'Licencia de Funcionamiento',
    other: 'Otro Documento'
  }

  const documentTypeIcons = {
    rfc: 'bi-file-earmark-text',
    tax_certificate: 'bi-file-earmark-check',
    business_license: 'bi-file-earmark-lock',
    other: 'bi-file-earmark'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadData(prev => ({ ...prev, file }))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setUploadData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadData.file) {
      alert('Por favor selecciona un archivo')
      return
    }

    try {
      await onUploadDocument(
        uploadData.file, 
        uploadData.documentType, 
        uploadData.notes || undefined
      )
      
      // Reset form
      setUploadData(initialUploadForm)
      setShowUploadForm(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Error al subir el documento. Inténtalo de nuevo.')
    }
  }

  const handleCancel = () => {
    setShowUploadForm(false)
    setUploadData(initialUploadForm)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (document: ContactDocument) => {
    if (document.verifiedAt) {
      return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Verificado</span>
    }
    if (document.expiresAt && new Date(document.expiresAt) < new Date()) {
      return <span className="badge bg-danger"><i className="bi bi-exclamation-triangle me-1"></i>Vencido</span>
    }
    return <span className="badge bg-warning"><i className="bi bi-clock me-1"></i>Pendiente</span>
  }

  return (
    <div className={`contact-documents ${className}`}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">
            <i className="bi bi-file-earmark-text-fill me-2"></i>
            Documentos Fiscales
          </h5>
          <p className="text-muted small mb-0">
            RFC, constancias fiscales, licencias y otros documentos oficiales
          </p>
        </div>
        {!showUploadForm && (
          <Button 
            variant="primary" 
            size="small"
            onClick={() => setShowUploadForm(true)}
            disabled={isLoading}
          >
            <i className="bi bi-cloud-upload me-1"></i>
            Subir Documento
          </Button>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="mb-4">
          <div className="row g-3">
            {documents.map((document) => (
              <div key={document.id} className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center flex-grow-1">
                        <div className="me-3">
                          <i className={`${documentTypeIcons[document.documentType]} text-primary`} 
                             style={{ fontSize: '2rem' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mb-0">{document.originalFilename}</h6>
                            {getStatusBadge(document)}
                          </div>
                          <p className="text-muted small mb-1">
                            {documentTypeLabels[document.documentType]}
                          </p>
                          <div className="d-flex gap-3 text-muted small">
                            <span>
                              <i className="bi bi-hdd me-1"></i>
                              {formatFileSize(document.fileSize)}
                            </span>
                            <span>
                              <i className="bi bi-calendar-event me-1"></i>
                              {new Date(document.createdAt).toLocaleDateString()}
                            </span>
                            {document.expiresAt && (
                              <span>
                                <i className="bi bi-calendar-x me-1"></i>
                                Vence: {new Date(document.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {document.notes && (
                            <div className="mt-2">
                              <small className="text-muted">
                                <i className="bi bi-chat-left-text me-1"></i>
                                {document.notes}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => onDownloadDocument(document.id)}
                          disabled={isLoading}
                          title="Descargar"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        {onVerifyDocument && !document.verifiedAt && (
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => onVerifyDocument(document.id)}
                            disabled={isLoading}
                            title="Verificar documento"
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => onDeleteDocument(document.id)}
                          disabled={isLoading}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="card border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="card-title mb-0">
              <i className="bi bi-cloud-upload me-2"></i>
              Subir Nuevo Documento
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Document Type */}
                <div className="col-md-6">
                  <label htmlFor="documentType" className="form-label">
                    Tipo de documento <span className="text-danger">*</span>
                  </label>
                  <select
                    id="documentType"
                    className="form-select"
                    value={uploadData.documentType}
                    onChange={(e) => setUploadData(prev => ({
                      ...prev,
                      documentType: e.target.value as DocumentUploadData['documentType']
                    }))}
                    disabled={isLoading}
                    required
                  >
                    <option value="rfc">RFC (Registro Federal de Contribuyentes)</option>
                    <option value="tax_certificate">Certificado de Situación Fiscal</option>
                    <option value="business_license">Licencia de Funcionamiento</option>
                    <option value="other">Otro Documento</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="col-md-6">
                  <label htmlFor="notes" className="form-label">
                    Notas (opcional)
                  </label>
                  <input
                    type="text"
                    id="notes"
                    className="form-control"
                    value={uploadData.notes}
                    onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
                    disabled={isLoading}
                    placeholder="Descripción o notas adicionales..."
                  />
                </div>

                {/* File Upload Area */}
                <div className="col-12">
                  <label className="form-label">
                    Archivo <span className="text-danger">*</span>
                  </label>
                  
                  <div
                    className={`border-2 border-dashed rounded p-4 text-center ${
                      dragOver ? 'border-primary bg-light' : 'border-secondary'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {uploadData.file ? (
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <i className="bi bi-file-earmark-check text-success" style={{ fontSize: '2rem' }}></i>
                        <div className="text-start">
                          <div className="fw-medium">{uploadData.file.name}</div>
                          <div className="text-muted small">
                            {formatFileSize(uploadData.file.size)} • {uploadData.file.type}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setUploadData(prev => ({ ...prev, file: null }))}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h6 className="text-muted">Arrastra y suelta tu archivo aquí</h6>
                        <p className="text-muted small mb-3">
                          o haz clic para seleccionar archivo
                        </p>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Seleccionar Archivo
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="d-none"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={isLoading}
                        />
                        <div className="mt-2 text-muted small">
                          Archivos soportados: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="col-12">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading || !uploadData.file}
                    >
                      <i className="bi bi-cloud-upload me-1"></i>
                      {isLoading ? 'Subiendo...' : 'Subir Documento'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && !showUploadForm && (
        <div className="text-center py-5">
          <i className="bi bi-file-earmark-text text-muted mb-3" style={{ fontSize: '3rem' }}></i>
          <h6 className="text-muted">No hay documentos subidos</h6>
          <p className="text-muted small">
            Sube documentos fiscales como RFC, constancias y licencias para mantener la información actualizada
          </p>
        </div>
      )}
    </div>
  )
}