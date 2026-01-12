'use client'

import React from 'react'

export const NecesitasCotizacion: React.FC = () => {
  return (
    <div className="container-fluid cta" id="cotizacion">
      <div className="row align-items-center">
        <div className="col-12 col-md-5 left"></div>
        <div className="col-12 col-md-7 text-center right">
          <h1>NECESITAS UNA COTIZACION?</h1>
          <h6>
            Ponte en contacto con nosotros y uno de nuestros representantes se
            pondran en contacto contigo.
          </h6>

          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="offcanvas"
            data-bs-target="#navMenu"
          >
            Cotiza ahora
          </button>
        </div>
      </div>
    </div>
  )
}
