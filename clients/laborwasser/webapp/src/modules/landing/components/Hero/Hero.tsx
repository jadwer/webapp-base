'use client'

import React from 'react'
import Link from 'next/link'
import { usePublicSettings } from '@lwm/app-config'

export const Hero: React.FC = () => {
  // Fase 3 (landing.*): textos configurables desde app-config; el fallback es
  // el texto historico para que el home no parpadee vacio mientras cargan.
  const { get } = usePublicSettings()
  const title = (get('landing.hero_title') as string) || 'MEJORAMOS EL MUNDO DE TU LABORATORIO'
  const subtitle = (get('landing.hero_subtitle') as string) ||
    'Encuentra los mejores productos, marcas reconocidas y la mejor atencion para tu laboratorio'

  return (
    <div className="container-fluid hero-1 mx-auto">
      <div className="row align-items-center">
        <div className="col-12 col-md-6 hero-left">
          <h1>{title}</h1>
          <h5 className="highlight-hero">{subtitle}</h5>
          <div className="col d-flex mt-4">
            <button
              type="button"
              className="btn btn-primary"
              data-bs-toggle="offcanvas"
              data-bs-target="#navMenu"
            >
              Cotiza ahora!
            </button>
            <Link href="/productos" className="btn btn-secondary mx-4">
              Ver productos
            </Link>
          </div>
        </div>
        <div className="col-12 col-md-6 hero-right"></div>
      </div>
    </div>
  )
}
