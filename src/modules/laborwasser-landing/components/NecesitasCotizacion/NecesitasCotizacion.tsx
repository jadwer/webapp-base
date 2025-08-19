'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/ui/components/base'
import styles from './NecesitasCotizacion.module.scss'

export const NecesitasCotizacion: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    
    try {
      // TODO: Implement actual quote request submission
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      alert('¡Gracias! Te contactaremos pronto para tu cotización.')
      setEmail('')
    } catch {
      alert('Hubo un error. Intenta nuevamente.')
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
    <section className={styles.necesitasCotizacion}>
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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={styles.emailInput}
                      leftIcon="bi-envelope"
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