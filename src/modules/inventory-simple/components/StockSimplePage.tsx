/**
 * STOCK SIMPLE PAGE
 * Página simple para gestión de inventario/stock
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { FilterBar } from './FilterBar'

export const StockSimplePage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">Inventario</h2>
          <p className="text-muted mb-0">Control de stock y niveles de inventario</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => {}}>
            <i className="bi bi-download me-2" />
            Exportar
          </Button>
          <Button variant="primary" onClick={() => {}}>
            <i className="bi bi-plus-lg me-2" />
            Ajuste de Stock
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar productos en stock..."
      />

      {/* Stock Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Productos en Stock</h6>
                  <h3 className="mb-0">1,247</h3>
                </div>
                <i className="bi bi-boxes" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Stock Disponible</h6>
                  <h3 className="mb-0">15,892</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Stock Bajo</h6>
                  <h3 className="mb-0">23</h3>
                </div>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Sin Stock</h6>
                  <h3 className="mb-0">7</h3>
                </div>
                <i className="bi bi-x-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Alert */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Control completo de inventario con niveles de stock,
        alertas automáticas, valorización de inventario y reportes detallados.
      </Alert>

      {/* Preview Content */}
      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-boxes text-muted" style={{ fontSize: '3rem' }} />
            <h3 className="mt-3 mb-2">Control de Inventario</h3>
            <p className="text-muted mb-4">
              Gestiona niveles de stock, movimientos y valorización de tu inventario.
            </p>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-graph-up text-primary mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Niveles de Stock</h6>
                    <small className="text-muted">Mínimos, máximos y puntos de reorden</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-currency-dollar text-success mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Valorización</h6>
                    <small className="text-muted">Costo promedio, FIFO, LIFO</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-bell text-warning mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Alertas</h6>
                    <small className="text-muted">Notificaciones automáticas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}