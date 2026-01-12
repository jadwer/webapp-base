'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/ui/components/base'
import { useToast } from '@/ui/hooks/useToast'
import styles from './NecesitasCotizacion.module.scss'

// LocalStorage key for quote requests
const QUOTE_REQUESTS_KEY = 'laborwasser_quote_requests'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface QuoteRequest {
  id: string
  email: string
  createdAt: string
  status: 'pending' | 'sent'
}

// Save quote request to localStorage
function saveQuoteRequest(email: string): void {
  const requests: QuoteRequest[] = JSON.parse(
    localStorage.getItem(QUOTE_REQUESTS_KEY) || '[]'
  )

  const newRequest: QuoteRequest = {
    id: `quote_${Date.now()}`,
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  }

  requests.push(newRequest)
  localStorage.setItem(QUOTE_REQUESTS_KEY, JSON.stringify(requests))
}

export const NecesitasCotizacion: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const toast = useToast()

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('El email es requerido')
      return false
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Ingresa un email valido')
      return false
    }
    setEmailError(null)
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (emailError) {
      validateEmail(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      return
    }

    setIsSubmitting(true)

    try {
      // Try to submit to backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'leads',
            attributes: {
              title: `Solicitud de cotizacion - ${email}`,
              status: 'new',
              rating: 'warm',
              source: 'website',
              email: email.trim().toLowerCase(),
              notes: 'Solicitud de cotizacion desde landing page Labor Wasser',
            },
          },
        }),
      })

      if (response.ok) {
        toast.success('Gracias! Te contactaremos pronto para tu cotizacion.')
        setEmail('')
      } else {
        // API not available or requires auth - save locally as fallback
        saveQuoteRequest(email)
        toast.success('Gracias! Te contactaremos pronto para tu cotizacion.')
        setEmail('')
      }
    } catch {
      // Network error - save locally as fallback
      saveQuoteRequest(email)
      toast.success('Gracias! Te contactaremos pronto para tu cotizacion.')
      setEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Hola, me interesa solicitar una cotización para productos de laboratorio.')
    const whatsappUrl = `https://wa.me/525557621412?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePhoneContact = () => {
    window.location.href = 'tel:+525557621412'
  }

  return (
    <section id="cotizacion" className={styles.necesitasCotizacion}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className={styles.content}>
              <h2 className={styles.title}>¿NECESITAS UNA COTIZACIÓN?</h2>
              <p className={styles.description}>
                Nuestros especialistas están listos para brindarte la mejor atención personalizada. 
                Contamos con precios competitivos y condiciones especiales para instituciones 
                educativas y compras por volumen.
              </p>

              <div className={styles.benefits}>
                <div className={styles.benefit}>
                  <i className="bi bi-check-circle-fill" />
                  <span>Precios especiales por volumen</span>
                </div>
                <div className={styles.benefit}>
                  <i className="bi bi-check-circle-fill" />
                  <span>Asesoría técnica especializada</span>
                </div>
                <div className={styles.benefit}>
                  <i className="bi bi-check-circle-fill" />
                  <span>Respuesta en menos de 24 horas</span>
                </div>
                <div className={styles.benefit}>
                  <i className="bi bi-check-circle-fill" />
                  <span>Condiciones preferenciales para instituciones</span>
                </div>
              </div>

              <div className={styles.contactOptions}>
                <Button 
                  variant="success" 
                  size="large"
                  className={styles.whatsappButton}
                  onClick={handleWhatsAppContact}
                >
                  <i className="bi bi-whatsapp" />
                  WhatsApp
                </Button>
                <Button 
                  variant="secondary" 
                  buttonStyle="outline"
                  size="large"
                  className={styles.phoneButton}
                  onClick={handlePhoneContact}
                >
                  <i className="bi bi-telephone" />
                  01 55 5762 1412
                </Button>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className={styles.formContainer}>
              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Solicita tu Cotización</h3>
                <p className={styles.formSubtitle}>
                  Déjanos tu email y un especialista te contactará
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => validateEmail(email)}
                      required
                      className={styles.emailInput}
                      leftIcon="bi-envelope"
                      errorText={emailError || undefined}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="success" 
                    size="large"
                    className={styles.submitButton}
                    disabled={isSubmitting || !email.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="bi bi-arrow-clockwise spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send" />
                        Solicitar Cotización
                      </>
                    )}
                  </Button>
                </form>

                <div className={styles.privacy}>
                  <i className="bi bi-shield-check" />
                  <span>Tus datos están protegidos y no serán compartidos con terceros</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.decorationShape1}></div>
        <div className={styles.decorationShape2}></div>
      </div>
    </section>
  )
}