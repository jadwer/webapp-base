/**
 * ProductReviewCard Component
 *
 * Displays a single product review
 */

'use client'

import { useReviewMutations } from '../hooks/useProductReviews'

interface ProductReview {
  id: string
  userId: number
  rating: number
  title: string
  content: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  user?: {
    id: number
    name: string
  }
}

interface ProductReviewCardProps {
  review: ProductReview
  currentUserId?: number
  onDeleted?: () => void
}

export function ProductReviewCard({
  review,
  currentUserId,
  onDeleted,
}: ProductReviewCardProps) {
  const { deleteReview, isDeleting } = useReviewMutations()

  const isOwner = currentUserId === review.userId

  const handleDelete = async () => {
    if (!confirm('Estas seguro de eliminar esta resena?')) return
    try {
      await deleteReview(review.id)
      onDeleted?.()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            {renderStars(review.rating)}
            <h6 className="mt-2 mb-1">{review.title}</h6>
          </div>
          {isOwner && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <i className="bi bi-trash" />
              )}
            </button>
          )}
        </div>

        <p className="text-muted small mb-2">
          Por <strong>{review.user?.name || 'Usuario'}</strong>
          {' - '}
          {formatDate(review.createdAt)}
          {review.isVerifiedPurchase && (
            <span className="badge bg-success ms-2">
              <i className="bi bi-check-circle me-1" />
              Compra verificada
            </span>
          )}
        </p>

        <p className="mb-3">{review.content}</p>

        {review.helpfulCount > 0 && (
          <div className="text-muted small">
            <i className="bi bi-hand-thumbs-up me-1" />
            {review.helpfulCount} personas encontraron esto util
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductReviewCard
