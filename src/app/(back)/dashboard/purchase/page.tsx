import { Suspense } from 'react'
import { usePurchaseOrders } from '@/modules/purchase'
import styles from '@/ui/styles/modules/AdminPage.module.scss'

function PurchaseOrdersTable() {
  const { purchaseOrders, isLoading, error } = usePurchaseOrders()

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className="d-flex justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        Error al cargar las órdenes de compra: {error.message}
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Número de Orden</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                No hay órdenes de compra disponibles
              </td>
            </tr>
          ) : (
            purchaseOrders.map((order: any) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.orderNumber}</strong>
                </td>
                <td>
                  {order.contact?.name || `Proveedor ID: ${order.contactId}`}
                </td>
                <td>
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Sin fecha'}
                </td>
                <td>
                  <span className={`badge ${
                    order.status === 'received' ? 'bg-success' :
                    order.status === 'processing' ? 'bg-warning' :
                    order.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                  }`}>
                    {order.status === 'pending' ? 'Pendiente' :
                     order.status === 'processing' ? 'Procesando' :
                     order.status === 'received' ? 'Recibida' :
                     order.status === 'cancelled' ? 'Cancelada' : order.status}
                  </span>
                </td>
                <td>
                  ${order.totalAmount?.toFixed(2) || '0.00'}
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <a 
                      href={`/dashboard/purchase/${order.id}`}
                      className="btn btn-outline-primary"
                    >
                      <i className="bi bi-eye"></i> Ver
                    </a>
                    <a 
                      href={`/dashboard/purchase/${order.id}/edit`}
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-pencil"></i> Editar
                    </a>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function PurchasePage() {
  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <i className="bi bi-cart-plus me-3"></i>
            Gestión de Compras
          </h1>
          <p className={styles.subtitle}>
            Administra las órdenes de compra y relaciones con proveedores
          </p>
        </div>
        <div className={styles.actions}>
          <a 
            href="/dashboard/purchase/create" 
            className="btn btn-primary"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Orden de Compra
          </a>
        </div>
      </div>

      <div className={styles.content}>
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Órdenes de Compra
            </h5>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-funnel"></i> Filtros
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-download"></i> Exportar
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <Suspense fallback={
              <div className="d-flex justify-content-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando órdenes...</span>
                </div>
              </div>
            }>
              <PurchaseOrdersTable />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}