'use client'

import { useAPInvoices } from '@/modules/finance'
import { APInvoicesTableSimple } from '@/modules/finance/components/APInvoicesTableSimple'
import { Button } from '@/ui/components/base/Button'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function APInvoicesPage() {
  const navigation = useNavigationProgress()
  
  // Include contacts to resolve supplier names
  const { apInvoices, isLoading, error } = useAPInvoices({
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
        <h4>Error al cargar facturas por pagar</h4>
        <p>{error.message}</p>
      </div>
    )
  }

  const handleView = (id: string) => {
    navigation.push(`/dashboard/finance/ap-invoices/${id}`)
  }

  const handleEdit = (id: string) => {
    navigation.push(`/dashboard/finance/ap-invoices/${id}/edit`)
  }

  const handleCreate = () => {
    navigation.push('/dashboard/finance/ap-invoices/create')
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-receipt me-3"></i>
                Facturas por Pagar
              </h1>
              <p className="text-muted">
                Gestión de facturas de proveedores y pagos pendientes
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
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
                Listado de Facturas por Pagar
                {apInvoices.length > 0 && (
                  <span className="badge bg-primary ms-2">{apInvoices.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              <APInvoicesTableSimple
                apInvoices={apInvoices}
                isLoading={isLoading}
                onView={handleView}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}