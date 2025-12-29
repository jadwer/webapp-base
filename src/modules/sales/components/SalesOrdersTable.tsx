'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import type { SalesOrder, OrderStatus } from '../types'

interface SalesOrdersTableProps {
  salesOrders: SalesOrder[]
  isLoading?: boolean
  onEdit?: (salesOrder: SalesOrder) => void
  onDelete?: (salesOrderId: string) => Promise<void>
  onView?: (salesOrder: SalesOrder) => void
  className?: string
}

const STATUS_BADGES: Record<OrderStatus, { className: string; label: string }> = {
  draft: { className: 'bg-secondary', label: 'Borrador' },
  pending: { className: 'bg-warning text-dark', label: 'Pendiente' },
  confirmed: { className: 'bg-info', label: 'Confirmada' },
  processing: { className: 'bg-primary', label: 'En Proceso' },
  shipped: { className: 'bg-info', label: 'Enviada' },
  delivered: { className: 'bg-success', label: 'Entregada' },
  completed: { className: 'bg-success', label: 'Completada' },
  cancelled: { className: 'bg-danger', label: 'Cancelada' },
  returned: { className: 'bg-warning text-dark', label: 'Devuelta' },
  refunded: { className: 'bg-dark', label: 'Reembolsada' },
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export const SalesOrdersTable: React.FC<SalesOrdersTableProps> = ({
  salesOrders,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setOrderLoading = (orderId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [orderId]: loading }))
  }

  const handleDelete = async (order: SalesOrder) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Esta seguro de que quiere eliminar la orden "${order.orderNumber}"? Esta accion no se puede deshacer.`
    )

    if (confirmed) {
      setOrderLoading(order.id, true)
      try {
        await onDelete(order.id)
      } finally {
        setOrderLoading(order.id, false)
      }
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const badge = STATUS_BADGES[status] || STATUS_BADGES.draft
    return (
      <span className={clsx('badge', badge.className)}>
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando ordenes de venta...</span>
        </div>
      </div>
    )
  }

  if (salesOrders.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-cart display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay ordenes de venta</h5>
        <p className="text-muted">Crea tu primera orden de venta para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">No. Orden</th>
              <th scope="col">Cliente</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col">Facturacion</th>
              <th scope="col" className="text-end">Total</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salesOrders.map((order) => {
              const isOrderLoading = loadingStates[order.id] || false

              return (
                <tr key={order.id} className={clsx({ 'opacity-50': isOrderLoading })}>
                  <td>
                    <div className="fw-medium">{order.orderNumber}</div>
                    <small className="text-muted">ID: {order.id}</small>
                  </td>
                  <td>
                    {order.contact ? (
                      <div>
                        <div className="fw-medium">{order.contact.name}</div>
                        {order.contact.email && (
                          <small className="text-muted">{order.contact.email}</small>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">Cliente #{order.contactId}</span>
                    )}
                  </td>
                  <td>
                    <div>{formatDate(order.orderDate)}</div>
                    {order.deliveredAt && (
                      <small className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Entregado: {formatDate(order.deliveredAt)}
                      </small>
                    )}
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td>
                    <span className={clsx('badge', {
                      'bg-warning text-dark': order.invoicingStatus === 'pending',
                      'bg-info': order.invoicingStatus === 'partial',
                      'bg-success': order.invoicingStatus === 'invoiced',
                      'bg-secondary': order.invoicingStatus === 'not_required'
                    })}>
                      {order.invoicingStatus === 'pending' && 'Pendiente'}
                      {order.invoicingStatus === 'partial' && 'Parcial'}
                      {order.invoicingStatus === 'invoiced' && 'Facturada'}
                      {order.invoicingStatus === 'not_required' && 'No Requerida'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="fw-bold text-success">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    {order.discountTotal > 0 && (
                      <small className="text-muted">
                        Desc: {formatCurrency(order.discountTotal)}
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver orden"
                          onClick={() => onView(order)}
                          disabled={isOrderLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar orden"
                          onClick={() => onEdit(order)}
                          disabled={isOrderLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar orden"
                          onClick={() => handleDelete(order)}
                          disabled={isOrderLoading}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default SalesOrdersTable
