'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { usePurchaseOrder, usePurchaseOrderMutations, usePurchaseContacts } from '@/modules/purchase'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditPurchaseOrderPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const navigation = useNavigationProgress()
  
  const { purchaseOrder, isLoading, error } = usePurchaseOrder(resolvedParams.id)
  const { updatePurchaseOrder } = usePurchaseOrderMutations()
  const { contacts, isLoading: contactsLoading } = usePurchaseContacts()

  const [formData, setFormData] = useState({
    contactId: '',
    orderNumber: '',
    orderDate: '',
    status: 'pending' as 'pending' | 'processing' | 'received' | 'cancelled' | 'approved',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize form data when purchaseOrder loads
  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        contactId: purchaseOrder.contactId?.toString() || '',
        orderNumber: purchaseOrder.orderNumber || '',
        orderDate: purchaseOrder.orderDate || '',
        status: purchaseOrder.status || 'pending',
        notes: purchaseOrder.notes || ''
      })
    }
  }, [purchaseOrder])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const orderData = {
        ...formData,
        contactId: parseInt(formData.contactId)
      }

      console.log('🚀 Updating purchase order:', orderData)
      await updatePurchaseOrder(resolvedParams.id, orderData)
      
      // Navigate back to the order detail page
      navigation.push(`/dashboard/purchase/${resolvedParams.id}`)
      
    } catch (err: any) {
      console.error('❌ Error updating purchase order:', err)
      setSubmitError(err.response?.data?.message || err.message || 'Error al actualizar la orden de compra')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando orden...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar la orden: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-pencil me-3"></i>
                Editar Orden #{resolvedParams.id}
              </h1>
              <p className="text-muted">
                Modificar la información de la orden de compra
              </p>
            </div>
            <button 
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigation.push(`/dashboard/purchase/${resolvedParams.id}`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a Orden
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Información de la Orden
              </h5>
            </div>
            <div className="card-body">
              {submitError && (
                <div className="alert alert-danger mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="contactId" className="form-label">
                      Proveedor <span className="text-danger">*</span>
                    </label>
                    <select
                      id="contactId"
                      name="contactId"
                      className="form-select"
                      value={formData.contactId}
                      onChange={handleInputChange}
                      required
                      disabled={contactsLoading}
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {contacts?.map((contact: any) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name || contact.attributes?.name || `Proveedor #${contact.id}`}
                        </option>
                      ))}
                    </select>
                    {contactsLoading && (
                      <small className="text-muted">Cargando proveedores...</small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="orderNumber" className="form-label">
                      Número de Orden <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      className="form-control"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="orderDate" className="form-label">
                      Fecha de Orden <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="orderDate"
                      name="orderDate"
                      className="form-control"
                      value={formData.orderDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label">
                      Estado <span className="text-danger">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pending">Pendiente</option>
                      <option value="approved">Aprobada</option>
                      <option value="processing">En Proceso</option>
                      <option value="received">Recibida</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="notes" className="form-label">
                      Notas
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      className="form-control"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Notas adicionales sobre la orden..."
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigation.push(`/dashboard/purchase/${resolvedParams.id}`)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !formData.contactId}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información de la Orden
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">ID de Orden:</small>
                <div className="fw-bold">#{resolvedParams.id}</div>
              </div>
              
              {purchaseOrder?.contact && (
                <div className="mb-3">
                  <small className="text-muted">Proveedor Actual:</small>
                  <div className="fw-bold">{purchaseOrder.contact.name}</div>
                </div>
              )}
              
              <div className="mb-3">
                <small className="text-muted">Creada:</small>
                <div>{purchaseOrder?.createdAt ? new Date(purchaseOrder.createdAt).toLocaleDateString('es-ES') : 'N/A'}</div>
              </div>
              
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <i className="bi bi-lightbulb me-1"></i>
                  <strong>Tip:</strong> Los cambios se aplicarán inmediatamente. Puedes modificar los items desde la página de detalle de la orden.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}