'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button, Input } from '@/ui/components/base'
import { useSalesContacts } from '../hooks'
import ItemsManager from './ItemsManager'
import type { SalesOrder, SalesOrderFormData, OrderStatus } from '../types'

interface OrderItem {
  tempId: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface SalesOrderFormProps {
  salesOrder?: SalesOrder
  isLoading?: boolean
  onSubmit: (data: SalesOrderFormData) => Promise<void>
  onCancel?: () => void
}

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped', label: 'Enviada' },
  { value: 'delivered', label: 'Entregada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  salesOrder,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    contactId: salesOrder?.contactId?.toString() || '',
    orderNumber: salesOrder?.orderNumber || '',
    orderDate: salesOrder?.orderDate || new Date().toISOString().split('T')[0],
    status: (salesOrder?.status || 'draft') as OrderStatus,
    notes: salesOrder?.notes || '',
    invoicingNotes: salesOrder?.invoicingNotes || ''
  })

  const [items, setItems] = useState<OrderItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const { contacts, isLoading: contactsLoading } = useSalesContacts()

  useEffect(() => {
    if (salesOrder) {
      setFormData({
        contactId: salesOrder.contactId?.toString() || '',
        orderNumber: salesOrder.orderNumber || '',
        orderDate: salesOrder.orderDate || new Date().toISOString().split('T')[0],
        status: salesOrder.status || 'draft',
        notes: salesOrder.notes || '',
        invoicingNotes: salesOrder.invoicingNotes || ''
      })
    }
  }, [salesOrder])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.contactId) {
      newErrors.contactId = 'El cliente es requerido'
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

    const submitData: SalesOrderFormData = {
      contactId: parseInt(formData.contactId),
      orderNumber: formData.orderNumber,
      orderDate: formData.orderDate,
      status: formData.status,
      notes: formData.notes || undefined,
      invoicingNotes: formData.invoicingNotes || undefined,
      items: items.map(item => ({
        id: '',
        salesOrderId: salesOrder ? parseInt(salesOrder.id) : 0,
        productId: parseInt(item.productId),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total,
        arInvoiceLineId: null,
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
    if (!salesOrder && !formData.orderNumber) {
      const timestamp = Date.now().toString().slice(-6)
      setFormData(prev => ({ ...prev, orderNumber: `ORD-${timestamp}` }))
    }
  }, [salesOrder, formData.orderNumber])

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-lg-8">
          {/* Order Information Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informacion de la Orden
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    label="Cliente"
                    type="select"
                    value={formData.contactId}
                    onChange={(e) => handleInputChange('contactId', e.target.value)}
                    onBlur={() => handleBlur('contactId')}
                    errorText={touched.contactId ? errors.contactId : ''}
                    required
                    disabled={isFormLoading}
                    options={[
                      { value: '', label: 'Seleccione un cliente' },
                      ...contacts.map((contact: { id: string; attributes?: { name?: string } }) => ({
                        value: contact.id,
                        label: contact.attributes?.name || `Cliente #${contact.id}`
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
                    placeholder="ORD-XXXXXX"
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
                    placeholder="Notas adicionales sobre la orden..."
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
                <span className="fs-4 fw-bold text-success">
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
                  {salesOrder ? 'Actualizar Orden' : 'Crear Orden'}
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

export default SalesOrderForm
