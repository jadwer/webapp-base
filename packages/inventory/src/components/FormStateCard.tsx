/**
 * FORM STATE CARD
 * Estados de carga, error y no encontrado de los wrappers de alta/edicion,
 * con el mismo esqueleto de formulario (container > row > col-lg-8).
 */

import type { ReactNode } from 'react'
import { PageHeader } from '@lwm/ui'

interface FormStateCardProps {
  state: 'loading' | 'error' | 'not-found'
  /** Titulo del encabezado (p.ej. "Editar ubicación") */
  title: string
  backHref?: string
  /** Texto bajo el spinner o del mensaje */
  message?: ReactNode
  /** Icono del estado no encontrado */
  icon?: string
}

const DEFAULT_MESSAGES = {
  loading: 'Cargando datos...',
  error: 'No se pudo cargar la información.',
  'not-found': 'El registro solicitado no existe o no está disponible.',
}

export const FormStateCard = ({ state, title, backHref, message, icon = 'bi-search' }: FormStateCardProps) => (
  <div className="container-fluid py-4">
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <PageHeader title={title} backHref={backHref} />
        {state === 'loading' && (
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 mb-0 text-muted">{message || DEFAULT_MESSAGES.loading}</p>
            </div>
          </div>
        )}
        {state === 'error' && (
          <div className="alert alert-danger mb-0" role="alert">
            <i className="bi bi-exclamation-triangle me-2" />
            {message || DEFAULT_MESSAGES.error}
          </div>
        )}
        {state === 'not-found' && (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className={`bi ${icon} display-4 text-muted`} aria-hidden="true" />
              <h5 className="mt-3">Registro no encontrado</h5>
              <p className="text-muted mb-0">{message || DEFAULT_MESSAGES['not-found']}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)

export default FormStateCard
