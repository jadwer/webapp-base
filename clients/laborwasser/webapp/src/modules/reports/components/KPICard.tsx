/**
 * KPICard Component
 *
 * Displays a single KPI metric with trend
 */

'use client'

interface KPICardProps {
  title: string
  value: string | number
  previousValue?: string | number
  format?: 'number' | 'currency' | 'percentage'
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  isLoading?: boolean
}

export function KPICard({
  title,
  value,
  previousValue,
  format = 'number',
  trend,
  trendValue,
  icon,
  color = 'primary',
  isLoading = false,
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
        }).format(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return new Intl.NumberFormat('es-MX').format(val)
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') return 'bi-arrow-up'
    if (trend === 'down') return 'bi-arrow-down'
    return 'bi-dash'
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success'
    if (trend === 'down') return 'text-danger'
    return 'text-muted'
  }

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
  }

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-6 mb-2" />
            <span className="placeholder col-8" style={{ height: '2rem' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0">{formatValue(value)}</h3>
            {(trend || previousValue !== undefined) && (
              <div className="mt-2 small">
                {trend && trendValue !== undefined && (
                  <span className={getTrendColor()}>
                    <i className={`bi ${getTrendIcon()} me-1`} />
                    {Math.abs(trendValue).toFixed(1)}%
                  </span>
                )}
                {previousValue !== undefined && (
                  <span className="text-muted ms-2">
                    vs {formatValue(previousValue)}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div
              className={`${colorClasses[color]} rounded-circle p-3 text-white`}
              style={{ opacity: 0.8 }}
            >
              <i className={`bi ${icon}`} style={{ fontSize: '1.5rem' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KPICard
