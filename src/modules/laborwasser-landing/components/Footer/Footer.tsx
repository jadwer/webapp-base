'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePublicSettings } from '@/modules/app-config'
import { useAuth } from '@/modules/auth'
import { useCategories } from '@/modules/products/hooks/useCategories'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const { get } = usePublicSettings()
  const { isAuthenticated } = useAuth()
  const { categories } = useCategories({
    page: { size: 20 },
    sort: { field: 'name', direction: 'asc' },
    enabled: isAuthenticated,
  })

  const phone = get('company.phone')
  const phoneSecondary = get('company.phone_secondary')
  const phoneTertiary = get('company.phone_tertiary')
  const whatsappNumber = get('company.whatsapp_number')
  const whatsappDisplay = get('company.whatsapp_display')
  const email = get('company.email')
  const address = get('company.address')
  const companyName = get('company.name')
  const logoFooter = get('company.logo_path_footer') || '/images/laborwasser/labor-wasser-mexico-logo-1.png'
  const facebookUrl = get('social.facebook')
  const instagramUrl = get('social.instagram')
  const linkedinUrl = get('social.linkedin')

  return (
    <footer>
      <div className="container-fluid">
        <div className="row footer">
          <div className="col-12 col-md-3">
            <div className="row align-items-md-center d-flex">
              <div className="col social">
                <Image
                  src={logoFooter}
                  className="img-fluid logo-footer d-block mx-auto"
                  alt={companyName || 'Logo'}
                  width={200}
                  height={80}
                />
                <div className="d-flex justify-content-around mt-4">
                  <a href={facebookUrl || '#'} aria-label="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href={instagramUrl || '#'} aria-label="Instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href={linkedinUrl || '#'} aria-label="LinkedIn">
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
                <Link className="dropdown-item" href="/productos">
                  Todos los productos
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link className="dropdown-item" href={`/productos?categoryId=${category.id}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
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
            {phone && (
              <div className="d-block d-md-flex mb-2">
                <i className="bi bi-telephone-fill"></i>
                <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
              </div>
            )}
            {phoneSecondary && (
              <div className="d-block d-md-flex mb-2">
                <i className="bi bi-telephone-fill"></i>
                <a href={`tel:${phoneSecondary.replace(/\s/g, '')}`}>{phoneSecondary}</a>
              </div>
            )}
            {phoneTertiary && (
              <div className="d-block d-md-flex mb-2">
                <i className="bi bi-telephone-fill"></i>
                <a href={`tel:${phoneTertiary.replace(/\s/g, '')}`}>{phoneTertiary}</a>
              </div>
            )}
            {whatsappNumber && (
              <div className="d-block d-md-flex mb-2">
                <i className="bi bi-whatsapp"></i>
                <a href={`https://wa.me/${whatsappNumber}`}>{whatsappDisplay || whatsappNumber}</a>
              </div>
            )}
            {email && (
              <div className="d-block d-md-flex mb-2">
                <i className="bi bi-envelope"></i>
                <a href={`mailto:${email}`}>
                  {email}
                </a>
              </div>
            )}
            {address && (
              <div className="d-block d-md-flex mb-2">
                <i className="bi bi-geo-alt"></i>
                <span>{address}</span>
              </div>
            )}
          </div>
        </div>
        <div className="row text-muted">
          <p className="text-center">
            {currentYear}. {companyName || 'Empresa'}. Todos los Derechos Reservados.
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
