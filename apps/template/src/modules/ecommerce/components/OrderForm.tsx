'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { EcommerceOrder, EcommerceOrderFormData, OrderStatus, PaymentStatus, ShippingStatus } from '../types'

interface OrderFormProps {
  order?: EcommerceOrder
  isLoading?: boolean
  onSubmit: (data: EcommerceOrderFormData) => Promise<void>
  onCancel?: () => void
}

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
]

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'processing', label: 'Procesando' },
  { value: 'completed', label: 'Completado' },
  { value: 'failed', label: 'Fallido' },
  { value: 'refunded', label: 'Reembolsado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const SHIPPING_STATUSES: { value: ShippingStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'in_transit', label: 'En Transito' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'returned', label: 'Devuelto' },
]

const COUNTRIES = [
  { value: 'MX', label: 'Mexico' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'CA', label: 'Canada' },
]

export const OrderForm: React.FC<OrderFormProps> = ({
  order,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    customerEmail: order?.customerEmail || '',
    customerName: order?.customerName || '',
    customerPhone: order?.customerPhone || '',
    shippingAddressLine1: order?.shippingAddressLine1 || '',
    shippingAddressLine2: order?.shippingAddressLine2 || '',
    shippingCity: order?.shippingCity || '',
    shippingState: order?.shippingState || '',
    shippingPostalCode: order?.shippingPostalCode || '',
    shippingCountry: order?.shippingCountry || 'MX',
    notes: order?.notes || '',
    // Status fields for editing
    status: order?.status || 'pending',
    paymentStatus: order?.paymentStatus || 'pending',
    shippingStatus: order?.shippingStatus || 'pending',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (order) {
      setFormData({
        customerEmail: order.customerEmail || '',
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        shippingAddressLine1: order.shippingAddressLine1 || '',
        shippingAddressLine2: order.shippingAddressLine2 || '',
        shippingCity: order.shippingCity || '',
        shippingState: order.shippingState || '',
        shippingPostalCode: order.shippingPostalCode || '',
        shippingCountry: order.shippingCountry || 'MX',
        notes: order.notes || '',
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        shippingStatus: order.shippingStatus || 'pending',
      })
    }
  }, [order])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email invalido'
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre del cliente es requerido'
    }

    if (!formData.shippingAddressLine1.trim()) {
      newErrors.shippingAddressLine1 = 'La direccion es requerida'
    }

    if (!formData.shippingCity.trim()) {
      newErrors.shippingCity = 'La ciudad es requerida'
    }

    if (!formData.shippingState.trim()) {
      newErrors.shippingState = 'El estado es requerido'
    }

    if (!formData.shippingPostalCode.trim()) {
      newErrors.shippingPostalCode = 'El codigo postal es requerido'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    const submitData: EcommerceOrderFormData = {
      customerEmail: formData.customerEmail,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || undefined,
      shippingAddressLine1: formData.shippingAddressLine1,
      shippingAddressLine2: formData.shippingAddressLine2 || undefined,
      shippingCity: formData.shippingCity,
      shippingState: formData.shippingState,
      shippingPostalCode: formData.shippingPostalCode,
      shippingCountry: formData.shippingCountry,
      notes: formData.notes || undefined,
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-lg-8">
          {/* Customer Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-person me-2"></i>
                Informacion del Cliente
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    label="Nombre del Cliente"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    onBlur={() => handleBlur('customerName')}
                    errorText={touched.customerName ? errors.customerName : ''}
                    required
                    placeholder="Nombre completo"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    onBlur={() => handleBlur('customerEmail')}
                    errorText={touched.customerEmail ? errors.customerEmail : ''}
                    required
                    placeholder="email@ejemplo.com"
                    leftIcon="bi-envelope"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Telefono"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    onBlur={() => handleBlur('customerPhone')}
                    placeholder="+52 123 456 7890"
                    leftIcon="bi-telephone"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-truck me-2"></i>
                Direccion de Envio
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <Input
                    label="Direccion Linea 1"
                    type="text"
                    value={formData.shippingAddressLine1}
                    onChange={(e) => handleInputChange('shippingAddressLine1', e.target.value)}
                    onBlur={() => handleBlur('shippingAddressLine1')}
                    errorText={touched.shippingAddressLine1 ? errors.shippingAddressLine1 : ''}
                    required
                    placeholder="Calle, numero exterior e interior"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-12">
                  <Input
                    label="Direccion Linea 2"
                    type="text"
                    value={formData.shippingAddressLine2}
                    onChange={(e) => handleInputChange('shippingAddressLine2', e.target.value)}
                    onBlur={() => handleBlur('shippingAddressLine2')}
                    placeholder="Colonia, edificio, departamento (opcional)"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Ciudad"
                    type="text"
                    value={formData.shippingCity}
                    onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                    onBlur={() => handleBlur('shippingCity')}
                    errorText={touched.shippingCity ? errors.shippingCity : ''}
                    required
                    placeholder="Ciudad"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Estado"
                    type="text"
                    value={formData.shippingState}
                    onChange={(e) => handleInputChange('shippingState', e.target.value)}
                    onBlur={() => handleBlur('shippingState')}
                    errorText={touched.shippingState ? errors.shippingState : ''}
                    required
                    placeholder="Estado/Provincia"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Codigo Postal"
                    type="text"
                    value={formData.shippingPostalCode}
                    onChange={(e) => handleInputChange('shippingPostalCode', e.target.value)}
                    onBlur={() => handleBlur('shippingPostalCode')}
                    errorText={touched.shippingPostalCode ? errors.shippingPostalCode : ''}
                    required
                    placeholder="00000"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-8">
                  <Input
                    label="Pais"
                    type="select"
                    value={formData.shippingCountry}
                    onChange={(e) => handleInputChange('shippingCountry', e.target.value)}
                    onBlur={() => handleBlur('shippingCountry')}
                    disabled={isLoading}
                    options={COUNTRIES.map(c => ({ value: c.value, label: c.label }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-sticky me-2"></i>
                Notas
              </h5>
            </div>
            <div className="card-body">
              <Input
                label="Notas del Pedido"
                type="textarea"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                onBlur={() => handleBlur('notes')}
                placeholder="Instrucciones especiales de entrega, comentarios del cliente..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Order Status (only for editing existing orders) */}
          {order && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-gear me-2"></i>
                  Estado del Pedido
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <Input
                    label="Estado del Pedido"
                    type="select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={isLoading}
                    options={ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                  />
                </div>

                <div className="mb-3">
                  <Input
                    label="Estado del Pago"
                    type="select"
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    disabled={isLoading}
                    options={PAYMENT_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                  />
                </div>

                <div className="mb-3">
                  <Input
                    label="Estado del Envio"
                    type="select"
                    value={formData.shippingStatus}
                    onChange={(e) => handleInputChange('shippingStatus', e.target.value)}
                    disabled={isLoading}
                    options={SHIPPING_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          {order && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-receipt me-2"></i>
                  Resumen
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${order.subtotalAmount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Impuestos:</span>
                  <span>${order.taxAmount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envio:</span>
                  <span>${order.shippingAmount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Descuento:</span>
                    <span>-${order.discountAmount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold fs-5">Total:</span>
                  <span className="fw-bold fs-5 text-primary">
                    ${order.totalAmount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <div className="card-body">
              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <i className="bi bi-check-lg me-2" />
                  {order ? 'Actualizar Pedido' : 'Crear Pedido'}
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

export default OrderForm
