'use client'

import React from 'react'
import {
  Hero,
  OfertasDelMes,
  UltimosProductos,
  PorQueComprar,
  NecesitasCotizacion,
  NuestrasMarcas,
} from '../'

export interface LaborWasserLandingProps {
  className?: string
}

// NOTE: unlike the original standalone module (which rendered its own
// Header/Footer/WhatsApp widget), this tenant renders Header/TopNav/Footer
// once in `(front)/layout.tsx` shared across every public route — same
// pattern as every other (front) page in this app (see alphalabchem tenant).
// LaborWasserLanding here is content-only to avoid duplicating the chrome
// on the home route.
export const LaborWasserLanding: React.FC<LaborWasserLandingProps> = ({
  className
}) => {
  return (
    <div className={`laborwasser-landing ${className || ''}`}>
      {/* Hero section */}
      <Hero />

      {/* Monthly offers section */}
      <OfertasDelMes />

      {/* Latest products section (la que vende: paridad con produccion legada) */}
      <UltimosProductos />

      {/* Why buy with us section */}
      <PorQueComprar />

      {/* Quote request section */}
      <NecesitasCotizacion />

      {/* Our brands section */}
      <NuestrasMarcas />
    </div>
  )
}
