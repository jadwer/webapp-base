'use client'

import React from 'react'
import Link from 'next/link'

export const PorQueComprar: React.FC = () => {
  return (
    <div className="container-fluid about">
      <div className="row align-items-center">
        <div className="col-12 col-md-6 left-info">
          <h4 className="text-center text-md-start">
            Por que comprar con nosotros?
          </h4>
          <p className="text-center text-md-start">
            Por la calidad en nuestro servicio, por la experiencia tecnica y la
            resolucion de la problematica tanto en la parte analitica como en la
            parte de proceso, ademas de que somos una empresa innovadora con
            tecnologia de vanguardia, trabajamos a traves de un CRM y un ERP
            para un mejor servicio, asi como la concentracion de las mejores
            marcas para la parte analitica y de proceso para la industria y la
            investigacion, especialistas en quimicos y tratamientos en aguas.
          </p>
          <div className="col d-block d-md-flex mt-4">
            <Link href="/nosotros">
              <button type="button" className="btn btn-secondary mx-0">
                Mas sobre nosotros
              </button>
            </Link>
          </div>
        </div>
        <div className="col-12 col-md-6 hero-2"></div>
      </div>
    </div>
  )
}
