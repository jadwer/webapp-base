'use client'

import React from 'react'
import Link from 'next/link'
import styles from './Footer.module.scss'
import type { ContactInfo, SocialMedia } from '../../types'

const contactInfo: ContactInfo = {
  phone: '01 55 5762 1412',
  email: 'ventas@laborwasserdemexico.com',
  address: 'Ciudad de México, México',
  schedule: 'Lunes a Viernes: 9:00 AM - 6:00 PM'
}

const socialMedia: SocialMedia[] = [
  { platform: 'facebook', url: 'https://facebook.com/laborwasser', icon: 'bi-facebook' },
  { platform: 'instagram', url: 'https://instagram.com/laborwasser', icon: 'bi-instagram' },
  { platform: 'linkedin', url: 'https://linkedin.com/company/laborwasser', icon: 'bi-linkedin' },
  { platform: 'whatsapp', url: 'https://wa.me/525557621412', icon: 'bi-whatsapp' }
]

const productCategories = [
  { name: 'Reactivos Químicos', href: '/productos?categoria=reactivos' },
  { name: 'Equipos de Laboratorio', href: '/productos?categoria=equipos' },
  { name: 'Material de Vidrio', href: '/productos?categoria=vidrio' },
  { name: 'Instrumentos de Medición', href: '/productos?categoria=instrumentos' },
  { name: 'Consumibles', href: '/productos?categoria=consumibles' },
  { name: 'Microbiología', href: '/productos?categoria=microbiologia' }
]

const companyLinks = [
  { name: 'Acerca de Nosotros', href: '/nosotros' },
  { name: 'Nuestros Servicios', href: '/servicios' },
  { name: 'Política de Calidad', href: '/calidad' },
  { name: 'Términos y Condiciones', href: '/terminos' },
  { name: 'Política de Privacidad', href: '/privacidad' },
  { name: 'Trabajar con Nosotros', href: '/carreras' }
]

const supportLinks = [
  { name: 'Centro de Ayuda', href: '/ayuda' },
  { name: 'Cotizaciones', href: '/cotizaciones' },
  { name: 'Seguimiento de Pedidos', href: '/seguimiento' },
  { name: 'Devoluciones', href: '/devoluciones' },
  { name: 'Garantías', href: '/garantias' },
  { name: 'Contacto Técnico', href: '/soporte-tecnico' }
]

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const handleSocialClick = (social: SocialMedia) => {
    window.open(social.url, '_blank', 'noopener,noreferrer')
  }

  const handleEmailClick = () => {
    window.location.href = `mailto:${contactInfo.email}`
  }

  const handlePhoneClick = () => {
    window.location.href = `tel:+52${contactInfo.phone.replace(/\s/g, '').substring(2)}`
  }

  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* Main footer content */}
        <div className="row">
          {/* Company info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <div className={styles.logoSection}>
                <div className={styles.logoContainer}>
                  <div className={styles.logoIcon}>
                    <span className={styles.logoLetter}>W</span>
                  </div>
                  <div className={styles.logoText}>
                    <div className={styles.logoTitle}>LABOR WASSER</div>
                    <div className={styles.logoSubtitle}>DE MÉXICO</div>
                  </div>
                </div>
              </div>
              
              <p className={styles.companyDescription}>
                Distribuidora especializada en reactivos y material de laboratorio con más de 20 años 
                de experiencia brindando soluciones de calidad para el sector científico y educativo.
              </p>

              <div className={styles.socialMedia}>
                <h4 className={styles.socialTitle}>Síguenos</h4>
                <div className={styles.socialIcons}>
                  {socialMedia.map((social) => (
                    <button
                      key={social.platform}
                      className={styles.socialIcon}
                      onClick={() => handleSocialClick(social)}
                      aria-label={`Seguir en ${social.platform}`}
                    >
                      <i className={social.icon} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="col-lg-2 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Productos</h3>
              <ul className={styles.linksList}>
                {productCategories.map((category) => (
                  <li key={category.name}>
                    <Link href={category.href} className={styles.footerLink}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company */}
          <div className="col-lg-2 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Empresa</h3>
              <ul className={styles.linksList}>
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={styles.footerLink}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Soporte</h3>
              <ul className={styles.linksList}>
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={styles.footerLink}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="col-lg-2 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Contacto</h3>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <i className="bi bi-telephone" />
                  <button 
                    className={styles.contactLink}
                    onClick={handlePhoneClick}
                  >
                    {contactInfo.phone}
                  </button>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-envelope" />
                  <button 
                    className={styles.contactLink}
                    onClick={handleEmailClick}
                  >
                    {contactInfo.email}
                  </button>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-geo-alt" />
                  <span>{contactInfo.address}</span>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-clock" />
                  <span>{contactInfo.schedule}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="row">
          <div className="col-12">
            <div className={styles.footerBottom}>
              <div className={styles.copyright}>
                <p>&copy; {currentYear} Labor Wasser de México. Todos los derechos reservados.</p>
                <p className={styles.developedBy}>
                  Diseñado y desarrollado por{' '}
                  <Link 
                    href="https://laborwassermexico.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.devLink}
                  >
                    Labor Wasser de México
                  </Link>
                </p>
              </div>
              <div className={styles.footerMeta}>
                <Link href="/sitemap.xml" className={styles.metaLink}>
                  Mapa del Sitio
                </Link>
                <span className={styles.separator}>•</span>
                <Link href="/rss.xml" className={styles.metaLink}>
                  RSS
                </Link>
                <span className={styles.separator}>•</span>
                <span className={styles.metaText}>
                  Hecho con <i className="bi bi-heart-fill text-danger" /> en México
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}