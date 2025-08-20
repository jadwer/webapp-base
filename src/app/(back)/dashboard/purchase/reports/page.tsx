import { Suspense } from 'react'
import { usePurchaseReports } from '@/modules/purchase'
import styles from '@/ui/styles/modules/AdminPage.module.scss'

function PurchaseReportsContent() {
  const { reports, isLoading, error } = usePurchaseReports(30)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando reportes...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error al cargar los reportes: {error.message}
      </div>
    )
  }

  return (
    <div className="row g-4">
      <div className="col-md-6 col-xl-3">
        <div className="card text-white bg-info">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="card-title text-white-50">Compras del Mes</h6>
                <h3 className="mb-0">
                  ${reports?.totalPurchases?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <div className="ms-3">
                <i className="bi bi-cart-plus display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card text-white bg-success">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="card-title text-white-50">Órdenes Recibidas</h6>
                <h3 className="mb-0">
                  {reports?.receivedOrders || 0}
                </h3>
              </div>
              <div className="ms-3">
                <i className="bi bi-check-circle display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card text-white bg-warning">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="card-title text-white-50">Órdenes Pendientes</h6>
                <h3 className="mb-0">
                  {reports?.pendingOrders || 0}
                </h3>
              </div>
              <div className="ms-3">
                <i className="bi bi-clock display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card text-white bg-primary">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="card-title text-white-50">Proveedores Activos</h6>
                <h3 className="mb-0">
                  {reports?.activeSuppliers || 0}
                </h3>
              </div>
              <div className="ms-3">
                <i className="bi bi-building display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="bi bi-bar-chart me-2"></i>
              Datos del Reporte (JSON)
            </h5>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded" style={{ fontSize: '0.85rem', maxHeight: '400px', overflow: 'auto' }}>
              {JSON.stringify(reports, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseReportsPage() {
  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <i className="bi bi-graph-up me-3"></i>
            Reportes de Compras
          </h1>
          <p className={styles.subtitle}>
            Análisis y métricas del proceso de compras
          </p>
        </div>
        <div className={styles.actions}>
          <div className="btn-group">
            <button className="btn btn-outline-primary active">
              30 días
            </button>
            <button className="btn btn-outline-primary">
              90 días
            </button>
            <button className="btn btn-outline-primary">
              1 año
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <Suspense fallback={
          <div className="d-flex justify-content-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando reportes...</span>
            </div>
          </div>
        }>
          <PurchaseReportsContent />
        </Suspense>
      </div>
    </div>
  )
}