/**
 * OrdersAdminPage Component
 *
 * Main administration page for ecommerce orders.
 * Follows the ContactsAdminPageReal pattern for simplicity and professionalism.
 */

'use client'

import React, { useState, useRef } from 'react'
import { useEcommerceOrders, useEcommerceOrderMutations } from '../hooks'
import { OrdersTable } from './OrdersTable'
import { OrderFilters } from './OrderFilters'
import { PaginationSimple } from './PaginationSimple'
import { Button, ConfirmModal } from '@/ui/components/base'
import type { ConfirmModalHandle } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useToast } from '@/ui/hooks/useToast'
import type { EcommerceOrder, OrderStatus, PaymentStatus, ShippingStatus } from '../types'

export const OrdersAdminPage = React.memo(() => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [shippingStatusFilter, setShippingStatusFilter] = useState('')
  const pageSize = 20

  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const toast = useToast()

  const { deleteEcommerceOrder } = useEcommerceOrderMutations()

  // Fetch orders with filters
  const { ecommerceOrders, isLoading, error } = useEcommerceOrders({
    search: searchTerm || undefined,
    status: (statusFilter || undefined) as OrderStatus | undefined,
    paymentStatus: (paymentStatusFilter || undefined) as PaymentStatus | undefined,
    shippingStatus: (shippingStatusFilter || undefined) as ShippingStatus | undefined,
  })

  // Get all orders for metrics (without pagination)
  const { ecommerceOrders: allOrders } = useEcommerceOrders({})

  // Calculate metrics
  const orderMetrics = React.useMemo(() => {
    return {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      completedOrders: allOrders.filter(o => o.status === 'delivered').length,
      totalRevenue: allOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    }
  }, [allOrders])

  // Client-side pagination
  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return ecommerceOrders.slice(startIndex, endIndex)
  }, [ecommerceOrders, currentPage, pageSize])

  const totalPages = Math.ceil(ecommerceOrders.length / pageSize)

  // Reset to page 1 when filters change
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePaymentStatusFilterChange = (status: string) => {
    setPaymentStatusFilter(status)
    setCurrentPage(1)
  }

  const handleShippingStatusFilterChange = (status: string) => {
    setShippingStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleView = React.useCallback((order: EcommerceOrder) => {
    navigation.push(`/dashboard/ecommerce/orders/${order.id}`)
  }, [navigation])

  const handleEdit = React.useCallback((order: EcommerceOrder) => {
    navigation.push(`/dashboard/ecommerce/orders/${order.id}/edit`)
  }, [navigation])

  const handleDelete = React.useCallback(async (order: EcommerceOrder) => {
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Estás seguro de eliminar la orden "${order.orderNumber}"? Esta acción no se puede deshacer.`,
      {
        title: 'Eliminar Orden',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger',
        icon: <i className="bi bi-exclamation-triangle-fill text-danger" />
      }
    )

    if (confirmed) {
      try {
        await deleteEcommerceOrder(order.id)
        toast.success('Orden eliminada exitosamente')
      } catch (error) {
        console.error('Error deleting order:', error)
        toast.error((error as Error).message || 'Error al eliminar la orden')
      }
    }
  }, [deleteEcommerceOrder, toast])

  const handleCreateNew = React.useCallback(() => {
    navigation.push('/dashboard/ecommerce/orders/create')
  }, [navigation])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle p-3 me-3">
              <i className="bi bi-receipt text-white display-6" />
            </div>
            <div>
              <h1 className="display-5 fw-bold mb-0">Gestión de Órdenes</h1>
              <p className="text-muted lead mb-0">
                Administración de órdenes de comercio electrónico
              </p>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <Button
            variant="primary"
            onClick={handleCreateNew}
          >
            <i className="bi bi-plus-lg me-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-4 text-primary fw-bold">
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" />
                ) : (
                  orderMetrics.totalOrders
                )}
              </div>
              <div className="text-muted small">Total Órdenes</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-4 text-warning fw-bold">
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" />
                ) : (
                  orderMetrics.pendingOrders
                )}
              </div>
              <div className="text-muted small">Órdenes Pendientes</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-4 text-success fw-bold">
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" />
                ) : (
                  orderMetrics.completedOrders
                )}
              </div>
              <div className="text-muted small">Órdenes Completadas</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-success fw-bold fs-5">
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" />
                ) : (
                  formatCurrency(orderMetrics.totalRevenue)
                )}
              </div>
              <div className="text-muted small">Ingresos Totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusFilterChange}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusChange={handlePaymentStatusFilterChange}
        shippingStatusFilter={shippingStatusFilter}
        onShippingStatusChange={handleShippingStatusFilterChange}
      />

      {/* Error State */}
      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 text-danger fs-4" />
            <div className="flex-fill">
              <h6 className="mb-1">Error al cargar órdenes</h6>
              <p className="mb-0 small">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <OrdersTable
        orders={paginatedOrders}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <PaginationSimple
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={ecommerceOrders.length}
        itemsPerPage={pageSize}
      />

      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
})

OrdersAdminPage.displayName = 'OrdersAdminPage'
