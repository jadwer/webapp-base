'use client'

import React, { useState } from 'react'

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

    // Store in localStorage as fallback
    try {
      const existingContacts = JSON.parse(localStorage.getItem('lw_contact_requests') || '[]')
      existingContacts.push({
        ...dataForm,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('lw_contact_requests', JSON.stringify(existingContacts))

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

            <button
              className="btn btn-primary mt-2"
              type="submit"
              id="submit"
              name="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ENVIANDO...' : 'ENVIAR'}
            </button>
          </form>

          {status === 'success' && (
            <div className="alert alert-success mt-3">
              Tu mensaje se ha enviado. Nos comunicaremos contigo a la brevedad.
            </div>
          )}

          {status === 'error' && (
            <div className="alert alert-danger mt-3">
              Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.
            </div>
          )}

          <br />
          <div className="col-12 login-contact">
            <div className="d-flex">
              <i className="bi bi-telephone-fill"></i>
              <a href="tel:5575751661">55 7575 1661</a>
            </div>
            <div className="d-flex">
              <i className="bi bi-telephone-fill"></i>
              <a href="tel:5575751662">55 7575 1662</a>
            </div>
            <div className="d-flex">
              <i className="bi bi-telephone-fill"></i>
              <a href="tel:5571602454">55 7160 2454</a>
            </div>
            <div className="d-flex">
              <i className="bi bi-whatsapp"></i>
              <a href="https://wa.link/4e5cqt">56 1040 0441</a>
            </div>
            <div className="d-flex">
              <i className="bi bi-envelope"></i>
              <a href="mailto:ventas@laborwasserdemexico.com">
                ventas@laborwasserdemexico.com
              </a>
            </div>
            <div className="d-flex">
              <i className="bi bi-geo-alt"></i>
              <a href="#">CDMX y Area metropolitana</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
