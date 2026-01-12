/**
 * RatingSummary Component
 *
 * Displays rating summary with distribution
 */

'use client'

interface RatingSummaryProps {
  averageRating: number
  totalReviews: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export function RatingSummary({
  averageRating,
  totalReviews,
  distribution,
}: RatingSummaryProps) {
  const maxCount = Math.max(...Object.values(distribution), 1)

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5

    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map(star => {
          if (star <= fullStars) {
            return <i key={star} className="bi bi-star-fill text-warning" />
          }
          if (star === fullStars + 1 && hasHalf) {
            return <i key={star} className="bi bi-star-half text-warning" />
          }
          return <i key={star} className="bi bi-star text-muted" />
        })}
      </div>
    )
  }

  const renderDistributionBar = (stars: number, count: number) => {
    const percentage = totalReviews > 0 ? (count / maxCount) * 100 : 0

    return (
      <div key={stars} className="d-flex align-items-center gap-2 mb-1">
        <span className="text-nowrap" style={{ width: '60px' }}>
          {stars} estrella{stars !== 1 ? 's' : ''}
        </span>
        <div className="progress flex-grow-1" style={{ height: '8px' }}>
          <div
            className="progress-bar bg-warning"
            role="progressbar"
            style={{ width: `${percentage}%` }}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="text-muted small" style={{ width: '30px', textAlign: 'right' }}>
          {count}
        </span>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 text-center border-end">
            <div className="display-4 fw-bold">{averageRating.toFixed(1)}</div>
            <div className="mb-2">{renderStars(averageRating)}</div>
            <div className="text-muted">
              {totalReviews} {totalReviews === 1 ? 'resena' : 'resenas'}
            </div>
          </div>
          <div className="col-md-8 ps-4">
            <h6 className="mb-3">Distribucion de calificaciones</h6>
            {[5, 4, 3, 2, 1].map(stars =>
              renderDistributionBar(stars, distribution[stars as keyof typeof distribution])
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RatingSummary
