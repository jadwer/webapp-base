'use client'

import React from 'react'
import {
  Header,
  Hero,
  OfertasDelMes,
  PorQueComprar,
  NecesitasCotizacion,
  NuestrasMarcas,
  Footer
} from '../'

export interface LaborWasserLandingProps {
  className?: string
}

export const LaborWasserLanding: React.FC<LaborWasserLandingProps> = ({
  className
}) => {
  return (
    <div className={`laborwasser-landing ${className || ''}`}>
      {/* Header with navigation and WhatsApp widget */}
      <Header />

      {/* Main content */}
      <main>
        {/* Hero section */}
        <Hero />

        {/* Monthly offers section */}
        <OfertasDelMes />

        {/* Why buy with us section */}
        <PorQueComprar />

        {/* Quote request section */}
        <NecesitasCotizacion />

        {/* Our brands section */}
        <NuestrasMarcas />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
