'use client'

import React from 'react'

const brandLogos = [
  { id: '1', logo: '/images/laborwasser/logos/apera-labor-wasser.webp' },
  { id: '2', logo: '/images/laborwasser/logos/avantor-labor-wasser.webp' },
  { id: '3', logo: '/images/laborwasser/logos/band-labor-wasser.webp' },
  { id: '4', logo: '/images/laborwasser/logos/bd-labor-wasser.webp' },
  { id: '5', logo: '/images/laborwasser/logos/biomerieux-labor-wasser.webp' },
  { id: '6', logo: '/images/laborwasser/logos/condalab-labor-wasser.webp' },
  { id: '7', logo: '/images/laborwasser/logos/dibico-labor-wasser.webp' },
  { id: '8', logo: '/images/laborwasser/logos/dwk-labor-wasser.webp' },
  { id: '9', logo: '/images/laborwasser/logos/eisco-labor-wasser.webp' },
  { id: '10', logo: '/images/laborwasser/logos/fisher.webp' },
  { id: '11', logo: '/images/laborwasser/logos/hach-labor-wasser.webp' },
  { id: '12', logo: '/images/laborwasser/logos/hanna-labor-wasser.webp' },
  { id: '13', logo: '/images/laborwasser/logos/high-purity-labor-wasser.webp' },
  { id: '14', logo: '/images/laborwasser/logos/honeywell-labor-wasser.webp' },
  { id: '15', logo: '/images/laborwasser/logos/imparlab-labor-wasser.webp' },
  { id: '16', logo: '/images/laborwasser/logos/jt-baker-labor-wasser.webp' },
  { id: '17', logo: '/images/laborwasser/logos/meyer-labor-wasser.webp' },
  { id: '18', logo: '/images/laborwasser/logos/merck-labor-wasser.webp' },
  { id: '19', logo: '/images/laborwasser/logos/microbiologics-labor-wasser.webp' },
  { id: '20', logo: '/images/laborwasser/logos/microflex-labor-wasser.webp' },
  { id: '21', logo: '/images/laborwasser/logos/micron-labor-wasser.webp' },
  { id: '22', logo: '/images/laborwasser/logos/productos-quimicos-monterrey-labor-wasser.webp' },
  { id: '23', logo: '/images/laborwasser/logos/thermo-labor-wasser.webp' },
  { id: '24', logo: '/images/laborwasser/logos/toronto-labor-wasser.webp' },
  { id: '25', logo: '/images/laborwasser/logos/usp-labor-wasser.webp' },
  { id: '26', logo: '/images/laborwasser/logos/vwr-labor-wasser.webp' },
  { id: '27', logo: '/images/laborwasser/logos/whatman-labor-wasser.webp' },
  { id: '28', logo: '/images/laborwasser/logos/whirl-labor-wasser.webp' },
]

export const NuestrasMarcas: React.FC = () => {
  return (
    <div className="container clients">
      <div className="row">
        <div className="col text-center">
          <h1>NUESTRAS MARCAS</h1>
          <hr className="separator" />
        </div>
      </div>
      <div className="row row-cols-2 row-cols-md-5 g-3 g-md-4">
        {brandLogos.map((brand) => (
          <div key={brand.id} className="col">
            <div className="card">
              <img
                src={brand.logo}
                className="card-img-top"
                alt="Labor Wasser Mexico"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
