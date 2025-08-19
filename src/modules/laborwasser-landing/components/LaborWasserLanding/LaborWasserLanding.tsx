'use client'

import React, { useEffect } from 'react'
import {
  Header,
  Hero,
  OfertasDelMes,
  PorQueComprar,
  UltimosProductos,
  NecesitasCotizacion,
  NuestrasMarcas,
  Footer
} from '../'
import styles from './LaborWasserLanding.module.scss'

export interface LaborWasserLandingProps {
  className?: string
}

export const LaborWasserLanding: React.FC<LaborWasserLandingProps> = ({ 
  className 
}) => {
  // Enable smooth scrolling for the landing page
  useEffect(() => {
    const html = document.documentElement
    const originalScrollBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'smooth'
    
    return () => {
      html.style.scrollBehavior = originalScrollBehavior
    }
  }, [])

  return (
    <div className={`${styles.landingPage} ${className || ''}`}>
      {/* Header with navigation */}
      <Header />
      
      {/* Main content */}
      <main className={styles.mainContent}>
        {/* Hero section */}
        <Hero />
        
        {/* Monthly offers section */}
        <OfertasDelMes />
        
        {/* Why buy with us section */}
        <PorQueComprar />
        
        {/* Latest products section - Dynamic integration */}
        <UltimosProductos />
        
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