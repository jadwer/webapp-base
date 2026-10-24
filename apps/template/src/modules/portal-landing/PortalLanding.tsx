'use client'

import React from 'react'
import { IBM_Plex_Sans, Inter } from 'next/font/google'
import { useDemoMode } from '@/modules/demo'
import {
  BulkSection,
  FeaturedSection,
  LatestSection,
  OffersSection,
  useLatestPublicProducts,
} from './components/ProductSections'
import {
  AboutSection,
  ClosingSection,
  DemoAccessSection,
  FaqSection,
  FeaturesSection,
  FlowSection,
  HeroSection,
  ModulesSection,
} from './components/StaticSections'
import s from './PortalLanding.module.scss'

const titleFont = IBM_Plex_Sans({ subsets: ['latin'], weight: ['600', '700'], variable: '--pl-font-title' })
const textFont = Inter({ subsets: ['latin'], variable: '--pl-font-text' })

/**
 * Landing hibrida del portal (designboard r2, 23-10): vende el portal y a la
 * vez demuestra la tienda con datos vivos. Orden acordado con Gabino:
 * heroe, que es esta pagina, ofertas, destacados, caracteristicas, nuevos,
 * granel, modulos, flujo, acceso demo, preguntas y cierre.
 */
export const PortalLanding: React.FC = () => {
  const { isDemo } = useDemoMode()
  const { products, isLoading } = useLatestPublicProducts()

  return (
    <div className={`${s.landing} ${titleFont.variable} ${textFont.variable}`}>
      <HeroSection products={products} isDemo={isDemo} />
      <AboutSection isDemo={isDemo} />
      <OffersSection />
      <FeaturedSection />
      <FeaturesSection />
      <LatestSection products={products} isLoading={isLoading} />
      <BulkSection products={products} isLoading={isLoading} />
      <ModulesSection />
      <FlowSection />
      {isDemo && <DemoAccessSection />}
      <FaqSection />
      <ClosingSection />
    </div>
  )
}

export default PortalLanding
