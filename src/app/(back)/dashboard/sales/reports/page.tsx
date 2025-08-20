import { Suspense } from 'react'
import { useSalesReports } from '@/modules/sales'
import styles from '@/ui/styles/modules/AdminPage.module.scss'

function SalesReportsContent() {
  const { reports, isLoading, error } = useSalesReports(30)

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
        <div className="card text-white bg-primary">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="card-title text-white-50">Ventas del Mes</h6>
                <h3 className="mb-0">
                  ${reports?.totalSales?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <div className="ms-3">
                <i className="bi bi-graph-up display-6"></i>
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
                <h6 className="card-title text-white-50">Órdenes Completadas</h6>
                <h3 className="mb-0">
                  {reports?.completedOrders || 0}
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
        <div className="card text-white bg-info">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h6 className="card-title text-white-50">Clientes Activos</h6>
                <h3 className="mb-0">
                  {reports?.activeCustomers || 0}
                </h3>
              </div>
              <div className="ms-3">
                <i className="bi bi-people display-6"></i>
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

export default function SalesReportsPage() {
  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <i className="bi bi-graph-up me-3"></i>
            Reportes de Ventas
          </h1>
          <p className={styles.subtitle}>
            Análisis y métricas del desempeño de ventas
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
          <SalesReportsContent />
        </Suspense>
      </div>
    </div>
  )
}