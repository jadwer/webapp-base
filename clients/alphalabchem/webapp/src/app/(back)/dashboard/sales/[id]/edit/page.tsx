/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import { useState, useEffect, use } from 'react'
import { useSalesOrder, useSalesOrderMutations, useSalesContacts } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { toast } from '@/lib/toast'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditSalesOrderPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const navigation = useNavigationProgress()
  
  const { salesOrder, isLoading, error } = useSalesOrder(resolvedParams.id)
  const { updateSalesOrder } = useSalesOrderMutations()
  const { contacts, isLoading: contactsLoading } = useSalesContacts()

  const [formData, setFormData] = useState({
    contactId: '',
    orderNumber: '',
    orderDate: '',
    // Valores validos del backend (SalesOrderRequest Rule::in)
    status: 'draft' as 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize form data when salesOrder loads
  useEffect(() => {
    if (salesOrder) {
      setFormData({
        contactId: salesOrder.contactId?.toString() || '',
        orderNumber: salesOrder.orderNumber || '',
        // El backend regresa ISO datetime; el input date requiere YYYY-MM-DD
        orderDate: salesOrder.orderDate ? salesOrder.orderDate.substring(0, 10) : '',
        status: salesOrder.status || 'draft',
        notes: salesOrder.notes || ''
      })
    }
  }, [salesOrder])

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

      await updateSalesOrder(resolvedParams.id, orderData)

      toast.success('Orden de venta actualizada correctamente')

      // Navigate back to the order detail page
      navigation.push(`/dashboard/sales/${resolvedParams.id}`)

    } catch (err) {
      console.error('Error updating sales order:', err)
      const error = err as {
        response?: { data?: { message?: string; errors?: Array<{ detail?: string; title?: string }> } }
        message?: string
      }
      // JSON:API devuelve errors[].detail; fallback a message generico
      const jsonApiDetail = error.response?.data?.errors
        ?.map(e => e.detail || e.title)
        .filter(Boolean)
        .join('. ')
      const message = jsonApiDetail || error.response?.data?.message || error.message || 'Error al actualizar la orden de venta'
      setSubmitError(message)
      toast.error(message)
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
                Modificar la información de la orden de venta
              </p>
            </div>
            <button 
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigation.push(`/dashboard/sales/${resolvedParams.id}`)}
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
                      Cliente <span className="text-danger">*</span>
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
                      <option value="">Seleccionar cliente...</option>
                      {contacts?.map((contact: Record<string, unknown>) => {
                        const attributes = contact.attributes as Record<string, unknown> | undefined
                        return (
                          <option key={contact.id as string} value={contact.id as string}>
                            {(contact.name as string) || (attributes?.name as string) || `Cliente #${contact.id}`}
                          </option>
                        )
                      })}
                    </select>
                    {contactsLoading && (
                      <small className="text-muted">Cargando clientes...</small>
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
                      <option value="draft">Borrador</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="processing">En proceso</option>
                      <option value="shipped">Enviada</option>
                      <option value="delivered">Entregada</option>
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
                    onClick={() => navigation.push(`/dashboard/sales/${resolvedParams.id}`)}
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
              
              {salesOrder?.contact && (
                <div className="mb-3">
                  <small className="text-muted">Cliente Actual:</small>
                  <div className="fw-bold">{salesOrder.contact.name}</div>
                </div>
              )}
              
              <div className="mb-3">
                <small className="text-muted">Creada:</small>
                <div>{salesOrder?.createdAt ? new Date(salesOrder.createdAt).toLocaleDateString('es-ES') : 'N/A'}</div>
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