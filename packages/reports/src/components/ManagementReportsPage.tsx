/**
 * Management Reports Page - Sales and Purchase Analysis
 */

'use client'

import React, { useState } from 'react'
import { useSalesByCustomer, useSalesByProduct, usePurchaseBySupplier, usePurchaseByProduct } from '../hooks'

export const ManagementReportsPage = () => {
  // Default dates (first day of year to today)
  const today = new Date().toISOString().split('T')[0]
  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]

  // Filters
  const [startDate, setStartDate] = useState(firstDayOfYear)
  const [endDate, setEndDate] = useState(today)
  const [currency, setCurrency] = useState('MXN')

  // Fetch reports
  const { salesByCustomer, isLoading: loadingSC, error: errorSC } = useSalesByCustomer({ startDate, endDate, currency })
  const { salesByProduct, isLoading: loadingSP, error: errorSP } = useSalesByProduct({ startDate, endDate, currency })
  const { purchaseBySupplier, isLoading: loadingPS, error: errorPS } = usePurchaseBySupplier({ startDate, endDate, currency })
  const { purchaseByProduct, isLoading: loadingPP, error: errorPP } = usePurchaseByProduct({ startDate, endDate, currency })

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0.00'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-graph-up me-3" />
                Reportes Gerenciales
              </h1>
              <p className="text-muted">
                Analisis de ventas y compras por cliente, proveedor y producto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label htmlFor="startDate" className="form-label small text-muted mb-1">
                Fecha Inicio
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="endDate" className="form-label small text-muted mb-1">
                Fecha Fin
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <label htmlFor="currency" className="form-label small text-muted mb-1">
                Moneda
              </label>
              <select
                id="currency"
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dolar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Customer */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-people me-2" />
            Ventas por Cliente
          </h5>
        </div>
        <div className="card-body">
          {loadingSC && (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando reporte de ventas por cliente...</p>
            </div>
          )}
          {errorSC && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para ventas por cliente en este periodo
            </div>
          )}
          {!loadingSC && !errorSC && salesByCustomer && (
            <div>
              <div className="alert alert-success d-flex justify-content-between align-items-center mb-4">
                <strong>Total Ventas:</strong>
                <span className="h4 mb-0">{formatCurrency(salesByCustomer.totalSales)}</span>
              </div>

              {salesByCustomer.customers && salesByCustomer.customers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Cliente</th>
                        <th className="text-center">Pedidos</th>
                        <th className="text-end">Total Ventas</th>
                        <th className="text-end">Ticket Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByCustomer.customers.map((customer) => (
                        <tr key={customer.contactId}>
                          <td>{customer.contactName}</td>
                          <td className="text-center">
                            <span className="badge bg-primary">{customer.orderCount}</span>
                          </td>
                          <td className="text-end"><strong>{formatCurrency(customer.totalSales)}</strong></td>
                          <td className="text-end text-muted">{formatCurrency(customer.averageOrderValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-4 d-block mb-3" />
                  No hay ventas en este periodo
                </div>
              )}
            </div>
          )}
          {!loadingSC && !errorSC && !salesByCustomer && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Sales by Product */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="bi bi-box me-2" />
            Ventas por Producto
          </h5>
        </div>
        <div className="card-body">
          {loadingSP && (
            <div className="text-center py-4">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando reporte de ventas por producto...</p>
            </div>
          )}
          {errorSP && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para ventas por producto en este periodo
            </div>
          )}
          {!loadingSP && !errorSP && salesByProduct && (
            <div>
              <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                <strong>Total Ingresos:</strong>
                <span className="h4 mb-0">{formatCurrency(salesByProduct.totalRevenue)}</span>
              </div>

              {salesByProduct.products && salesByProduct.products.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad Vendida</th>
                        <th className="text-end">Total Ingresos</th>
                        <th className="text-end">Precio Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByProduct.products.map((product) => (
                        <tr key={product.productId}>
                          <td>{product.productName}</td>
                          <td className="text-center">
                            <span className="badge bg-secondary">{product.quantitySold}</span>
                          </td>
                          <td className="text-end"><strong>{formatCurrency(product.totalRevenue)}</strong></td>
                          <td className="text-end text-muted">{formatCurrency(product.averagePrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-4 d-block mb-3" />
                  No hay productos vendidos en este periodo
                </div>
              )}
            </div>
          )}
          {!loadingSP && !errorSP && !salesByProduct && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Purchase by Supplier */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-truck me-2" />
            Compras por Proveedor
          </h5>
        </div>
        <div className="card-body">
          {loadingPS && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando reporte de compras por proveedor...</p>
            </div>
          )}
          {errorPS && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para compras por proveedor en este periodo
            </div>
          )}
          {!loadingPS && !errorPS && purchaseBySupplier && (
            <div>
              <div className="alert alert-primary d-flex justify-content-between align-items-center mb-4">
                <strong>Total Compras:</strong>
                <span className="h4 mb-0">{formatCurrency(purchaseBySupplier.totalPurchases)}</span>
              </div>

              {purchaseBySupplier.suppliers && purchaseBySupplier.suppliers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Proveedor</th>
                        <th className="text-center">Ordenes</th>
                        <th className="text-end">Total Compras</th>
                        <th className="text-end">Ticket Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseBySupplier.suppliers.map((supplier) => (
                        <tr key={supplier.contactId}>
                          <td>{supplier.contactName}</td>
                          <td className="text-center">
                            <span className="badge bg-primary">{supplier.orderCount}</span>
                          </td>
                          <td className="text-end"><strong>{formatCurrency(supplier.totalPurchases)}</strong></td>
                          <td className="text-end text-muted">{formatCurrency(supplier.averageOrderValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-4 d-block mb-3" />
                  No hay compras en este periodo
                </div>
              )}
            </div>
          )}
          {!loadingPS && !errorPS && !purchaseBySupplier && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Purchase by Product */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">
            <i className="bi bi-box-seam me-2" />
            Compras por Producto
          </h5>
        </div>
        <div className="card-body">
          {loadingPP && (
            <div className="text-center py-4">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando reporte de compras por producto...</p>
            </div>
          )}
          {errorPP && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para compras por producto en este periodo
            </div>
          )}
          {!loadingPP && !errorPP && purchaseByProduct && (
            <div>
              <div className="alert alert-secondary d-flex justify-content-between align-items-center mb-4">
                <strong>Total Costo:</strong>
                <span className="h4 mb-0">{formatCurrency(purchaseByProduct.totalCost)}</span>
              </div>

              {purchaseByProduct.products && purchaseByProduct.products.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad Comprada</th>
                        <th className="text-end">Total Costo</th>
                        <th className="text-end">Precio Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseByProduct.products.map((product) => (
                        <tr key={product.productId}>
                          <td>{product.productName}</td>
                          <td className="text-center">
                            <span className="badge bg-secondary">{product.quantityPurchased}</span>
                          </td>
                          <td className="text-end"><strong>{formatCurrency(product.totalCost)}</strong></td>
                          <td className="text-end text-muted">{formatCurrency(product.averagePrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-4 d-block mb-3" />
                  No hay productos comprados en este periodo
                </div>
              )}
            </div>
          )}
          {!loadingPP && !errorPP && !purchaseByProduct && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
