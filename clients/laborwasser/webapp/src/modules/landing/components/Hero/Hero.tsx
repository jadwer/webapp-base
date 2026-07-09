'use client'

import React from 'react'
import Link from 'next/link'

export const Hero: React.FC = () => {
  return (
    <div className="container-fluid hero-1 mx-auto">
      <div className="row align-items-center">
        <div className="col-12 col-md-6 hero-left">
          <h1>MEJORAMOS EL MUNDO DE TU LABORATORIO</h1>
          <h5 className="highlight-hero">
            Encuentra los mejores productos, marcas reconocidas y la mejor
            atencion para tu laboratorio
          </h5>
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
