/**
 * CONTACT VIEW WITH TABS
 * Visualización completa de contactos con pestañas para entidades relacionadas
 * Incluye: Datos básicos, Direcciones, Documentos y Personas de contacto
 */

'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/ui/components/base/Button'
import ConfirmModal, { type ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import type { 
  ContactParsed,
  ContactAddress,
  ContactDocument,
  ContactPerson
} from '../types'

interface ContactViewTabsProps {
  contact: ContactParsed
  addresses?: ContactAddress[]
  documents?: ContactDocument[]
  people?: ContactPerson[]
  onEdit: () => void
  onDelete?: () => void
  className?: string
}

type TabType = 'basic' | 'addresses' | 'documents' | 'people'

// Helper function to extract error message from unknown error
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message || 'Error del servidor'
  }
  return 'Error desconocido'
}

export const ContactViewTabs: React.FC<ContactViewTabsProps> = ({
  contact,
  addresses = [],
  documents = [],
  people = [],
  onEdit,
  onDelete,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  
  // Data is now passed from parent component using includes
  const isLoading = false

  const tabs = [
    {
      id: 'basic' as TabType,
      label: 'Datos Básicos',
      icon: 'bi-person-circle',
      count: null
    },
    {
      id: 'addresses' as TabType,
      label: 'Direcciones',
      icon: 'bi-geo-alt-fill',
      count: addresses.length
    },
    {
      id: 'documents' as TabType,
      label: 'Documentos',
      icon: 'bi-file-earmark-text-fill',
      count: documents.length
    },
    {
      id: 'people' as TabType,
      label: 'Personas',
      icon: 'bi-people-fill',
      count: people.length
    }
  ]

  const renderBasicInfo = () => (
    <div className="row g-4">
      {/* Basic Info */}
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Información básica
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <strong>Nombre:</strong>
                <div>{contact.displayName}</div>
              </div>
              {contact.legalName && contact.legalName !== contact.name && (
                <div className="col-12">
                  <strong>{contact.contactType === 'company' ? 'Razón social:' : 'Nombre legal:'}</strong>
                  <div>{contact.legalName}</div>
                </div>
              )}
              <div className="col-12">
                <strong>Tipo:</strong>
                <div>{contact.contactTypeLabel}</div>
              </div>
              <div className="col-12">
                <strong>Estado:</strong>
                <div>
                  <span className={`badge bg-${contact.status === 'active' ? 'success' : contact.status === 'inactive' ? 'secondary' : 'danger'}`}>
                    {contact.statusLabel}
                  </span>
                </div>
              </div>
              {contact.taxId && (
                <div className="col-12">
                  <strong>RFC / Tax ID:</strong>
                  <div className="font-monospace">{contact.taxId}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-telephone me-2"></i>
              Información de contacto
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <strong>Email:</strong>
                <div>
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-decoration-none">
                      <i className="bi bi-envelope me-1"></i>
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-muted">No registrado</span>
                  )}
                </div>
              </div>
              <div className="col-12">
                <strong>Teléfono:</strong>
                <div>
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="text-decoration-none">
                      <i className="bi bi-telephone me-1"></i>
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-muted">No registrado</span>
                  )}
                </div>
              </div>
              <div className="col-12">
                <strong>Sitio web:</strong>
                <div>
                  {contact.website ? (
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      <i className="bi bi-globe me-1"></i>
                      {contact.website}
                    </a>
                  ) : (
                    <span className="text-muted">No registrado</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-briefcase me-2"></i>
              Información comercial
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <strong>Tipo de relación:</strong>
                <div>
                  {contact.isCustomer && (
                    <span className="badge bg-primary me-2">Cliente</span>
                  )}
                  {contact.isSupplier && (
                    <span className="badge bg-success me-2">Proveedor</span>
                  )}
                  {!contact.isCustomer && !contact.isSupplier && (
                    <span className="badge bg-secondary">Solo contacto</span>
                  )}
                </div>
              </div>
              {contact.classification && (
                <div className="col-12">
                  <strong>Clasificación:</strong>
                  <div>
                    <span className="badge bg-light text-dark border">
                      {contact.classification}
                    </span>
                  </div>
                </div>
              )}
              {contact.paymentTerms && (
                <div className="col-12">
                  <strong>Términos de pago:</strong>
                  <div>{contact.paymentTerms} días</div>
                </div>
              )}
              {contact.creditLimit && (
                <div className="col-12">
                  <strong>Límite de crédito:</strong>
                  <div>${contact.creditLimit.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {contact.notes && (
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-journal-text me-2"></i>
                Notas
              </h5>
            </div>
            <div className="card-body">
              <p className="mb-0">{contact.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderAddresses = () => (
    <div className="row">
      <div className="col-12">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border mb-3" role="status" aria-hidden="true"></div>
            <p className="text-muted">Cargando direcciones...</p>
          </div>
        ) : addresses && addresses.length > 0 ? (
          <div className="row g-4">
            {addresses.map((address) => (
              <div key={address.id} className="col-md-6">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">
                        <i className="bi bi-geo-alt me-2"></i>
                        {address.addressType ? 
                          address.addressType.charAt(0).toUpperCase() + address.addressType.slice(1) :
                          'Dirección'
                        }
                      </h6>
                      {address.isDefault && (
                        <span className="badge bg-primary ms-2">Principal</span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="small text-muted">
                      {address.addressLine1}<br />
                      {address.addressLine2 && <>{address.addressLine2}<br /></>}
                      {address.city}, {address.state} {address.postalCode}<br />
                      {address.country}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-geo-alt fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">No hay direcciones registradas</h5>
            <p className="text-muted">Las direcciones se pueden agregar en el modo de edición.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="row">
      <div className="col-12">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border mb-3" role="status" aria-hidden="true"></div>
            <p className="text-muted">Cargando documentos...</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="row g-4">
            {documents.map((document) => (
              <div key={document.id} className="col-md-6">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        {document.originalFilename}
                      </h6>
                      <small className="text-muted">{document.documentType}</small>
                    </div>
                    <div>
                      {document.verifiedAt ? (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Verificado
                        </span>
                      ) : (
                        <span className="badge bg-warning">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="small text-muted">
                      <div>Tamaño: {(document.fileSize / 1024).toFixed(1)} KB</div>
                      <div>Tipo: {document.mimeType}</div>
                      {document.notes && <div>Notas: {document.notes}</div>}
                      <div>Subido: {new Date(document.createdAt).toLocaleDateString()}</div>
                      {document.verifiedAt && (
                        <div className="text-success mt-1">
                          <i className="bi bi-check-circle me-1"></i>
                          Verificado el {new Date(document.verifiedAt).toLocaleDateString()}
                        </div>
                      )}
                      {document.expiresAt && (
                        <div className="text-warning mt-1">
                          <i className="bi bi-calendar-x me-1"></i>
                          Expira: {new Date(document.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 d-flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={async () => {
                          try {
                            // Use documented view endpoint with Bearer token
                            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
                            // Use the same token key as axiosClient (access_token)
                            const token = localStorage.getItem('access_token') || ''

                            if (!token) {
                              throw new Error('No se encontró token de autenticación. Por favor inicia sesión nuevamente.')
                            }
                            
                            const response = await fetch(`${baseUrl}/api/v1/contact-documents/${document.id}/view`, {
                              method: 'GET',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/pdf, image/*, */*'
                                // Remove Content-Type for GET requests - not needed
                              },
                              mode: 'cors',
                              credentials: 'omit'
                            })

                            if (!response.ok) {
                              // Try to get error details from response
                              let errorMessage = `HTTP ${response.status}: ${response.statusText}`
                              try {
                                const errorData = await response.text()
                                errorMessage += ` - ${errorData.substring(0, 200)}`
                              } catch {
                                // error reading response body
                              }
                              throw new Error(errorMessage)
                            }
                            
                            // Verificar que el contenido sea realmente un PDF/documento
                            const contentType = response.headers.get('content-type') || ''
                            
                            if (contentType.includes('text/html')) {
                              // Si recibimos HTML, es probablemente una página de error
                              throw new Error('El servidor devolvió una página web en lugar del documento')
                            }
                            
                            const blob = await response.blob()
                            const url = URL.createObjectURL(blob)
                            
                            // Open in new window
                            const newWindow = window.open(url, '_blank')
                            if (!newWindow) {
                              // Use professional modal instead of alert
                              await confirmModalRef.current?.confirm(
                                'No se pudo abrir el documento en una nueva ventana. Por favor permite ventanas emergentes para ver documentos.',
                                {
                                  title: 'Ventanas emergentes bloqueadas',
                                  confirmText: 'Entendido',
                                  confirmVariant: 'primary',
                                  icon: <i className="bi bi-exclamation-triangle text-warning" />,
                                  size: 'medium'
                                }
                              )
                              URL.revokeObjectURL(url)
                              return
                            }
                            
                            // Clean up URL after window loads
                            newWindow.addEventListener('load', () => {
                              setTimeout(() => URL.revokeObjectURL(url), 1000)
                            })

                          } catch (error: unknown) {
                            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

                            // Use professional modal for errors
                            await confirmModalRef.current?.confirm(
                              `No se pudo abrir el documento "${document.originalFilename}". ${errorMessage}`,
                              {
                                title: 'Error al abrir documento',
                                confirmText: 'Entendido',
                                confirmVariant: 'danger',
                                icon: <i className="bi bi-exclamation-circle text-danger" />,
                                size: 'medium'
                              }
                            )
                          }
                        }}
                      >
                        <i className="bi bi-eye me-2"></i>
                        Ver documento
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={async () => {
                          try {
                            // Use documented download endpoint with Bearer token
                            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
                            // Use the same token key as axiosClient (access_token)
                            const token = localStorage.getItem('access_token') || ''

                            if (!token) {
                              throw new Error('No se encontró token de autenticación. Por favor inicia sesión nuevamente.')
                            }
                            
                            const response = await fetch(`${baseUrl}/api/v1/contact-documents/${document.id}/download`, {
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': '*/*'
                              }
                            })

                            if (!response.ok) {
                              // Try to get error details from response
                              let errorMessage = `HTTP ${response.status}: ${response.statusText}`
                              try {
                                const errorData = await response.text()
                                errorMessage += ` - ${errorData.substring(0, 200)}`
                              } catch {
                                // error reading response body
                              }
                              throw new Error(errorMessage)
                            }
                            
                            const blob = await response.blob()
                            const url = URL.createObjectURL(blob)
                            
                            // Create download link using window.document to avoid naming conflict
                            const downloadLink = window.document.createElement('a')
                            downloadLink.href = url
                            downloadLink.download = document.originalFilename || 'documento'
                            window.document.body.appendChild(downloadLink)
                            downloadLink.click()
                            window.document.body.removeChild(downloadLink)
                            
                            // Clean up
                            URL.revokeObjectURL(url)

                          } catch (error: unknown) {
                            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

                            // Use professional modal for download errors
                            await confirmModalRef.current?.confirm(
                              `No se pudo descargar el documento "${document.originalFilename}". ${errorMessage}`,
                              {
                                title: 'Error al descargar documento',
                                confirmText: 'Entendido',
                                confirmVariant: 'danger',
                                icon: <i className="bi bi-exclamation-circle text-danger" />,
                                size: 'medium'
                              }
                            )
                          }
                        }}
                      >
                        <i className="bi bi-download me-2"></i>
                        Descargar
                      </Button>
                      {!document.verifiedAt ? (
                        <Button
                          variant="success"
                          size="small"
                          onClick={async () => {
                            try {
                              // Professional confirmation modal
                              const shouldVerify = await confirmModalRef.current?.confirm(
                                `¿Estás seguro de que quieres verificar este documento?\n\n"${document.originalFilename}"\n\nEsta acción marcará el documento como verificado y activo.`,
                                {
                                  title: 'Verificar documento',
                                  confirmText: 'Verificar',
                                  cancelText: 'Cancelar',
                                  confirmVariant: 'success',
                                  icon: <i className="bi bi-check-circle text-success" />,
                                  size: 'medium'
                                }
                              )
                              
                              if (!shouldVerify) {
                                return
                              }
                              
                              // Import the service dynamically to avoid circular dependencies
                              const { contactDocumentsService } = await import('@/modules/contacts/services')
                              
                              const result = await contactDocumentsService.verify(document.id)

                              // Show success message with details
                              await confirmModalRef.current?.confirm(
                                `Documento verificado exitosamente.\n\nEstado: ${result.data?.attributes?.status}\nVerificado por: Usuario ${result.data?.attributes?.verifiedBy}`,
                                {
                                  title: 'Verificación completada',
                                  confirmText: 'Entendido',
                                  confirmVariant: 'success',
                                  icon: <i className="bi bi-check-circle-fill text-success" />,
                                  size: 'medium'
                                }
                              )
                              
                              // Refresh the page to show updated verification status
                              window.location.reload()
                              
                            } catch (error: unknown) {
                              const errorMessage = getErrorMessage(error)

                              // Show user-friendly error message
                              await confirmModalRef.current?.confirm(
                                `Error al verificar documento: ${errorMessage}`,
                                {
                                  title: 'Error en verificación',
                                  confirmText: 'Entendido',
                                  confirmVariant: 'danger',
                                  icon: <i className="bi bi-exclamation-circle text-danger" />,
                                  size: 'medium'
                                }
                              )
                            }
                          }}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Verificar
                        </Button>
                      ) : (
                        <Button
                          variant="warning"
                          size="small"
                          onClick={async () => {
                            try {
                              // Professional confirmation modal for unverify
                              const shouldUnverify = await confirmModalRef.current?.confirm(
                                `¿Estás seguro de que quieres quitar la verificación de este documento?\n\n"${document.originalFilename}"\n\nEsta acción marcará el documento como no verificado.`,
                                {
                                  title: 'Quitar verificación',
                                  confirmText: 'Quitar verificación',
                                  cancelText: 'Cancelar',
                                  confirmVariant: 'warning',
                                  icon: <i className="bi bi-exclamation-triangle text-warning" />,
                                  size: 'medium'
                                }
                              )
                              
                              if (!shouldUnverify) {
                                return
                              }
                              
                              // Import the service dynamically
                              const { contactDocumentsService } = await import('@/modules/contacts/services')
                              
                              await contactDocumentsService.unverify(document.id)

                              // Show success message
                              await confirmModalRef.current?.confirm(
                                `Verificación removida exitosamente.\n\nEl documento ahora está marcado como no verificado.`,
                                {
                                  title: 'Verificación removida',
                                  confirmText: 'Entendido',
                                  confirmVariant: 'success',
                                  icon: <i className="bi bi-check-circle-fill text-success" />,
                                  size: 'medium'
                                }
                              )
                              
                              // Refresh the page to show updated status
                              window.location.reload()
                              
                            } catch (error: unknown) {
                              const errorMessage = getErrorMessage(error)

                              // Show user-friendly error message
                              await confirmModalRef.current?.confirm(
                                `Error al quitar verificación: ${errorMessage}`,
                                {
                                  title: 'Error al quitar verificación',
                                  confirmText: 'Entendido',
                                  confirmVariant: 'danger',
                                  icon: <i className="bi bi-exclamation-circle text-danger" />,
                                  size: 'medium'
                                }
                              )
                            }
                          }}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Quitar verificación
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-file-earmark-text fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">No hay documentos registrados</h5>
            <p className="text-muted">Los documentos se pueden agregar en el modo de edición.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderPeople = () => (
    <div className="row">
      <div className="col-12">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border mb-3" role="status" aria-hidden="true"></div>
            <p className="text-muted">Cargando personas...</p>
          </div>
        ) : people && people.length > 0 ? (
          <div className="row g-4">
            {people.map((person) => (
              <div key={person.id} className="col-md-6">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">
                        <i className="bi bi-person me-2"></i>
                        {person.name}
                      </h6>
                      {person.isPrimary && (
                        <span className="badge bg-primary">Principal</span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="small">
                      {person.position && <div><strong>Cargo:</strong> {person.position}</div>}
                      {person.department && <div><strong>Departamento:</strong> {person.department}</div>}
                      {person.email && (
                        <div>
                          <strong>Email:</strong> 
                          <a href={`mailto:${person.email}`} className="text-decoration-none ms-1">
                            {person.email}
                          </a>
                        </div>
                      )}
                      {person.phone && (
                        <div>
                          <strong>Teléfono:</strong>
                          <a href={`tel:${person.phone}`} className="text-decoration-none ms-1">
                            {person.phone}
                          </a>
                        </div>
                      )}
                      {person.mobile && (
                        <div>
                          <strong>Móvil:</strong>
                          <a href={`tel:${person.mobile}`} className="text-decoration-none ms-1">
                            {person.mobile}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-people fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">No hay personas de contacto registradas</h5>
            <p className="text-muted">Las personas de contacto se pueden agregar en el modo de edición.</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`contact-view-tabs ${className}`}>
      {/* Navigation Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item" role="presentation">
              <button
                className={`nav-link d-flex align-items-center gap-2 ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                type="button"
                role="tab"
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon} aria-hidden="true"></i>
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="badge bg-primary rounded-pill ms-1">
                    {tab.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Datos Básicos Tab */}
        {activeTab === 'basic' && (
          <div className="tab-pane fade show active">
            {renderBasicInfo()}
            
            {/* Edit Button */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              {onDelete && (
                <Button
                  variant="danger"
                  onClick={onDelete}
                >
                  <i className="bi bi-trash me-2"></i>
                  Eliminar
                </Button>
              )}
              <Button
                variant="primary"
                onClick={onEdit}
              >
                <i className="bi bi-pencil me-2"></i>
                Editar Contacto
              </Button>
            </div>
          </div>
        )}

        {/* Direcciones Tab */}
        {activeTab === 'addresses' && (
          <div className="tab-pane fade show active">
            {renderAddresses()}
          </div>
        )}

        {/* Documentos Tab */}
        {activeTab === 'documents' && (
          <div className="tab-pane fade show active">
            {renderDocuments()}
          </div>
        )}

        {/* Personas Tab */}
        {activeTab === 'people' && (
          <div className="tab-pane fade show active">
            {renderPeople()}
          </div>
        )}
      </div>
      
      {/* Professional Modal for confirmations and messages */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}