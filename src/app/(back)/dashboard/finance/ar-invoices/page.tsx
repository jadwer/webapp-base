'use client'

import { useARInvoices, ARInvoicesTableSimple } from '@/modules/finance'
import { Button } from '@/ui/components/base/Button'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function ARInvoicesPage() {
  const navigation = useNavigationProgress()
  
  // Include contacts to resolve customer names
  const { arInvoices, isLoading, error } = useARInvoices({
    include: ['contact']
  })

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
        <h4>Error al cargar facturas por cobrar</h4>
        <p>{error.message}</p>
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
                <i className="bi bi-receipt-cutoff me-3"></i>
                Facturas por Cobrar
              </h1>
              <p className="text-muted">
                Gestión de facturas a clientes y cobros pendientes
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigation.push('/dashboard/finance/ar-invoices/create')}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nueva Factura
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                Listado de Facturas por Cobrar
                {arInvoices.length > 0 && (
                  <span className="badge bg-primary ms-2">{arInvoices.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              <ARInvoicesTableSimple 
                arInvoices={arInvoices}
                isLoading={isLoading}
                onView={(id) => navigation.push(`/dashboard/finance/ar-invoices/${id}`)}
                onEdit={(id) => navigation.push(`/dashboard/finance/ar-invoices/${id}/edit`)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}