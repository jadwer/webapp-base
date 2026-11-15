'use client'

import React from 'react'
import type { GuestQuoteRequest } from '../services/cartQuotePdfService'

interface Props {
  value: GuestQuoteRequest
  onChange: (next: GuestQuoteRequest) => void
  disabled?: boolean
  /** Mensaje del backend o de la validacion, siempre visible (nunca un aviso generico). */
  error?: string | null
}

/**
 * Datos que deja el visitante para cotizar sin registrarse (junta con LWM
 * 2026-11-12, J2): nombre, correo, empresa y a quien va dirigida. Cada pagina
 * de carrito lo pinta dentro de su propio modal.
 */
export function GuestQuoteRequestFields({ value, onChange, disabled, error }: Props) {
  const set = (key: keyof GuestQuoteRequest) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value })

  return (
    <div>
      <p className="mb-3">
        Déjanos tus datos y te descargamos la cotización con folio. Nuestro equipo de ventas la recibe y te da seguimiento.
      </p>
      <div className="row g-2">
        <div className="col-md-6">
          <label className="form-label small mb-1" htmlFor="guest-quote-name">Nombre *</label>
          <input id="guest-quote-name" className="form-control" autoComplete="name" value={value.name} onChange={set('name')} disabled={disabled} required />
        </div>
        <div className="col-md-6">
          <label className="form-label small mb-1" htmlFor="guest-quote-email">Correo *</label>
          <input id="guest-quote-email" type="email" className="form-control" autoComplete="email" value={value.email} onChange={set('email')} disabled={disabled} required />
        </div>
        <div className="col-md-6">
          <label className="form-label small mb-1" htmlFor="guest-quote-company">Empresa *</label>
          <input id="guest-quote-company" className="form-control" autoComplete="organization" value={value.company} onChange={set('company')} disabled={disabled} required />
        </div>
        <div className="col-md-6">
          <label className="form-label small mb-1" htmlFor="guest-quote-attention">¿A quién va dirigida? *</label>
          <input id="guest-quote-attention" className="form-control" placeholder="Ej. Laboratorio de microbiología" value={value.attentionTo} onChange={set('attentionTo')} disabled={disabled} required />
        </div>
        <div className="col-md-6">
          <label className="form-label small mb-1" htmlFor="guest-quote-phone">Teléfono</label>
          <input id="guest-quote-phone" type="tel" className="form-control" autoComplete="tel" value={value.phone ?? ''} onChange={set('phone')} disabled={disabled} />
        </div>
        {/* Campo trampa: oculto para personas, lo llenan los bots */}
        <div style={{ position: 'absolute', left: '-10000px' }} aria-hidden="true">
          <label htmlFor="guest-quote-website">Sitio web</label>
          <input id="guest-quote-website" tabIndex={-1} autoComplete="off" value={value.website ?? ''} onChange={set('website')} />
        </div>
      </div>
      {error && <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">{error}</div>}
    </div>
  )
}

export const EMPTY_GUEST_QUOTE: GuestQuoteRequest = { name: '', email: '', company: '', attentionTo: '', phone: '', website: '' }

/** Validacion minima antes de enviar; el backend valida de nuevo. */
export function guestQuoteProblem(v: GuestQuoteRequest): string | null {
  if (!v.name.trim()) return 'Escribe tu nombre.'
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) return 'Escribe un correo válido.'
  if (!v.company.trim()) return 'Escribe el nombre de tu empresa.'
  if (!v.attentionTo.trim()) return 'Escribe a quién va dirigida la cotización.'
  return null
}
