'use client'

import type { QuoteSummary } from '../types'

interface QuoteSummaryCardsProps {
  summary?: QuoteSummary
  isLoading?: boolean
}

export function QuoteSummaryCards({ summary, isLoading }: QuoteSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="row g-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="placeholder-glow" style={{ width: '100px' }}>
                    <span className="placeholder col-12"></span>
                  </div>
                  <div className="placeholder-glow" style={{ width: '20px' }}>
                    <span className="placeholder col-12"></span>
                  </div>
                </div>
                <div className="placeholder-glow">
                  <span className="placeholder col-4 placeholder-lg"></span>
                </div>
                <div className="placeholder-glow mt-2">
                  <span className="placeholder col-8"></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!summary) return null

  const cards = [
    {
      title: 'Total Cotizaciones',
      value: summary.total,
      subtitle: `${summary.draft} borradores, ${summary.sent} enviadas`,
      icon: 'bi-file-text',
      iconColor: 'text-primary'
    },
    {
      title: 'Pendientes',
      value: summary.draft + summary.sent,
      subtitle: `${summary.sent} esperando respuesta`,
      icon: 'bi-clock',
      iconColor: 'text-warning'
    },
    {
      title: 'Aceptadas',
      value: summary.accepted + summary.converted,
      subtitle: `${summary.converted} convertidas a orden`,
      icon: 'bi-check-circle',
      iconColor: 'text-success'
    },
    {
      title: 'Tasa de Conversión',
      value: `${summary.conversionRate}%`,
      subtitle: `${summary.rejected} rechazadas`,
      icon: 'bi-percent',
      iconColor: 'text-info'
    }
  ]

  return (
    <>
      <div className="row g-3">
        {cards.map((card, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-subtitle text-muted mb-0">{card.title}</h6>
                  <i className={`bi ${card.icon} ${card.iconColor}`}></i>
                </div>
                <h3 className="card-title mb-1">{card.value}</h3>
                <small className="text-muted">{card.subtitle}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-subtitle text-muted mb-0">Valor Total Activo</h6>
                <i className="bi bi-currency-dollar text-success"></i>
              </div>
              <h3 className="card-title mb-1">{formatCurrency(summary.totalValue)}</h3>
              <small className="text-muted">
                Cotizaciones activas (borrador, enviadas, aceptadas)
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-subtitle text-muted mb-0">Valor Promedio</h6>
                <i className="bi bi-graph-up text-primary"></i>
              </div>
              <h3 className="card-title mb-1">{formatCurrency(summary.averageValue || 0)}</h3>
              <small className="text-muted">Por cotización activa</small>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
