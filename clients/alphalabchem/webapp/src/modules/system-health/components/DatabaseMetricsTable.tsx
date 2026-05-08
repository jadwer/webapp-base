'use client'

import type { DatabaseMetrics } from '../types'

interface DatabaseMetricsTableProps {
  metrics: DatabaseMetrics
}

export function DatabaseMetricsTable({ metrics }: DatabaseMetricsTableProps) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-database me-2" aria-hidden="true" />
          Tablas de Base de Datos (Top 15 por Tamano)
        </h6>
        <span className="badge bg-secondary">
          Total: {metrics.totalSizeMb} MB
        </span>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-sm table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Tabla</th>
                <th className="text-end">Registros</th>
                <th className="text-end">Tamano (MB)</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topTables.map((table) => (
                <tr key={table.name}>
                  <td>
                    <code className="small">{table.name}</code>
                  </td>
                  <td className="text-end">{table.rows.toLocaleString()}</td>
                  <td className="text-end">{table.sizeMb.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer text-muted small">
        Driver: {metrics.driver} | Database: {metrics.database}
      </div>
    </div>
  )
}

export default DatabaseMetricsTable
