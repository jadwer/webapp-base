/**
 * INVENTORY DASHBOARD - MAIN PAGE
 * Página de resumen principal del módulo de inventario
 * Dashboard con métricas, gráficos y accesos rápidos
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/ui/components/base/Button'

export default function InventoryDashboardPage() {
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Gestión de Inventario</h1>
          <p className="text-muted mb-0">
            Control integral de almacenes, ubicaciones, stock y movimientos
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm">
            <i className="bi bi-download me-2" />
            Exportar Reporte
          </Button>
          <Button variant="primary" size="sm">
            <i className="bi bi-plus-lg me-2" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Almacenes</h6>
                  <h2 className="mb-0">--</h2>
                  <small className="text-white-75">Activos</small>
                </div>
                <i className="bi bi-building" style={{ fontSize: '2.5rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Ubicaciones</h6>
                  <h2 className="mb-0">--</h2>
                  <small className="text-white-75">Disponibles</small>
                </div>
                <i className="bi bi-geo-alt" style={{ fontSize: '2.5rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Productos</h6>
                  <h2 className="mb-0">--</h2>
                  <small className="text-white-75">En stock</small>
                </div>
                <i className="bi bi-boxes" style={{ fontSize: '2.5rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Movimientos</h6>
                  <h2 className="mb-0">--</h2>
                  <small className="text-white-75">Este mes</small>
                </div>
                <i className="bi bi-arrow-left-right" style={{ fontSize: '2.5rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-transparent">
              <h5 className="card-title mb-0">
                <i className="bi bi-speedometer2 me-2 text-primary" />
                Accesos Rápidos
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <Link 
                    href="/dashboard/inventory/warehouses" 
                    className="btn btn-outline-primary btn-lg w-100 d-flex flex-column align-items-center py-3"
                  >
                    <i className="bi bi-building mb-2" style={{ fontSize: '2rem' }} />
                    <span>Almacenes</span>
                  </Link>
                </div>
                <div className="col-6">
                  <Link 
                    href="/dashboard/inventory/locations" 
                    className="btn btn-outline-info btn-lg w-100 d-flex flex-column align-items-center py-3"
                  >
                    <i className="bi bi-geo-alt mb-2" style={{ fontSize: '2rem' }} />
                    <span>Ubicaciones</span>
                  </Link>
                </div>
                <div className="col-6">
                  <Link 
                    href="/dashboard/inventory/stock" 
                    className="btn btn-outline-success btn-lg w-100 d-flex flex-column align-items-center py-3"
                  >
                    <i className="bi bi-boxes mb-2" style={{ fontSize: '2rem' }} />
                    <span>Stock</span>
                  </Link>
                </div>
                <div className="col-6">
                  <Link 
                    href="/dashboard/inventory/movements" 
                    className="btn btn-outline-warning btn-lg w-100 d-flex flex-column align-items-center py-3"
                  >
                    <i className="bi bi-arrow-left-right mb-2" style={{ fontSize: '2rem' }} />
                    <span>Movimientos</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header bg-transparent">
              <h5 className="card-title mb-0">
                <i className="bi bi-activity me-2 text-success" />
                Actividad Reciente
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-4">
                <i className="bi bi-clock-history text-muted mb-3" style={{ fontSize: '3rem' }} />
                <h6 className="text-muted">Actividad Reciente</h6>
                <p className="text-muted mb-0">
                  Los movimientos recientes aparecerán aquí
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y Notificaciones */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-transparent">
              <h5 className="card-title mb-0">
                <i className="bi bi-bell me-2 text-warning" />
                Alertas de Stock
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-4">
                <i className="bi bi-shield-check text-success mb-3" style={{ fontSize: '3rem' }} />
                <h6 className="text-success">Sistema Operativo</h6>
                <p className="text-muted mb-0">
                  No hay alertas críticas de stock en este momento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}