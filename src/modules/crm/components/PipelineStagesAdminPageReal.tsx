/**
 * PIPELINE STAGES ADMIN PAGE - REAL IMPLEMENTATION
 * Página principal de gestión de etapas del pipeline de ventas
 * Simple, profesional, funcional - Patrón AdminPageReal
 */

'use client'

import React, { useState } from 'react'
import { usePipelineStages, usePipelineStagesMutations } from '../hooks'
import { PipelineStagesTableSimple } from './PipelineStagesTableSimple'
import { Button } from '@/ui/components/base/Button'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { PipelineStage } from '../types'

export const PipelineStagesAdminPageReal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const navigation = useNavigationProgress()
  const { deletePipelineStage } = usePipelineStagesMutations()

  // Hook principal con filtros
  const { pipelineStages, isLoading, error, mutate } = usePipelineStages({
    search: searchTerm || undefined,
    isActive: isActiveFilter,
  })

  const handleDelete = async (stage: PipelineStage) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar la etapa "${stage.name}"?\n\nEsta acción no se puede deshacer.`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      await deletePipelineStage(stage.id)

      // Refetch data
      mutate()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const axiosError = error && typeof error === 'object' && 'response' in error
        ? error as { response?: { status?: number; data?: { message?: string } } }
        : null

      // Show user-friendly error message
      if (axiosError?.response?.status === 409 || axiosError?.response?.status === 400) {
        alert('No se puede eliminar la etapa porque tiene leads asociados. Contacta al administrador para reasignar los leads primero.')
      } else {
        alert(`Error al eliminar la etapa: ${axiosError?.response?.data?.message || errorMessage}`)
      }
    }
  }

  const handleView = (stage: PipelineStage) => {
    navigation.push(`/dashboard/crm/pipeline-stages/${stage.id}`)
  }

  const handleEdit = (stage: PipelineStage) => {
    navigation.push(`/dashboard/crm/pipeline-stages/${stage.id}/edit`)
  }

  // Métricas dinámicas
  const stageMetrics = React.useMemo(() => {
    return {
      totalStages: pipelineStages.length,
      activeStages: pipelineStages.filter(s => s.isActive).length,
      inactiveStages: pipelineStages.filter(s => !s.isActive).length,
      avgProbability: pipelineStages.length > 0
        ? Math.round(pipelineStages.reduce((sum, s) => sum + s.probability, 0) / pipelineStages.length)
        : 0
    }
  }, [pipelineStages])

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Etapas del Pipeline</h1>
          <p className="text-muted mb-0">
            Gestión de etapas del proceso de ventas
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => navigation.push('/dashboard/crm/pipeline-stages/create')}
          >
            <i className="bi bi-plus-lg me-2" />
            Nueva Etapa
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Total Etapas</h6>
                  <h3 className="mb-0">{stageMetrics.totalStages}</h3>
                </div>
                <i className="bi bi-kanban" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Etapas Activas</h6>
                  <h3 className="mb-0">{stageMetrics.activeStages}</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Etapas Inactivas</h6>
                  <h3 className="mb-0">{stageMetrics.inactiveStages}</h3>
                </div>
                <i className="bi bi-pause-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Probabilidad Promedio</h6>
                  <h3 className="mb-0">{stageMetrics.avgProbability}%</h3>
                </div>
                <i className="bi bi-graph-up" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Buscar</label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={isActiveFilter === undefined ? '' : isActiveFilter ? 'active' : 'inactive'}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setIsActiveFilter(undefined)
                  } else {
                    setIsActiveFilter(e.target.value === 'active')
                  }
                }}
              >
                <option value="">Todos</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('')
                  setIsActiveFilter(undefined)
                }}
                className="w-100"
              >
                <i className="bi bi-arrow-counterclockwise me-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar las etapas del pipeline: {error.message}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <PipelineStagesTableSimple
          stages={pipelineStages}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
