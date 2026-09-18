'use client'

/**
 * Rastreo por delegacion de los clics de negocio (GA4, 2026-09-18): un solo
 * listener en document clasifica el enlace clicado (WhatsApp, telefono,
 * correo, ficha tecnica, catalogo PDF, portal de certificados) y manda el
 * evento. No renderiza nada y no toca los componentes existentes.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { classifyLink, trackEvent } from '@/lib/analytics'

export function AnalyticsEvents() {
  const pathname = usePathname()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      const name = classifyLink(href, pathname || '')
      if (!name) return
      trackEvent(name, {
        link_url: href.slice(0, 200),
        link_text: (anchor.textContent || '').trim().slice(0, 80),
        page_path: pathname,
      })
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [pathname])

  return null
}

export default AnalyticsEvents
