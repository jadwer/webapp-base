'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSalesOrderMutations, useSalesContacts, useSalesOrderItemMutations } from '@/modules/sales'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import ItemsManager from '@/modules/sales/components/ItemsManager'
import { formatCurrency } from '@/lib/formatters'

export default function CreateSalesOrderPage() {
  const router = useRouter()
  const navigation = useNavigationProgress()
  const { createSalesOrder, updateSalesOrderTotals } = useSalesOrderMutations()
  const { createSalesOrderItem } = useSalesOrderItemMutations()
  const { contacts, isLoading: contactsLoading } = useSalesContacts()

  const [formData, setFormData] = useState({
    contactId: '',
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    status: 'draft' as 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    notes: ''
  })

  const [orderItems, setOrderItems] = useState<any[]>([])
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
      // Generate order number if not provided
      const orderNumber = formData.orderNumber || `SO-${Date.now()}`
      
      console.log('🚀 Starting 3-step order creation process with items:', { orderItems })
      
      // 🟦 STEP 1: Create order with 0 totals
      const orderData = {
        ...formData,
        orderNumber,
        contactId: parseInt(formData.contactId),
        totalAmount: 0,
        subtotalAmount: 0,
        taxAmount: 0
      }

      console.log('📝 STEP 1: Creating sales order with zero totals:', orderData)
      const orderResponse = await createSalesOrder(orderData)
      const orderId = orderResponse.data?.id || orderResponse.id
      console.log('✅ STEP 1 Complete: Order created with ID:', orderId)
      
      // 🟦 STEP 2: Create all items
      console.log('📦 STEP 2: Creating', orderItems.length, 'items')
      for (const item of orderItems) {
        const itemData = {
          salesOrderId: parseInt(orderId), // Ensure orderId is integer
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          discount: parseFloat(item.discount),
          total: parseFloat(item.total)
        }
        
        console.log('📦 Creating item:', itemData)
        await createSalesOrderItem(itemData)
      }
      console.log('✅ STEP 2 Complete: All items created')
      
      // 🟦 STEP 3: Update order totals
      const finalTotals = {
        totalAmount: totalAmount,
        subtotalAmount: totalAmount, // For now, same as total
        taxAmount: 0 // No tax calculation for now
      }
      
      console.log('💰 STEP 3: Updating order totals:', finalTotals)
      await updateSalesOrderTotals(orderId, finalTotals)
      console.log('✅ STEP 3 Complete: Order totals updated')
      
      console.log('🎉 Sales order creation completed successfully!')
      
      // Navigate to the created order detail page
      navigation.push(`/dashboard/sales/${orderId}`)
      
    } catch (err: any) {
      console.error('❌ Error creating sales order:', err)
      setError(err.response?.data?.message || err.message || 'Error al crear la orden de venta')
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
                Nueva Orden de Venta
              </h1>
              <p className="text-muted">
                Crear una nueva orden de venta para un cliente
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
                  Información de la Orden
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
                      {contacts?.map((contact: any) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name || contact.attributes?.name || `Cliente #${contact.id}`}
                        </option>
                      ))}
                    </select>
                    {contactsLoading && (
                      <small className="text-muted">Cargando clientes...</small>
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
                      <option value="draft">Borrador</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="processing">En Proceso</option>
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