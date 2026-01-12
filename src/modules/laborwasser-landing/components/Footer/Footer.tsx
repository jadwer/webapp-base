'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.scss'

const productCategories = [
  { name: 'Reactivos', href: '/productos/reactivos' },
  { name: 'Medios de cultivo', href: '/productos/medios-cultivo' },
  { name: 'Cristaleria', href: '/productos/cristaleria' },
  { name: 'Analisis de agua', href: '/productos/analisis-agua' }
]

const resourceLinks = [
  { name: 'Aviso de privacidad', href: '/aviso-privacidad' }
]

const contactInfo = {
  phones: ['01 55 5762 1412', '01 55 5771 1893'],
  email: 'ventas@laborwasserdemexico.com',
  whatsapp: '+52 55 5762 1412',
  address: 'Calz. de Tlalpan No. 1924, Local A-1, Col. Country Club, Del. Coyoacan, CDMX'
}

const socialMedia = [
  { platform: 'facebook', url: 'https://facebook.com/laborwasser', icon: 'bi-facebook' },
  { platform: 'instagram', url: 'https://instagram.com/laborwasser', icon: 'bi-instagram' },
  { platform: 'twitter', url: 'https://twitter.com/laborwasser', icon: 'bi-twitter-x' }
]

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const handleWhatsApp = () => {
    window.open('https://wa.me/525557621412', '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          {/* Logo and Social */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <Link href="/" className={styles.footerLogo}>
                <Image
                  src="/images/laborwasser/labor-wasser-mexico-logo2.webp"
                  alt="Labor Wasser de Mexico"
                  width={180}
                  height={54}
                  className={styles.logoImage}
                />
              </Link>

              <div className={styles.socialMedia}>
                {socialMedia.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    aria-label={`Seguir en ${social.platform}`}
                  >
                    <i className={social.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="col-lg-3 col-md-6 mb-4">
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

          {/* Resources */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Recursos</h3>
              <ul className={styles.linksList}>
                {resourceLinks.map((link) => (
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
          <div className="col-lg-3 col-md-6 mb-4">
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Contacto</h3>
              <div className={styles.contactInfo}>
                {contactInfo.phones.map((phone) => (
                  <div key={phone} className={styles.contactItem}>
                    <i className="bi bi-telephone" />
                    <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
                  </div>
                ))}
                <div className={styles.contactItem}>
                  <i className="bi bi-envelope" />
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-whatsapp" />
                  <button
                    type="button"
                    className={styles.whatsappBtn}
                    onClick={handleWhatsApp}
                  >
                    {contactInfo.whatsapp}
                  </button>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-geo-alt" />
                  <span>{contactInfo.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="row">
          <div className="col-12">
            <div className={styles.footerBottom}>
              <p className={styles.copyright}>
                Copyright {currentYear} Labor Wasser de Mexico
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
