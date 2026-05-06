'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button, Input } from '@/ui/components/base'
import { usePurchaseContacts } from '../hooks'
import ItemsManager from './ItemsManager'
import type { PurchaseOrder, PurchaseOrderFormData, PurchaseOrderStatus } from '../types'

interface OrderItem {
  tempId: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder
  isLoading?: boolean
  onSubmit: (data: PurchaseOrderFormData) => Promise<void>
  onCancel?: () => void
}

const ORDER_STATUSES: { value: PurchaseOrderStatus; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'received', label: 'Recibida' },
  { value: 'cancelled', label: 'Cancelada' },
]

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrder,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    contactId: purchaseOrder?.contactId?.toString() || '',
    orderNumber: purchaseOrder?.orderNumber || '',
    orderDate: purchaseOrder?.orderDate || new Date().toISOString().split('T')[0],
    status: (purchaseOrder?.status || 'draft') as PurchaseOrderStatus,
    notes: purchaseOrder?.notes || '',
    invoicingNotes: purchaseOrder?.invoicingNotes || ''
  })

  const [items, setItems] = useState<OrderItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const { contacts, isLoading: contactsLoading } = usePurchaseContacts()

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        contactId: purchaseOrder.contactId?.toString() || '',
        orderNumber: purchaseOrder.orderNumber || '',
        orderDate: purchaseOrder.orderDate || new Date().toISOString().split('T')[0],
        status: purchaseOrder.status || 'draft',
        notes: purchaseOrder.notes || '',
        invoicingNotes: purchaseOrder.invoicingNotes || ''
      })
    }
  }, [purchaseOrder])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.contactId) {
      newErrors.contactId = 'El proveedor es requerido'
    }

    if (!formData.orderNumber.trim()) {
      newErrors.orderNumber = 'El numero de orden es requerido'
    }

    if (!formData.orderDate) {
      newErrors.orderDate = 'La fecha de orden es requerida'
    }

    if (items.length === 0) {
      newErrors.items = 'Debe agregar al menos un item a la orden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleItemsChange = useCallback((newItems: OrderItem[]) => {
    setItems(newItems)
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }))
    }
  }, [errors.items])

  const handleTotalChange = useCallback((total: number) => {
    setTotalAmount(total)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    const submitData: PurchaseOrderFormData = {
      contactId: parseInt(formData.contactId),
      orderNumber: formData.orderNumber,
      orderDate: formData.orderDate,
      status: formData.status,
      notes: formData.notes || undefined,
      items: items.map(item => ({
        id: '',
        purchaseOrderId: purchaseOrder ? parseInt(purchaseOrder.id) : 0,
        productId: parseInt(item.productId),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.quantity * item.unitPrice,
        total: item.total,
        apInvoiceLineId: null,
        invoicedQuantity: null,
        invoicedAmount: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    }

    await onSubmit(submitData)
  }

  const isFormLoading = isLoading || contactsLoading

  // Generate order number if empty
  useEffect(() => {
    if (!purchaseOrder && !formData.orderNumber) {
      const timestamp = Date.now().toString().slice(-6)
      setFormData(prev => ({ ...prev, orderNumber: `PO-${timestamp}` }))
    }
  }, [purchaseOrder, formData.orderNumber])

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-lg-8">
          {/* Order Information Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informacion de la Orden de Compra
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    label="Proveedor"
                    type="select"
                    value={formData.contactId}
                    onChange={(e) => handleInputChange('contactId', e.target.value)}
                    onBlur={() => handleBlur('contactId')}
                    errorText={touched.contactId ? errors.contactId : ''}
                    required
                    disabled={isFormLoading}
                    options={[
                      { value: '', label: 'Seleccione un proveedor' },
                      ...contacts.map((contact: { id: string; attributes?: { name?: string } }) => ({
                        value: contact.id,
                        label: contact.attributes?.name || `Proveedor #${contact.id}`
                      }))
                    ]}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Numero de Orden"
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                    onBlur={() => handleBlur('orderNumber')}
                    errorText={touched.orderNumber ? errors.orderNumber : ''}
                    required
                    placeholder="PO-XXXXXX"
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Fecha de Orden"
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                    onBlur={() => handleBlur('orderDate')}
                    errorText={touched.orderDate ? errors.orderDate : ''}
                    required
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Estado"
                    type="select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    onBlur={() => handleBlur('status')}
                    disabled={isFormLoading}
                    options={ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                  />
                </div>

                <div className="col-12">
                  <Input
                    label="Notas"
                    type="textarea"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    onBlur={() => handleBlur('notes')}
                    placeholder="Notas adicionales sobre la orden de compra..."
                    disabled={isFormLoading}
                  />
                </div>

                <div className="col-12">
                  <Input
                    label="Notas de Facturacion"
                    type="textarea"
                    value={formData.invoicingNotes}
                    onChange={(e) => handleInputChange('invoicingNotes', e.target.value)}
                    onBlur={() => handleBlur('invoicingNotes')}
                    placeholder="Instrucciones especiales para facturacion..."
                    disabled={isFormLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Manager */}
          <div className="mb-4">
            {errors.items && touched.contactId && (
              <div className="alert alert-danger mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {errors.items}
              </div>
            )}
            <ItemsManager
              items={items}
              onItemsChange={handleItemsChange}
              onTotalChange={handleTotalChange}
            />
          </div>
        </div>

        <div className="col-lg-4">
          {/* Order Summary Card */}
          <div className="card sticky-top" style={{ top: '1rem' }}>
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-calculator me-2"></i>
                Resumen de Orden
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Items:</span>
                <span className="fw-bold">{items.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span className="fw-bold">${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fs-5">Total:</span>
                <span className="fs-4 fw-bold text-primary">
                  ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="card-footer">
              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={isFormLoading}
                >
                  <i className="bi bi-check-lg me-2" />
                  {purchaseOrder ? 'Actualizar Orden' : 'Crear Orden'}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PurchaseOrderForm
