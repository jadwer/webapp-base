'use client'

import { useAPPayments } from '@/modules/finance'
import { Button } from '@/ui/components/base/Button'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function APPaymentsPage() {
  const navigation = useNavigationProgress()
  
  // Include contacts to resolve supplier names
  const { apPayments, isLoading, error } = useAPPayments({
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
        <h4>Error al cargar pagos</h4>
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
                <i className="bi bi-credit-card me-3"></i>
                Pagos a Proveedores
              </h1>
              <p className="text-muted">
                Registro de pagos realizados a facturas de proveedores
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigation.push('/dashboard/finance/ap-payments/create')}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nuevo Pago
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                Listado de Pagos AP
                {apPayments.length > 0 && (
                  <span className="badge bg-primary ms-2">{apPayments.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              {apPayments.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-credit-card display-1 text-muted mb-3"></i>
                  <h5>No hay pagos registrados</h5>
                  <p className="text-muted">
                    Los pagos aparecerán aquí una vez que se conecte con el backend
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Proveedor</th>
                        <th>Factura</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Referencia</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apPayments.map((payment) => {
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
                            currency: payment.currency || 'MXN'
                          }).format(numAmount)
                        }
                        
                        return (
                          <tr key={payment.id}>
                            <td>{formatDate(payment.paymentDate)}</td>
                            <td>
                              <span className={payment.contactName?.startsWith('Proveedor ID:') ? 'text-muted' : 'text-dark'}>
                                {payment.contactName || `Proveedor ID: ${payment.contactId}`}
                              </span>
                            </td>
                            <td>
                              {payment.apInvoiceId ? (
                                <span className="text-primary">
                                  Factura #{payment.apInvoiceId}
                                </span>
                              ) : (
                                <span className="text-muted">Sin factura</span>
                              )}
                            </td>
                            <td>
                              <strong>{formatCurrency(payment.amount)}</strong>
                              <div className="small text-muted">{payment.currency}</div>
                            </td>
                            <td>{payment.paymentMethod}</td>
                            <td>
                              <code className="bg-light px-2 py-1 rounded">
                                {payment.reference || '-'}
                              </code>
                            </td>
                            <td>
                              <span className={`badge ${payment.status === 'posted' ? 'bg-success' : 'bg-warning'}`}>
                                {payment.status === 'posted' ? 'Procesado' : 'Borrador'}
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