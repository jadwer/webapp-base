import { Suspense } from 'react'
import { usePurchaseSuppliers } from '@/modules/purchase'
import styles from '@/ui/styles/modules/AdminPage.module.scss'

function PurchaseSuppliersContent() {
  const { suppliers, isLoading, error } = usePurchaseSuppliers(90)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando proveedores...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error al cargar los proveedores: {error.message}
      </div>
    )
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="bi bi-building me-2"></i>
              Análisis de Proveedores (últimos 90 días)
            </h5>
            <div className="badge bg-primary">
              {suppliers?.totalSuppliers || 0} proveedores
            </div>
          </div>
          <div className="card-body">
            {suppliers?.topSuppliers && suppliers.topSuppliers.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Total Comprado</th>
                      <th>Órdenes</th>
                      <th>Promedio por Orden</th>
                      <th>Última Compra</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.topSuppliers.map((supplier: any, index: number) => (
                      <tr key={supplier.id || index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                              {supplier.name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="fw-bold">{supplier.name || 'Proveedor sin nombre'}</div>
                              <small className="text-muted">{supplier.email || 'Sin email'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-primary">
                            ${supplier.totalPurchases?.toFixed(2) || '0.00'}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {supplier.orderCount || 0}
                          </span>
                        </td>
                        <td>
                          ${supplier.averageOrderValue?.toFixed(2) || '0.00'}
                        </td>
                        <td>
                          <small className="text-muted">
                            {supplier.lastPurchaseDate 
                              ? new Date(supplier.lastPurchaseDate).toLocaleDateString()
                              : 'Sin compras'
                            }
                          </small>
                        </td>
                        <td>
                          <span className={`badge ${
                            supplier.status === 'active' ? 'bg-success' :
                            supplier.status === 'inactive' ? 'bg-danger' : 'bg-warning'
                          }`}>
                            {supplier.status === 'active' ? 'Activo' :
                             supplier.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-building-x display-1 text-muted"></i>
                <h6 className="mt-3 text-muted">No hay datos de proveedores disponibles</h6>
                <p className="text-muted">Los datos aparecerán cuando se registren compras en el sistema.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-trophy me-2"></i>
              Top 5 Proveedores por Volumen
            </h6>
          </div>
          <div className="card-body">
            {suppliers?.topSuppliers?.slice(0, 5).map((supplier: any, index: number) => (
              <div key={supplier.id || index} className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">{index + 1}</span>
                  <span className="fw-medium">{supplier.name || 'Sin nombre'}</span>
                </div>
                <span className="text-success fw-bold">
                  ${supplier.totalPurchases?.toFixed(2) || '0.00'}
                </span>
              </div>
            )) || (
              <p className="text-muted mb-0">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-speedometer2 me-2"></i>
              Métricas Rápidas
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-6">
                <div className="text-center">
                  <div className="h4 text-primary mb-1">
                    {suppliers?.averageOrderValue?.toFixed(0) || '0'}
                  </div>
                  <small className="text-muted">Promedio por Orden</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center">
                  <div className="h4 text-success mb-1">
                    {suppliers?.totalOrders || '0'}
                  </div>
                  <small className="text-muted">Total Órdenes</small>
                </div>
              </div>
            </div>
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
              {JSON.stringify(suppliers, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseSuppliersPage() {
  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <i className="bi bi-building me-3"></i>
            Proveedores de Compras
          </h1>
          <p className={styles.subtitle}>
            Análisis del rendimiento y relaciones con proveedores
          </p>
        </div>
        <div className={styles.actions}>
          <a 
            href="/dashboard/contacts" 
            className="btn btn-outline-primary"
          >
            <i className="bi bi-building-add me-2"></i>
            Gestionar Contactos
          </a>
        </div>
      </div>

      <div className={styles.content}>
        <Suspense fallback={
          <div className="d-flex justify-content-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando análisis de proveedores...</span>
            </div>
          </div>
        }>
          <PurchaseSuppliersContent />
        </Suspense>
      </div>
    </div>
  )
}