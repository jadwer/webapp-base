'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/ui/components/base'
import { usePublicSettings } from '@/modules/app-config'

export const NewsletterPageClient: React.FC = () => {
  const { get } = usePublicSettings()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const interestOptions = [
    { value: 'reactivos', label: 'Reactivos quimicos' },
    { value: 'equipos', label: 'Equipos de laboratorio' },
    { value: 'consumibles', label: 'Consumibles y material' },
    { value: 'ofertas', label: 'Ofertas y promociones' },
    { value: 'novedades', label: 'Nuevos productos' },
  ]

  const handleInterestChange = (value: string) => {
    setInterests(prev =>
      prev.includes(value)
        ? prev.filter(i => i !== value)
        : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Store in localStorage
      const subscriptions = JSON.parse(localStorage.getItem('lw_newsletter_subscriptions') || '[]')
      subscriptions.push({
        email,
        name,
        interests,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('lw_newsletter_subscriptions', JSON.stringify(subscriptions))

      // Build WhatsApp message for notification
      const interestLabels = interests.map(i =>
        interestOptions.find(o => o.value === i)?.label || i
      ).join(', ')

      const whatsappMessage = encodeURIComponent(
        `*Nueva suscripcion a Newsletter - ${get('company.name') || 'Empresa'}*\n\n` +
        `*Nombre:* ${name}\n` +
        `*Email:* ${email}\n` +
        `*Intereses:* ${interestLabels || 'No especificados'}`
      )

      // Open WhatsApp to notify (optional)
      const whatsappUrl = `https://wa.me/${get('company.whatsapp_number')}?text=${whatsappMessage}`
      window.open(whatsappUrl, '_blank')

      setStatus('success')
      setEmail('')
      setName('')
      setInterests([])
    } catch {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <i className="bi bi-envelope-paper display-1 text-primary mb-4 d-block"></i>
          <h1 className="display-4 fw-bold">Newsletter</h1>
          <p className="lead text-muted">
            Mantente informado sobre ofertas, nuevos productos y novedades
          </p>
          <hr className="w-25 mx-auto" />
        </div>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Newsletter
          </li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Benefits */}
          <div className="row mb-5">
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-tag-fill text-primary fs-2"></i>
              </div>
              <h5>Ofertas Exclusivas</h5>
              <p className="text-muted small">Recibe descuentos especiales solo para suscriptores</p>
            </div>
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-box-seam text-success fs-2"></i>
              </div>
              <h5>Nuevos Productos</h5>
              <p className="text-muted small">Se el primero en conocer nuestras novedades</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-journal-text text-info fs-2"></i>
              </div>
              <h5>Contenido Util</h5>
              <p className="text-muted small">Tips y articulos sobre el mundo del laboratorio</p>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              {status === 'success' ? (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle-fill text-success display-1 mb-4 d-block"></i>
                  <h3 className="text-success mb-3">Gracias por suscribirte</h3>
                  <p className="text-muted mb-4">
                    Te hemos enviado un mensaje por WhatsApp para confirmar tu suscripcion.
                    Pronto recibiras nuestras novedades.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link href="/productos">
                      <Button variant="primary">
                        <i className="bi bi-grid me-2"></i>
                        Ver Productos
                      </Button>
                    </Link>
                    <Link href="/ofertas">
                      <Button variant="success" buttonStyle="outline">
                        <i className="bi bi-tag me-2"></i>
                        Ver Ofertas
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h4 className="mb-4 text-center">Suscribete a nuestro Newsletter</h4>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo electronico</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Que te interesa? (opcional)</label>
                    <div className="row g-2">
                      {interestOptions.map((option) => (
                        <div key={option.value} className="col-6 col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={option.value}
                              checked={interests.includes(option.value)}
                              onChange={() => handleInterestChange(option.value)}
                            />
                            <label className="form-check-label" htmlFor={option.value}>
                              {option.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="alert alert-danger mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Hubo un error. Por favor intenta de nuevo.
                    </div>
                  )}

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      size="large"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Suscribiendo...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope-check me-2"></i>
                          Suscribirme
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-muted small text-center mt-3 mb-0">
                    <i className="bi bi-shield-check me-1"></i>
                    No compartimos tu informacion. Puedes cancelar en cualquier momento.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Contact Alternative */}
          <div className="text-center mt-5">
            <p className="text-muted mb-3">
              Prefieres contactarnos directamente?
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <a
                href={`https://wa.me/${get('company.whatsapp_number')}`}
                className="btn btn-success"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-whatsapp me-2"></i>
                WhatsApp
              </a>
              <a
                href={`mailto:${get('company.email')}`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-envelope me-2"></i>
                Email
              </a>
              <a href={`tel:${get('company.phone').replace(/\s/g, '')}`} className="btn btn-outline-secondary">
                <i className="bi bi-telephone me-2"></i>
                Llamar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
