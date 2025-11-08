'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useAPInvoice } from '@/modules/finance'
import { Button } from '@/ui/components/base/Button'

export default function ViewAPInvoicePage() {
  const params = useParams()
  const navigation = useNavigationProgress()
  const id = params.id as string
  
  const { apInvoice, isLoading, error } = useAPInvoice(id, ['contact'])

  const formatCurrency = (amount?: string | number) => {
    if (amount === undefined || amount === null || amount === '') return '-'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '-'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numAmount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="badge bg-secondary">Borrador</span>
      case 'posted':
        return <span className="badge bg-primary">Contabilizada</span>
      case 'paid':
        return <span className="badge bg-success">Pagada</span>
      default:
        return <span className="badge bg-light text-dark">{status}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <h4>Error al cargar la factura</h4>
        <p>{error.message}</p>
        <Button variant="secondary" onClick={() => navigation.back()}>
          <i className="bi bi-arrow-left me-2"></i>
          Regresar
        </Button>
      </div>
    )
  }

  if (!apInvoice) {
    return (
      <div className="alert alert-warning m-4">
        <h4>Factura no encontrada</h4>
        <p>La factura solicitada no existe o no tienes permisos para verla.</p>
        <Button variant="secondary" onClick={() => navigation.back()}>
          <i className="bi bi-arrow-left me-2"></i>
          Regresar
        </Button>
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
                <i className="bi bi-receipt me-3"></i>
                Factura por Pagar #{apInvoice.invoiceNumber}
              </h1>
              <div className="d-flex align-items-center gap-3">
                {getStatusBadge(apInvoice.status)}
                <span className="text-muted">
                  Creada el {formatDate(apInvoice.createdAt)}
                </span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={() => navigation.push(`/dashboard/finance/ap-invoices/${id}/edit`)}
              >
                <i className="bi bi-pencil me-2"></i>
                Editar
              </Button>
              <Button variant="secondary" onClick={() => navigation.back()}>
                <i className="bi bi-arrow-left me-2"></i>
                Regresar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información de la Factura
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Número de Factura</label>
                  <div className="fw-bold">{apInvoice.invoiceNumber}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Proveedor</label>
                  <div className="fw-bold">
                    {apInvoice.contactName?.startsWith('Proveedor ID:') ? (
                      <a 
                        href={`/dashboard/contacts/${apInvoice.contactId}`}
                        className="text-decoration-none"
                        onClick={(e) => {
                          e.preventDefault()
                          navigation.push(`/dashboard/contacts/${apInvoice.contactId}`)
                        }}
                      >
                        {apInvoice.contactName}
                        <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                      </a>
                    ) : (
                      <a 
                        href={`/dashboard/contacts/${apInvoice.contactId}`}
                        className="text-decoration-none"
                        onClick={(e) => {
                          e.preventDefault()
                          navigation.push(`/dashboard/contacts/${apInvoice.contactId}`)
                        }}
                      >
                        {apInvoice.contactName}
                        <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                      </a>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Fecha de Factura</label>
                  <div>{formatDate(apInvoice.invoiceDate)}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Fecha de Vencimiento</label>
                  <div>{formatDate(apInvoice.dueDate)}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Moneda</label>
                  <div>{apInvoice.currency}</div>
                </div>
                {apInvoice.exchangeRate && (
                  <div className="col-md-6">
                    <label className="form-label text-muted">Tipo de Cambio</label>
                    <div>{apInvoice.exchangeRate}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-calculator me-2"></i>
                Totales
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(apInvoice.subtotal)}</span>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Impuestos:</span>
                    <span>{formatCurrency(apInvoice.taxTotal)}</span>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="col-12">
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(apInvoice.total)}</span>
                  </div>
                </div>
                {apInvoice.status !== 'paid' && (
                  <>
                    <hr className="my-2" />
                    <div className="col-12">
                      <div className="d-flex justify-content-between text-success">
                        <span>Pagado:</span>
                        <span>{formatCurrency(apInvoice.paidAmount)}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between text-danger fw-bold">
                        <span>Saldo Pendiente:</span>
                        <span>{formatCurrency(apInvoice.remainingBalance)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {apInvoice.status === 'draft' && (
            <div className="card mt-3">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Acciones
                </h6>
              </div>
              <div className="card-body">
                <p className="text-muted small">
                  Esta factura está en borrador y puede ser editada.
                </p>
                <Button
                  variant="primary"
                  size="small"
                  className="w-100"
                  onClick={() => navigation.push(`/dashboard/finance/ap-invoices/${id}/edit`)}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Editar Factura
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Phase 1 - Vista Básica:</strong> 
            Esta es la vista básica de facturas. Las líneas detalladas y funciones avanzadas 
            estarán disponibles en fases posteriores.
          </div>
        </div>
      </div>
    </div>
  )
}