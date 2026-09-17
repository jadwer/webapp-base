'use client'

/**
 * Home: se renderiza en servidor (SEO Bloque 1, 2026-09).
 *
 * Antes se cargaba con next/dynamic y ssr:false "para evitar problemas de
 * hidratacion" heredados del monolito, lo que dejaba al robot un spinner
 * de 100vh como unico contenido. Los componentes del landing ya son
 * SSR-safe (el Header del layout usa los mismos hooks y siempre se
 * renderizo en servidor), asi que el landing se pinta directo: hero, "por
 * que comprar" y FAQ salen completos en el HTML; los carruseles de
 * productos cargan en cliente con su skeleton.
 */

import { LaborWasserLanding } from '@/modules/landing'

export default function HomeClient() {
  return <LaborWasserLanding />
}
