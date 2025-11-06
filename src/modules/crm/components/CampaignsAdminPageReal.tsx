/**
 * Campaigns Admin Page - Main interface for campaign management
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCampaigns, useCampaignsMutations } from '../hooks'
import { CampaignsTableSimple } from './CampaignsTableSimple'
import type { Campaign } from '../types'

export const CampaignsAdminPageReal = () => {
  const router = useRouter()

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Fetch campaigns with filters
  const { campaigns, isLoading, error, mutate } = useCampaigns({
    search: searchTerm || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  })

  // Mutations
  const { deleteCampaign } = useCampaignsMutations()

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = campaigns.length
    const byStatus = campaigns.reduce((acc, campaign) => {
      acc[campaign.status] = (acc[campaign.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const totalBudget = campaigns.reduce((sum, campaign) =>
      sum + (campaign.budget || 0), 0
    )
    const totalActualCost = campaigns.reduce((sum, campaign) =>
      sum + (campaign.actualCost || 0), 0
    )
    const totalExpectedRevenue = campaigns.reduce((sum, campaign) =>
      sum + (campaign.expectedRevenue || 0), 0
    )
    const totalActualRevenue = campaigns.reduce((sum, campaign) =>
      sum + (campaign.actualRevenue || 0), 0
    )
    const totalROI = totalActualCost > 0
      ? ((totalActualRevenue - totalActualCost) / totalActualCost) * 100
      : 0

    return {
      total,
      active: byStatus.active || 0,
      planning: byStatus.planning || 0,
      paused: byStatus.paused || 0,
      completed: byStatus.completed || 0,
      cancelled: byStatus.cancelled || 0,
      totalBudget,
      totalActualCost,
      totalExpectedRevenue,
      totalActualRevenue,
      totalROI,
    }
  }, [campaigns])

  // Handlers
  const handleView = (campaign: Campaign) => {
    router.push(`/dashboard/crm/campaigns/${campaign.id}`)
  }

  const handleEdit = (campaign: Campaign) => {
    router.push(`/dashboard/crm/campaigns/${campaign.id}/edit`)
  }

  const handleDelete = async (campaign: Campaign) => {
    if (!window.confirm(`¿Está seguro de eliminar la campaña "${campaign.name}"?`)) {
      return
    }

    try {
      await deleteCampaign(campaign.id)
      await mutate()
      alert('Campaña eliminada exitosamente')
    } catch (error: any) {
      console.error('Error deleting campaign:', error)

      // Check for foreign key constraint error
      if (error.response?.status === 409) {
        alert('No se puede eliminar la campaña porque tiene leads asociados')
      } else {
        alert('Error al eliminar la campaña. Por favor intente nuevamente.')
      }
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setStatusFilter('')
  }

  const hasActiveFilters = searchTerm || typeFilter || statusFilter

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar las campañas. Por favor intente nuevamente.
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
              <h1 className="h3 mb-1">Campañas</h1>
              <p className="text-muted mb-0">Gestión de campañas de marketing y ventas</p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push('/dashboard/crm/campaigns/create')}
            >
              <i className="bi bi-plus-lg me-2" />
              Nueva Campaña
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
                    <i className="bi bi-megaphone text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Total Campañas</h6>
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
                  <h6 className="mb-0 text-muted">Activas</h6>
                  <h3 className="mb-0">{metrics.active}</h3>
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
                  <div className="bg-primary bg-opacity-10 rounded p-3">
                    <i className="bi bi-archive text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">Completadas</h6>
                  <h3 className="mb-0">{metrics.completed}</h3>
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
                  <div className={`bg-${metrics.totalROI >= 0 ? 'success' : 'danger'} bg-opacity-10 rounded p-3`}>
                    <i className={`bi bi-graph-up text-${metrics.totalROI >= 0 ? 'success' : 'danger'}`} style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0 text-muted">ROI Total</h6>
                  <h3 className="mb-0">
                    {metrics.totalROI > 0 ? '+' : ''}{metrics.totalROI.toFixed(1)}%
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-start border-primary border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Presupuesto Total</span>
                <span className="fw-bold text-primary">${metrics.totalBudget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-start border-danger border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Costo Real</span>
                <span className="fw-bold text-danger">${metrics.totalActualCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-start border-success border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Ingresos Reales</span>
                <span className="fw-bold text-success">${metrics.totalActualRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-start border-secondary border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Planeación</span>
                <span className="badge bg-secondary">{metrics.planning}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-start border-success border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Activas</span>
                <span className="badge bg-success">{metrics.active}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-start border-warning border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Pausadas</span>
                <span className="badge bg-warning">{metrics.paused}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-start border-danger border-4">
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Canceladas</span>
                <span className="badge bg-danger">{metrics.cancelled}</span>
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
                placeholder="Buscar por nombre, descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label htmlFor="type" className="form-label small text-muted mb-1">
                Tipo
              </label>
              <select
                id="type"
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="email">Email</option>
                <option value="social_media">Redes Sociales</option>
                <option value="event">Evento</option>
                <option value="webinar">Webinar</option>
                <option value="direct_mail">Correo Directo</option>
                <option value="telemarketing">Telemarketing</option>
              </select>
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
                <option value="planning">Planeación</option>
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
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
            <p className="text-muted mt-3 mb-0">Cargando campañas...</p>
          </div>
        </div>
      ) : (
        <CampaignsTableSimple
          campaigns={campaigns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
