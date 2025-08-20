import { Suspense } from 'react'
import { useSalesCustomers } from '@/modules/sales'
import styles from '@/ui/styles/modules/AdminPage.module.scss'

function SalesCustomersContent() {
  const { customers, isLoading, error } = useSalesCustomers(90)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando clientes...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error al cargar los clientes: {error.message}
      </div>
    )
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="bi bi-person-heart me-2"></i>
              Análisis de Clientes (últimos 90 días)
            </h5>
            <div className="badge bg-primary">
              {customers?.totalCustomers || 0} clientes
            </div>
          </div>
          <div className="card-body">
            {customers?.topCustomers && customers.topCustomers.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Total Compras</th>
                      <th>Órdenes</th>
                      <th>Promedio por Orden</th>
                      <th>Última Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.topCustomers.map((customer: any, index: number) => (
                      <tr key={customer.id || index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                              {customer.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <div className="fw-bold">{customer.name || 'Cliente sin nombre'}</div>
                              <small className="text-muted">{customer.email || 'Sin email'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            ${customer.totalPurchases?.toFixed(2) || '0.00'}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {customer.orderCount || 0}
                          </span>
                        </td>
                        <td>
                          ${customer.averageOrderValue?.toFixed(2) || '0.00'}
                        </td>
                        <td>
                          <small className="text-muted">
                            {customer.lastPurchaseDate 
                              ? new Date(customer.lastPurchaseDate).toLocaleDateString()
                              : 'Sin compras'
                            }
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-person-x display-1 text-muted"></i>
                <h6 className="mt-3 text-muted">No hay datos de clientes disponibles</h6>
                <p className="text-muted">Los datos aparecerán cuando se registren ventas en el sistema.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="bi bi-code-square me-2"></i>
              Datos Completos del API (JSON)
            </h5>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded" style={{ fontSize: '0.85rem', maxHeight: '400px', overflow: 'auto' }}>
              {JSON.stringify(customers, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SalesCustomersPage() {
  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <i className="bi bi-person-heart me-3"></i>
            Clientes de Ventas
          </h1>
          <p className={styles.subtitle}>
            Análisis del comportamiento y desempeño de clientes
          </p>
        </div>
        <div className={styles.actions}>
          <a 
            href="/dashboard/contacts" 
            className="btn btn-outline-primary"
          >
            <i className="bi bi-person-plus me-2"></i>
            Gestionar Contactos
          </a>
        </div>
      </div>

      <div className={styles.content}>
        <Suspense fallback={
          <div className="d-flex justify-content-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando análisis de clientes...</span>
            </div>
          </div>
        }>
          <SalesCustomersContent />
        </Suspense>
      </div>
    </div>
  )
}