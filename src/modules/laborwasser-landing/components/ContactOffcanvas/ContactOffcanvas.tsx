'use client'

import React, { useState } from 'react'

// WhatsApp number for contact
const WHATSAPP_NUMBER = '5216104004441' // Mexico country code + number

export const ContactOffcanvas: React.FC = () => {
  const [nombre, setNombre] = useState('')
  const [tel, setTel] = useState('')
  const [mail, setMail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitContact = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    const dataForm = {
      nombre,
      tel,
      mail,
      mensaje,
    }

    try {
      // Store in localStorage as backup
      const existingContacts = JSON.parse(localStorage.getItem('lw_contact_requests') || '[]')
      existingContacts.push({
        ...dataForm,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('lw_contact_requests', JSON.stringify(existingContacts))

      // Build WhatsApp message
      const whatsappMessage = encodeURIComponent(
        `*Solicitud de Contacto - Labor Wasser*\n\n` +
        `*Nombre:* ${nombre}\n` +
        `*Email:* ${mail}\n` +
        `*Telefono:* ${tel}\n` +
        `*Mensaje:*\n${mensaje}`
      )

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`
      window.open(whatsappUrl, '_blank')

      setStatus('success')
      // Reset form
      setNombre('')
      setTel('')
      setMail('')
      setMensaje('')
    } catch {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Send via email (mailto)
  const sendViaEmail = () => {
    const subject = encodeURIComponent('Solicitud de Contacto - Labor Wasser')
    const body = encodeURIComponent(
      `Nombre: ${nombre}\n` +
      `Email: ${mail}\n` +
      `Telefono: ${tel}\n\n` +
      `Mensaje:\n${mensaje}`
    )
    window.open(`mailto:ventas@laborwasserdemexico.com?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <nav
      className="offcanvas offcanvas-end"
      id="navMenu"
      aria-labelledby="navMenuLabel"
    >
      <div className="offcanvas-header">
        <h3 className="offcanvas-title" id="navMenuLabel">
          CONTACTO
        </h3>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div>
          <h6>
            Ponte en contacto con nosotros y uno de nuestros representantes se
            pondran en contacto contigo.
          </h6>
          <form onSubmit={submitContact}>
            <label htmlFor="nombre" className="form-label">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              className="form-control"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              placeholder="Nombre completo"
            />

            <label htmlFor="mail" className="form-label">
              Correo electronico
            </label>
            <input
              id="mail"
              type="email"
              className="form-control"
              value={mail}
              onChange={(event) => setMail(event.target.value)}
              required
              placeholder="Email valido"
            />

            <label htmlFor="tel" className="form-label">
              Telefono
            </label>
            <input
              id="tel"
              type="tel"
              className="form-control"
              value={tel}
              onChange={(event) => setTel(event.target.value)}
              required
              placeholder="Telefono con lada"
            />

            <label htmlFor="mensaje" className="form-label">
              Mensaje:
            </label>
            <textarea
              id="mensaje"
              className="form-control"
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              required
              placeholder="Mensaje"
            ></textarea>

            <div className="d-grid gap-2 mt-3">
              <button
                className="btn btn-success"
                type="submit"
                disabled={isSubmitting}
              >
                <i className="bi bi-whatsapp me-2"></i>
                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR POR WHATSAPP'}
              </button>
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={sendViaEmail}
                disabled={!nombre || !mail || !mensaje}
              >
                <i className="bi bi-envelope me-2"></i>
                ENVIAR POR EMAIL
              </button>
            </div>
          </form>

          {status === 'success' && (
            <div className="alert alert-success mt-3">
              <i className="bi bi-check-circle me-2"></i>
              Se abrio WhatsApp con tu mensaje. Nos comunicaremos contigo a la brevedad.
            </div>
          )}

          {status === 'error' && (
            <div className="alert alert-danger mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.
            </div>
          )}

          <hr className="my-4" />

          <h6 className="mb-3">Contacto directo:</h6>
          <div className="col-12 login-contact">
            <div className="d-flex mb-2">
              <i className="bi bi-telephone-fill me-2"></i>
              <a href="tel:5575751661">55 7575 1661</a>
            </div>
            <div className="d-flex mb-2">
              <i className="bi bi-telephone-fill me-2"></i>
              <a href="tel:5575751662">55 7575 1662</a>
            </div>
            <div className="d-flex mb-2">
              <i className="bi bi-telephone-fill me-2"></i>
              <a href="tel:5571602454">55 7160 2454</a>
            </div>
            <div className="d-flex mb-2">
              <i className="bi bi-whatsapp me-2"></i>
              <a href="https://wa.link/4e5cqt" target="_blank" rel="noopener noreferrer">
                56 1040 0441
              </a>
            </div>
            <div className="d-flex mb-2">
              <i className="bi bi-envelope me-2"></i>
              <a href="mailto:ventas@laborwasserdemexico.com">
                ventas@laborwasserdemexico.com
              </a>
            </div>
            <div className="d-flex mb-2">
              <i className="bi bi-geo-alt me-2"></i>
              <span>CDMX y Area metropolitana</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
