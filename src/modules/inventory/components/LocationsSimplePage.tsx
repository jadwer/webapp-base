/**
 * LOCATIONS SIMPLE PAGE
 * Página simple para gestión de ubicaciones de almacén
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { FilterBar } from './FilterBar'

export const LocationsSimplePage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">Ubicaciones</h2>
          <p className="text-muted mb-0">Gestión de ubicaciones dentro de almacenes</p>
        </div>
        <Button variant="primary" onClick={() => {}}>
          <i className="bi bi-plus-lg me-2" />
          Agregar Ubicación
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar ubicaciones..."
      />

      {/* Coming Soon Alert */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Gestión completa de ubicaciones de almacén.
        Funcionalidades incluirán: códigos de ubicación, capacidades, tipos, y asignación a almacenes.
      </Alert>

      {/* Preview Content */}
      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-geo-alt text-muted" style={{ fontSize: '3rem' }} />
            <h3 className="mt-3 mb-2">Ubicaciones de Almacén</h3>
            <p className="text-muted mb-4">
              Organiza y gestiona las ubicaciones físicas dentro de tus almacenes.
            </p>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-grid-3x3-gap text-primary mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Pasillos</h6>
                    <small className="text-muted">Organización por pasillos</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-layers text-success mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Estantes</h6>
                    <small className="text-muted">Niveles y estantes</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-box text-warning mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Compartimentos</h6>
                    <small className="text-muted">Espacios específicos</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center py-3">
                    <i className="bi bi-qr-code text-info mb-2" style={{ fontSize: '1.5rem' }} />
                    <h6 className="mb-1">Códigos QR</h6>
                    <small className="text-muted">Identificación rápida</small>
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