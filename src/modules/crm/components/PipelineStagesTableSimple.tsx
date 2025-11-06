/**
 * Pipeline Stages Table - Simple Implementation
 */

'use client'

import React from 'react'
import type { PipelineStage } from '../types'

interface PipelineStagesTableSimpleProps {
  stages: PipelineStage[]
  onView?: (stage: PipelineStage) => void
  onEdit?: (stage: PipelineStage) => void
  onDelete?: (stage: PipelineStage) => void
}

export const PipelineStagesTableSimple = ({
  stages,
  onView,
  onEdit,
  onDelete,
}: PipelineStagesTableSimpleProps) => {
  if (!stages || stages.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-kanban" style={{ fontSize: '3rem', opacity: 0.3 }} />
          <p className="text-muted mt-3 mb-0">No hay etapas de pipeline registradas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: '60px' }}>Orden</th>
              <th>Nombre</th>
              <th style={{ width: '120px' }}>Probabilidad</th>
              <th style={{ width: '100px' }}>Color</th>
              <th style={{ width: '100px' }}>Estado</th>
              <th style={{ width: '200px' }} className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.id}>
                <td>
                  <span className="badge bg-secondary">{stage.order}</span>
                </td>
                <td>
                  <div>
                    <strong>{stage.name}</strong>
                    {stage.description && (
                      <div className="text-muted small">{stage.description}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${stage.probability}%` }}
                        aria-valuenow={stage.probability}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <span className="text-muted small">{stage.probability}%</span>
                  </div>
                </td>
                <td>
                  {stage.color && (
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: stage.color,
                          borderRadius: '4px',
                          border: '1px solid #dee2e6'
                        }}
                      />
                      <small className="text-muted">{stage.color}</small>
                    </div>
                  )}
                </td>
                <td>
                  {stage.isActive ? (
                    <span className="badge bg-success">Activa</span>
                  ) : (
                    <span className="badge bg-secondary">Inactiva</span>
                  )}
                </td>
                <td className="text-end">
                  <div className="btn-group btn-group-sm" role="group">
                    {onView && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => onView(stage)}
                        title="Ver detalle"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => onEdit(stage)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => onDelete(stage)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
