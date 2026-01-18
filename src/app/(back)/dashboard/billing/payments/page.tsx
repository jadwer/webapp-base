'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { paymentService } from '@/modules/ecommerce'
import type { EcommercePaymentTransaction, PaymentTransactionStatus } from '@/modules/ecommerce'
import { toast } from 'sonner'
import { ConfirmModal, ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'

// Status badge component
function StatusBadge({ status }: { status: PaymentTransactionStatus }) {
  const statusConfig: Record<PaymentTransactionStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-warning', text: 'text-dark', label: 'Pendiente' },
    authorized: { bg: 'bg-info', text: 'text-white', label: 'Autorizado' },
    captured: { bg: 'bg-success', text: 'text-white', label: 'Capturado' },
    failed: { bg: 'bg-danger', text: 'text-white', label: 'Fallido' },
    refunded: { bg: 'bg-secondary', text: 'text-white', label: 'Reembolsado' },
    cancelled: { bg: 'bg-dark', text: 'text-white', label: 'Cancelado' },
  }

  const config = statusConfig[status] || { bg: 'bg-secondary', text: 'text-white', label: status }

  return (
    <span className={`badge ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

export default function PaymentsPage() {
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const [transactions, setTransactions] = useState<EcommercePaymentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<PaymentTransactionStatus | ''>('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    captured: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  })

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: { status?: PaymentTransactionStatus; gateway?: string } = {
        gateway: 'stripe',
      }

      if (statusFilter) {
        filters.status = statusFilter
      }

      const data = await paymentService.transactions.getAll(filters)
      setTransactions(data)

      // Calculate stats
      const captured = data.filter(t => t.status === 'captured')
      const pending = data.filter(t => t.status === 'pending' || t.status === 'authorized')
      const failed = data.filter(t => t.status === 'failed')
      const totalAmount = captured.reduce((sum, t) => sum + t.amount, 0)

      setStats({
        total: data.length,
        captured: captured.length,
        pending: pending.length,
        failed: failed.length,
        totalAmount,
      })
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError('Error al cargar transacciones. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(amount / 100) // Stripe stores in cents
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/dashboard/billing">Facturacion</Link>
              </li>
              <li className="breadcrumb-item active">Pagos Stripe</li>
            </ol>
          </nav>
          <h1 className="h3 mb-2">
            <i className="bi bi-credit-card me-3" />
            Pagos con Stripe
          </h1>
          <p className="text-muted">
            Historial de transacciones procesadas con Stripe
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 opacity-75">Total Capturado</h6>
              <h3 className="card-title mb-0">{formatCurrency(stats.totalAmount)}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Transacciones</h6>
              <h3 className="card-title mb-0">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-success">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-success">Exitosas</h6>
              <h3 className="card-title mb-0 text-success">{stats.captured}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-warning">Pendientes</h6>
              <h3 className="card-title mb-0 text-warning">{stats.pending}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Filtrar por estado</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentTransactionStatus | '')}
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="authorized">Autorizado</option>
                <option value="captured">Capturado</option>
                <option value="failed">Fallido</option>
                <option value="refunded">Reembolsado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary"
                onClick={loadTransactions}
                disabled={isLoading}
              >
                <i className={`bi bi-arrow-repeat ${isLoading ? 'spin' : ''} me-2`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={loadTransactions}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {!isLoading && !error && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-list me-2" />
              Transacciones ({transactions.length})
            </h5>
          </div>
          <div className="card-body p-0">
            {transactions.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted" />
                <p className="text-muted mt-3">No hay transacciones para mostrar</p>
                <p className="text-muted small">
                  Las transacciones apareceran aqui cuando se procesen pagos con Stripe
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Metodo</th>
                      <th>Tarjeta</th>
                      <th>Orden</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <code className="small">{tx.paymentIntentId?.slice(-8) || tx.id}</code>
                        </td>
                        <td className="small">{formatDate(tx.createdAt)}</td>
                        <td className="fw-medium">{formatCurrency(tx.amount, tx.currency)}</td>
                        <td>
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="small text-capitalize">{tx.paymentMethod || '-'}</td>
                        <td>
                          {tx.cardBrand && tx.cardLast4 ? (
                            <span className="small">
                              <i className={`bi bi-credit-card me-1`} />
                              {tx.cardBrand} ****{tx.cardLast4}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {tx.salesOrderId ? (
                            <Link
                              href={`/dashboard/sales/${tx.salesOrderId}`}
                              className="text-decoration-none"
                            >
                              #{tx.salesOrderId}
                            </Link>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {tx.status === 'captured' && (
                              <button
                                className="btn btn-outline-warning"
                                title="Reembolsar"
                                onClick={async () => {
                                  const confirmed = await confirmModalRef.current?.confirm(
                                    'Deseas procesar un reembolso para esta transaccion?',
                                    { title: 'Confirmar Reembolso', variant: 'warning' }
                                  )
                                  if (confirmed) {
                                    const result = await paymentService.processor
                                      .processRefund(tx.paymentIntentId || '')
                                    if (result.success) {
                                      toast.success('Reembolso procesado exitosamente')
                                      loadTransactions()
                                    } else {
                                      toast.error('Error: ' + result.error)
                                    }
                                  }
                                }}
                              >
                                <i className="bi bi-arrow-counterclockwise" />
                              </button>
                            )}
                            {(tx.status === 'pending' || tx.status === 'authorized') && (
                              <button
                                className="btn btn-outline-danger"
                                title="Cancelar"
                                onClick={async () => {
                                  const confirmed = await confirmModalRef.current?.confirm(
                                    'Deseas cancelar esta transaccion?',
                                    { title: 'Confirmar Cancelacion', variant: 'danger' }
                                  )
                                  if (confirmed) {
                                    const result = await paymentService.processor
                                      .cancelPayment(tx.paymentIntentId || '')
                                    if (result.success) {
                                      toast.success('Transaccion cancelada')
                                      loadTransactions()
                                    } else {
                                      toast.error('Error: ' + result.error)
                                    }
                                  }
                                }}
                              >
                                <i className="bi bi-x-lg" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info about webhooks */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2" />
            Configuracion de Webhooks
          </h5>
        </div>
        <div className="card-body">
          <p className="mb-2">
            Para sincronizar automaticamente el estado de las transacciones, configura un webhook en tu dashboard de Stripe:
          </p>
          <ol className="mb-3">
            <li>Ve a <strong>Stripe Dashboard &gt; Developers &gt; Webhooks</strong></li>
            <li>Agrega un endpoint con la URL de tu aplicacion</li>
            <li>Selecciona los eventos: <code>payment_intent.succeeded</code>, <code>payment_intent.payment_failed</code></li>
            <li>Copia el Webhook Secret y agregalo a tu archivo <code>.env</code> como <code>STRIPE_WEBHOOK_SECRET</code></li>
          </ol>
          <div className="bg-light p-3 rounded">
            <code>STRIPE_WEBHOOK_SECRET=whsec_...</code>
          </div>
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
