'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      <div className="container-fluid">
        <div className="row footer">
          <div className="col-12 col-md-3">
            <div className="row align-items-md-center d-flex">
              <div className="col social">
                <Image
                  src="/images/laborwasser/labor-wasser-mexico-logo-1.png"
                  className="img-fluid logo-footer d-block mx-auto"
                  alt="Labor Wasser Mexico"
                  width={200}
                  height={80}
                />
                <div className="d-flex justify-content-around mt-4">
                  <a href="#" aria-label="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" aria-label="Instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <h4>Productos</h4>
            <ul>
              <li>
                <Link className="dropdown-item" href="/productos?category=reactivos">
                  Reactivos
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/productos?category=medios-de-cultivo">
                  Medios de cultivo
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/productos?category=cristaleria">
                  Cristaleria
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/productos?category=analisis-de-agua">
                  Analisis de agua
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/productos?category=proceso">
                  Procesos
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-12 col-md-3">
            <h4>Recursos</h4>
            <ul>
              <li>
                <Link className="dropdown-item" href="/catalogos">
                  Catalogos PDF
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/certificados">
                  Certificaciones
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/productos">
                  Catalogo en linea
                </Link>
              </li>
            </ul>
            <h4 className="mt-4">Legal</h4>
            <ul>
              <li>
                <Link className="dropdown-item" href="/aviso-privacidad">
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/derechos-reservados">
                  Terminos y condiciones
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-12 col-md-3 login-contact">
            <h4>Contacto</h4>
            <div className="d-block d-md-flex mb-2">
              <i className="bi bi-telephone-fill"></i>
              <a href="tel:5575751661">55 7575 1661</a>
            </div>
            <div className="d-block d-md-flex mb-2">
              <i className="bi bi-telephone-fill"></i>
              <a href="tel:5575751662">55 7575 1662</a>
            </div>
            <div className="d-block d-md-flex mb-2">
              <i className="bi bi-telephone-fill"></i>
              <a href="tel:5571602454">55 7160 2454</a>
            </div>
            <div className="d-block d-md-flex mb-2">
              <i className="bi bi-whatsapp"></i>
              <a href="https://wa.link/4e5cqt">56 1040 0441</a>
            </div>
            <div className="d-block d-md-flex mb-2">
              <i className="bi bi-envelope"></i>
              <a href="mailto:ventas@laborwasserdemexico.com">
                ventas@laborwasserdemexico.com
              </a>
            </div>
            <div className="d-block d-md-flex mb-2">
              <i className="bi bi-geo-alt"></i>
              <a href="#">CDMX y Area metropolitana</a>
            </div>
          </div>
        </div>
        <div className="row text-muted">
          <p className="text-center">
            {currentYear}. Labor Wasser de Mexico. Todos los Derechos Reservados.
            &nbsp;|&nbsp;
            <Link href="/aviso-privacidad">
              Aviso de privacidad
            </Link>
            &nbsp;|&nbsp;
            <Link href="/derechos-reservados">
              Terminos de uso
            </Link>
            &nbsp;|&nbsp;
            Designed and developed by{' '}
            <a href="https://atomosoluciones.com" target="_blank" rel="noopener noreferrer">
              AtomoSoluciones.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
