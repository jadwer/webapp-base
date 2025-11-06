/**
 * Leads Admin Page - Main interface for lead management
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLeads, useLeadsMutations } from '../hooks'
import { LeadsTableSimple } from './LeadsTableSimple'
import type { Lead } from '../types'

export const LeadsAdminPageReal = () => {
  const router = useRouter()

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [ratingFilter, setRatingFilter] = useState<string>('')

  // Fetch leads with filters
  const { leads, isLoading, error, mutate } = useLeads({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    rating: ratingFilter || undefined,
  })

  // Mutations
  const { deleteLead } = useLeadsMutations()

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = leads.length
    const byStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const byRating = leads.reduce((acc, lead) => {
      acc[lead.rating] = (acc[lead.rating] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const totalEstimatedValue = leads.reduce((sum, lead) =>
      sum + (lead.estimatedValue || 0), 0
    )

    return {
      total,
      new: byStatus.new || 0,
      contacted: byStatus.contacted || 0,
      qualified: byStatus.qualified || 0,
      converted: byStatus.converted || 0,
      hot: byRating.hot || 0,
      warm: byRating.warm || 0,
      cold: byRating.cold || 0,
      totalValue: totalEstimatedValue,
    }
  }, [leads])

  // Handlers
  const handleView = (lead: Lead) => {
    router.push(`/dashboard/crm/leads/${lead.id}`)
  }

  const handleEdit = (lead: Lead) => {
    router.push(`/dashboard/crm/leads/${lead.id}/edit`)
  }

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`¿Está seguro de eliminar el lead "${lead.title}"?`)) {
      return
    }

    try {
      await deleteLead(lead.id)
      await mutate()
      alert('Lead eliminado exitosamente')
    } catch (error: any) {
      console.error('Error deleting lead:', error)

      // Check for foreign key constraint error
      if (error.response?.status === 409) {
        alert('No se puede eliminar el lead porque tiene relaciones asociadas (campañas, actividades, etc.)')
      } else {
        alert('Error al eliminar el lead. Por favor intente nuevamente.')
      }
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setRatingFilter('')
  }

  const hasActiveFilters = searchTerm || statusFilter || ratingFilter

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar los leads. Por favor intente nuevamente.
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Leads</h1>
              <p className="text-muted mb-0">Gestión de oportunidades de negocio</p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push('/dashboard/crm/leads/create')}
            >
              <i className="bi bi-plus-lg me-2" />
              Nuevo Lead
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded p-3">
                    <i className="bi bi-person-badge text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Total Leads</h6>
                  <h3 className="mb-0">{metrics.total}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded p-3">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Convertidos</h6>
                  <h3 className="mb-0">{metrics.converted}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded p-3">
                    <i className="bi bi-fire text-danger" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Calientes</h6>
                  <h3 className="mb-0">{metrics.hot}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded p-3">
                    <i className="bi bi-currency-dollar text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Valor Total</h6>
                  <h3 className="mb-0">${metrics.totalValue.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-start border-primary border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Nuevos</span>
                <span className="badge bg-primary">{metrics.new}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-start border-info border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Contactados</span>
                <span className="badge bg-info">{metrics.contacted}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-start border-warning border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Calificados</span>
                <span className="badge bg-warning">{metrics.qualified}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-start border-info border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Tibios</span>
                <span className="badge bg-info">{metrics.warm}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label htmlFor="search" className="form-label small text-muted mb-1">
                Buscar
              </label>
              <input
                id="search"
                type="text"
                className="form-control"
                placeholder="Buscar por título, empresa, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label htmlFor="status" className="form-label small text-muted mb-1">
                Estado
              </label>
              <select
                id="status"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="qualified">Calificado</option>
                <option value="proposal">Propuesta</option>
                <option value="negotiation">Negociación</option>
                <option value="converted">Convertido</option>
                <option value="lost">Perdido</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label htmlFor="rating" className="form-label small text-muted mb-1">
                Rating
              </label>
              <select
                id="rating"
                className="form-select"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="">Todos los ratings</option>
                <option value="hot">Caliente</option>
                <option value="warm">Tibio</option>
                <option value="cold">Frío</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="col-12 col-md-2 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={handleClearFilters}
                >
                  <i className="bi bi-x-circle me-1" />
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted mt-3 mb-0">Cargando leads...</p>
          </div>
        </div>
      ) : (
        <LeadsTableSimple
          leads={leads}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
