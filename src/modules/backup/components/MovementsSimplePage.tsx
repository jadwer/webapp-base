/**
 * MOVEMENTS SIMPLE PAGE
 * Página simple para gestión de movimientos de inventario
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { FilterBar } from './FilterBar'

export const MovementsSimplePage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">Movimientos de Inventario</h2>
          <p className="text-muted mb-0">Historial y registro de movimientos de stock</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-success" onClick={() => {}}>
            <i className="bi bi-box-arrow-in-down me-2" />
            Entrada
          </Button>
          <Button variant="outline-danger" onClick={() => {}}>
            <i className="bi bi-box-arrow-up me-2" />
            Salida
          </Button>
          <Button variant="primary" onClick={() => {}}>
            <i className="bi bi-arrow-left-right me-2" />
            Transferencia
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar movimientos..."
      />

      {/* Movement Types Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Entradas Hoy</h6>
                  <h3 className="mb-0">47</h3>
                </div>
                <i className="bi bi-box-arrow-in-down" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Salidas Hoy</h6>
                  <h3 className="mb-0">32</h3>
                </div>
                <i className="bi bi-box-arrow-up" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Transferencias</h6>
                  <h3 className="mb-0">12</h3>
                </div>
                <i className="bi bi-arrow-left-right" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Ajustes</h6>
                  <h3 className="mb-0">5</h3>
                </div>
                <i className="bi bi-gear" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Alert */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Sistema completo de trazabilidad con registros detallados,
        motivos de movimiento, autorización de usuarios y reportes de actividad.
      </Alert>

      {/* Recent Movements Preview */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Movimientos Recientes</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <i className="bi bi-arrow-left-right text-muted" style={{ fontSize: '3rem' }} />
            <h4 className="mt-3 mb-2">Trazabilidad Completa</h4>
            <p className="text-muted mb-4">
              Registra y consulta todos los movimientos de inventario con detalles completos.
            </p>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-clock-history text-primary mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Historial Completo</h6>
                    <small className="text-muted">Fechas, usuarios, motivos y cantidades</small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-file-earmark-text text-success mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Reportes</h6>
                    <small className="text-muted">Análisis de movimientos y tendencias</small>
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