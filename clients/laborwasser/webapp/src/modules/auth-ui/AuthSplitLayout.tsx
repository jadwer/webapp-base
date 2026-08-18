'use client'

/**
 * AUTH SPLIT LAYOUT (rediseno 2026-08)
 *
 * Plantilla de las pantallas de sesion (Iniciar sesion, Recuperar contrasena,
 * Crear cuenta) del Figma: foto de laboratorio a la izquierda con el logo
 * blanco abajo; panel blanco a la derecha (720/1440) con esquina superior
 * izquierda redondeada que MONTA sobre la foto; formulario de 522px centrado
 * verticalmente, sin tarjeta; separador "o" y enlace de pie.
 *
 * Los formularios siguen siendo los de @lwm/auth (LoginForm, RegisterForm,
 * ForgotPasswordForm): aqui solo se visten (inputs de 56px, boton verde de
 * ancho completo) via el modulo SCSS. La logica de sesion no se toca. Vive
 * en el tenant; si otro tenant lo quiere, se promueve a @lwm/auth.
 */

import React from 'react'
import Link from 'next/link'
import { usePublicSettings } from '@lwm/app-config'
import styles from './AuthSplitLayout.module.scss'

interface AuthSplitLayoutProps {
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
  /** Enlace secundario justo bajo el boton (login: "Olvidaste tu contrasena?") */
  aside?: React.ReactNode
  /** Enlace de pie tras el separador "o" */
  footer?: React.ReactNode
  photoSrc?: string
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  title,
  subtitle,
  children,
  aside,
  footer,
  photoSrc = '/images/laborwasser/labor-wasser-redesign-auth.webp',
}) => {
  const { get } = usePublicSettings()
  const companyName = get('company.name') || 'Labor Wasser de Mexico'

  return (
    <div className={styles.split}>
      <aside className={styles.visual} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoSrc} alt="" className={styles.photo} decoding="async" />
        <div className={styles.photoOverlay} />
        <Link href="/" className={styles.logoLink} tabIndex={-1} aria-label={companyName}>
          {/* Logo en blanco (version vertical), como el Figma */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/laborwasser/labor-wasser-redesign-logo-white.png" alt="" className={styles.logo} />
        </Link>
      </aside>

      <main className={styles.panel}>
        <section className={styles.form} aria-labelledby="auth-title">
          <header className={styles.header}>
            <h1 id="auth-title" className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
          <div className={styles.fields}>{children}</div>
          {aside && <div className={styles.aside}>{aside}</div>}
          {footer && (
            <>
              <div className={styles.divider} role="separator"><span>o</span></div>
              <footer className={styles.footer}>{footer}</footer>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default AuthSplitLayout
