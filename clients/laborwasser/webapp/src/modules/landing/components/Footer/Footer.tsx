'use client'

/**
 * FOOTER (rediseno 2026-08)
 *
 * Fondo celeste (--lw-surface-tint), 4 columnas: logo + redes en azul |
 * Recursos | Legal (con la direccion) | Contacto (telefonos en 2 columnas,
 * WhatsApp, email). Franja inferior sobre el mismo fondo con texto azul.
 * Sale la columna "Productos" (14 categorias): el catalogo se navega desde
 * el header. Todo el contenido sigue viniendo de app-config.
 */

import React from 'react'
import Link from 'next/link'
import { usePublicSettings } from '@lwm/app-config'
import styles from './Footer.module.scss'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const { get } = usePublicSettings()

  const phone = get('company.phone')
  const phoneSecondary = get('company.phone_secondary')
  const phoneTertiary = get('company.phone_tertiary')
  const whatsappNumber = get('company.whatsapp_number')
  const whatsappDisplay = get('company.whatsapp_display')
  const email = get('company.email')
  const address = get('company.address')
  const companyName = get('company.name')
  const logoFooter = get('company.logo_path_alt') || get('company.logo_path_footer') || '/images/laborwasser/labor-wasser-mexico-logo2.webp'
  const facebookUrl = get('social.facebook')
  const instagramUrl = get('social.instagram')
  const linkedinUrl = get('social.linkedin')

  const phones = [phone, phoneSecondary, phoneTertiary].filter(Boolean) as string[]

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          {/* Logo + redes */}
          <div className={styles.brand}>
            <Link href="/" aria-label={companyName || 'Inicio'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoFooter} alt={companyName || 'Logo'} className={styles.logo} loading="lazy" />
            </Link>
            <div className={styles.social}>
              {linkedinUrl && <a href={linkedinUrl} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin" /></a>}
              {instagramUrl && <a href={instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram" /></a>}
              {facebookUrl && <a href={facebookUrl} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook" /></a>}
            </div>
          </div>

          {/* Recursos */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Recursos</h4>
            <ul className={styles.links}>
              <li><Link href="/catalogos">Catalogos PDF</Link></li>
              <li><Link href="/certificados">Certificaciones</Link></li>
              <li><Link href="/productos">Catalogos en linea</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Legal</h4>
            <ul className={styles.links}>
              <li><Link href="/aviso-privacidad">Aviso de privacidad</Link></li>
              <li><Link href="/derechos-reservados">Terminos y condiciones</Link></li>
              {address && (
                <li className={styles.iconLine}>
                  <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Contacto */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Contacto</h4>
            <ul className={`${styles.links} ${styles.contact}`}>
              {phones.map((p) => (
                <li key={p} className={styles.iconLine}>
                  <i className="bi bi-telephone-fill" aria-hidden="true" />
                  <a href={`tel:${p.replace(/\s/g, '')}`}>{p}</a>
                </li>
              ))}
              {whatsappNumber && (
                <li className={styles.iconLine}>
                  <i className="bi bi-whatsapp" aria-hidden="true" />
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">{whatsappDisplay || whatsappNumber}</a>
                </li>
              )}
              {email && (
                <li className={`${styles.iconLine} ${styles.wide}`}>
                  <i className="bi bi-envelope-fill" aria-hidden="true" />
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.bottomText}>
            {currentYear}. {companyName || 'Empresa'}. Todos los Derechos Reservados.
            &nbsp;|&nbsp;<Link href="/aviso-privacidad">Aviso de privacidad</Link>
            &nbsp;|&nbsp;<Link href="/derechos-reservados">Terminos de uso</Link>
            &nbsp;|&nbsp;Designed and developed by{' '}
            <a href="https://atomosoluciones.com" target="_blank" rel="noopener noreferrer">AtomoSoluciones.com</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
