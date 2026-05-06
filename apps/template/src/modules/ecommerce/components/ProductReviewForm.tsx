/**
 * ProductReviewForm Component
 *
 * Form to submit a product review
 */

'use client'

import { useState } from 'react'
import { useReviewMutations } from '../hooks/useProductReviews'

interface ProductReviewFormProps {
  productId: number
  onSubmitted?: () => void
  onCancel?: () => void
}

export function ProductReviewForm({
  productId,
  onSubmitted,
  onCancel,
}: ProductReviewFormProps) {
  const { createReview, isCreating } = useReviewMutations()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError('Por favor selecciona una calificacion')
      return
    }

    if (!title.trim()) {
      setError('Por favor ingresa un titulo')
      return
    }

    if (!content.trim()) {
      setError('Por favor ingresa tu resena')
      return
    }

    try {
      await createReview({
        productId,
        rating,
        title: title.trim(),
        content: content.trim(),
      })
      setRating(0)
      setTitle('')
      setContent('')
      onSubmitted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la resena')
    }
  }

  const renderStarInput = () => {
    const displayRating = hoverRating || rating

    return (
      <div className="d-flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className="btn btn-link p-0"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{ fontSize: '24px', textDecoration: 'none' }}
          >
            <i
              className={`bi ${star <= displayRating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
            />
          </button>
        ))}
        <span className="ms-2 text-muted align-self-center">
          {rating > 0 && (
            <>
              {rating === 1 && 'Malo'}
              {rating === 2 && 'Regular'}
              {rating === 3 && 'Bueno'}
              {rating === 4 && 'Muy bueno'}
              {rating === 5 && 'Excelente'}
            </>
          )}
        </span>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Escribir una resena</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Calificacion</label>
            {renderStarInput()}
          </div>

          <div className="mb-3">
            <label htmlFor="reviewTitle" className="form-label">
              Titulo
            </label>
            <input
              type="text"
              className="form-control"
              id="reviewTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Resume tu experiencia"
              maxLength={100}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="reviewContent" className="form-label">
              Tu resena
            </label>
            <textarea
              className="form-control"
              id="reviewContent"
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Cuentanos mas sobre tu experiencia con este producto"
              maxLength={2000}
            />
            <div className="form-text">
              {content.length}/2000 caracteres
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Enviando...
                </>
              ) : (
                'Enviar resena'
              )}
            </button>
            {onCancel && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductReviewForm
