'use client'

import { useARReceipts } from '@/modules/finance'
import { Button } from '@/ui/components/base/Button'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function ARReceiptsPage() {
  const navigation = useNavigationProgress()
  
  // Include contacts and invoices to resolve customer names and invoice info
  const { arReceipts, isLoading, error } = useARReceipts({
    include: ['contact', 'arInvoice']
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
        <h4>Error al cargar recibos</h4>
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
                <i className="bi bi-cash-coin me-3"></i>
                Recibos de Clientes
              </h1>
              <p className="text-muted">
                Registro de cobros recibidos de facturas a clientes
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigation.push('/dashboard/finance/ar-receipts/create')}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nuevo Recibo
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                Listado de Recibos AR
                {arReceipts.length > 0 && (
                  <span className="badge bg-primary ms-2">{arReceipts.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              {arReceipts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-cash-coin display-1 text-muted mb-3"></i>
                  <h5>No hay recibos registrados</h5>
                  <p className="text-muted">
                    Los recibos aparecerán aquí una vez que se conecte con el backend
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Factura</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Referencia</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arReceipts.map((receipt) => {
                        const formatDate = (dateString?: string) => {
                          if (!dateString) return '-'
                          try {
                            return new Date(dateString).toLocaleDateString('es-ES')
                          } catch {
                            return '-'
                          }
                        }

                        const formatCurrency = (amount?: string | number) => {
                          if (amount === undefined || amount === null || amount === '') return '-'
                          const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
                          if (isNaN(numAmount)) return '-'
                          return new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: receipt.currency || 'MXN'
                          }).format(numAmount)
                        }
                        
                        return (
                          <tr key={receipt.id}>
                            <td>{formatDate(receipt.receiptDate)}</td>
                            <td>
                              <span className={receipt.contactName?.startsWith('Cliente ID:') ? 'text-muted' : 'text-dark'}>
                                {receipt.contactName || `Cliente ID: ${receipt.contactId}`}
                              </span>
                            </td>
                            <td>
                              {receipt.arInvoiceId ? (
                                <span className="text-primary">
                                  Factura #{receipt.arInvoiceId}
                                </span>
                              ) : (
                                <span className="text-muted">Sin factura</span>
                              )}
                            </td>
                            <td>
                              <strong>{formatCurrency(receipt.amount)}</strong>
                              <div className="small text-muted">{receipt.currency}</div>
                            </td>
                            <td>{receipt.paymentMethod}</td>
                            <td>
                              <code className="bg-light px-2 py-1 rounded">
                                {receipt.reference || '-'}
                              </code>
                            </td>
                            <td>
                              <span className={`badge ${receipt.status === 'posted' ? 'bg-success' : 'bg-warning'}`}>
                                {receipt.status === 'posted' ? 'Procesado' : 'Borrador'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}