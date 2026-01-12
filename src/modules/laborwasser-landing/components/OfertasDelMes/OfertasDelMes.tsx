'use client'

import React from 'react'

const ofertas = [
  {
    id: 1,
    image: '/images/laborwasser/labor-wasser-guantes-nitrilo.webp',
    description:
      'Guantes de nitrilo azul sin polvo Supreno, tallas chica, mediana y grande. Paquete c/100 piezas marca MICROFLEX',
    modelo: 'SU-690',
    precio: '$15USD+IVA',
    whatsappLink: 'https://wa.link/a9t3qb',
    bgClass: 'blue-1',
  },
  {
    id: 2,
    image: '/images/laborwasser/labor-wasser-mexico-viales-digestion-dqo.webp',
    description:
      'Viales de digestion para demanda quimica de oxigeno (DQO), rango alto (20 -1500 mg/L), paquete de 150 HACH',
    modelo: '2125915',
    precio: '$532.7USD+IVA',
    whatsappLink: 'https://wa.link/a9t3qb',
    bgClass: 'blue-2',
  },
  {
    id: 3,
    image: '/images/laborwasser/labor-wasser-kit-frascos-tampon.webp',
    description:
      'KIT Frascos de tampon de pH 4.01, 7, 10.01 (475 ml) Orion trazabilidad conforme a la NIST',
    modelo: 'Incluye modelos: 910104, 910107, 910110',
    precio: '$75USD+IVA',
    whatsappLink: 'https://wa.link/a9t3qb',
    bgClass: 'blue-1',
  },
]

export const OfertasDelMes: React.FC = () => {
  return (
    <div className="container-fluid offers">
      <div className="row">
        <div className="col text-center">
          <h1>OFERTAS DEL MES</h1>
          <hr className="separator" />
        </div>
      </div>
      <div className="row">
        {ofertas.map((oferta) => (
          <div
            key={oferta.id}
            className={`col-12 col-md-4 text-center card-offer ${oferta.bgClass} d-block mx-auto`}
          >
            <img
              src={oferta.image}
              className="img-fluid"
              alt="Labor Wasser Mexico"
            />
            <p>{oferta.description}</p>
            <p>Modelo: {oferta.modelo}</p>
            <h4>{oferta.precio}</h4>
            <a
              className="btn btn-primary mt-3"
              href={oferta.whatsappLink}
              role="button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pidelo ahora
            </a>
          </div>
        ))}
      </div>
      <div className="row"></div>
    </div>
  )
}
