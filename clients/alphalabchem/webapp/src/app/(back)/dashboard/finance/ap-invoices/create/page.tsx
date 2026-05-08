/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import React from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useAPInvoiceMutations } from '@/modules/finance'
import { Button } from '@/ui/components/base/Button'

export default function CreateAPInvoicePage() {
  const navigation = useNavigationProgress()
  const { createAPInvoice } = useAPInvoiceMutations()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<Record<string, unknown>>({
    contactId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'MXN',
    subtotal: '0.00',
    taxTotal: '0.00',
    total: '0.00',
    status: 'draft'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createAPInvoice(formData as any)
      navigation.push('/dashboard/finance/ap-invoices')
    } catch (error) {
      console.error('Error creating AP invoice:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.back()
  }

  // Calculate total when subtotal or tax changes
  React.useEffect(() => {
    const subtotal = parseFloat(formData.subtotal as string) || 0
    const taxTotal = parseFloat(formData.taxTotal as string) || 0
    const total = subtotal + taxTotal
    setFormData(prev => ({ ...prev, total: total.toFixed(2) }))
  }, [formData.subtotal, formData.taxTotal])

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Factura por Pagar
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="contactId" className="form-label">
                      Proveedor <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="contactId"
                      value={formData.contactId}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                      required
                      placeholder="ID del proveedor"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="invoiceNumber" className="form-label">
                      Número de Factura <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="invoiceDate" className="form-label">
                      Fecha de Factura <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="dueDate" className="form-label">
                      Fecha de Vencimiento <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="currency" className="form-label">
                      Moneda
                    </label>
                    <select
                      className="form-select"
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="subtotal" className="form-label">
                      Subtotal <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="subtotal"
                      value={formData.subtotal}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtotal: e.target.value }))}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="taxTotal" className="form-label">
                      Impuestos
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="taxTotal"
                      value={formData.taxTotal}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxTotal: e.target.value }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="total" className="form-label">
                      Total
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="total"
                      value={`$${parseFloat(formData.total || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'posted' | 'paid' }))}
                    >
                      <option value="draft">Borrador</option>
                      <option value="posted">Contabilizada</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Crear Factura
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Phase 1 - Funcionalidad Básica:</strong> 
            En esta fase se implementa la funcionalidad básica de facturas. 
            Las líneas detalladas y funciones avanzadas estarán disponibles en fases posteriores.
          </div>
        </div>
      </div>
    </div>
  )
}