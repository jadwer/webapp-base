'use client'

import React, { useState } from 'react'
import { usePurchaseOrderMutations, usePurchaseContacts } from '@/modules/purchase'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { ItemsManager } from '@/modules/purchase'
import { formatCurrency } from '@/lib/formatters'
import { BranchSelect } from '@lwm/auth'
import { todayDateInput } from '@lwm/ui'

interface Contact {
  id: string | number
  name?: string
  attributes?: {
    name?: string
    isSupplier?: boolean
  }
  isSupplier?: boolean
}

interface OrderItem {
  tempId: string
  productId: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  noCharge?: boolean
}

export default function CreatePurchaseOrderPage() {
  const navigation = useNavigationProgress()
  const { createPurchaseOrderWithItems } = usePurchaseOrderMutations()
  const { contacts, isLoading: contactsLoading } = usePurchaseContacts()

  const [formData, setFormData] = useState({
    contactId: '',
    orderNumber: '',
    orderDate: todayDateInput(),
    status: 'pending' as 'pending' | 'approved' | 'received' | 'cancelled',
    notes: '',
    branchId: ''
  })

  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (orderItems.length === 0) {
      setError('Debes agregar al menos un item a la orden')
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    try {
      // Alta atomica: el servidor crea la orden y sus partidas en una
      // transaccion y calcula el total (hallazgo Atomo 22-10).
      const created = await createPurchaseOrderWithItems({
        contactId: formData.contactId,
        orderDate: formData.orderDate,
        status: formData.status,
        notes: formData.notes,
        branchId: formData.branchId,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          noCharge: item.noCharge,
        })),
      })

      navigation.push(`/dashboard/purchase/${created.id}`)

    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setError(error.response?.data?.message || error.message || 'Error al crear la orden de compra')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-plus-circle me-3"></i>
                Nueva Orden de Compra
              </h1>
              <p className="text-muted">
                Crear una nueva orden de compra para un proveedor
              </p>
            </div>
            <button 
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigation.back()}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <form onSubmit={handleSubmit}>
            {/* Información básica de la orden */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-file-earmark-plus me-2"></i>
                  Información de la Orden de Compra
                </h5>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
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
                      {contacts?.map((contact: Contact) => (
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
                      Número de Orden
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      className="form-control"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      placeholder="Se generará automáticamente si se deja vacío"
                    />
                    <small className="text-muted">
                      Opcional: se generará automáticamente si no se especifica
                    </small>
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
                      <option value="received">Recibida</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <BranchSelect
                      id="branchId"
                      value={formData.branchId}
                      onChange={(branchId) => setFormData(prev => ({ ...prev, branchId }))}
                    />
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
              </div>
            </div>

            {/* Items Manager */}
            <div className="mb-4">
              <ItemsManager
                items={orderItems}
                onItemsChange={setOrderItems}
                onTotalChange={setTotalAmount}
              />
            </div>

            {/* Total y Botones */}
            <div className="card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0 me-3">Total de la Orden:</h5>
                      <h3 className="mb-0 text-success">{formatCurrency(totalAmount)}</h3>
                    </div>
                    <small className="text-muted">
                      {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} agregado{orderItems.length !== 1 ? 's' : ''}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigation.back()}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !formData.contactId || orderItems.length === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Creando Orden...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Crear Orden Completa
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}