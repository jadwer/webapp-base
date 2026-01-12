'use client'

import React from 'react'
import Image from 'next/image'
import styles from './NuestrasMarcas.module.scss'

interface BrandLogo {
  id: string
  name: string
  logo: string
  website?: string
}

// Logos de marcas del sitio real de Labor Wasser de Mexico
const brandLogos: BrandLogo[] = [
  { id: '1', name: 'Apera', logo: '/images/laborwasser/logos/apera-labor-wasser.webp', website: 'https://aperainst.com' },
  { id: '2', name: 'Avantor', logo: '/images/laborwasser/logos/avantor-labor-wasser.webp', website: 'https://avantorsciences.com' },
  { id: '3', name: 'BRAND', logo: '/images/laborwasser/logos/band-labor-wasser.webp', website: 'https://brand.de' },
  { id: '4', name: 'BD', logo: '/images/laborwasser/logos/bd-labor-wasser.webp', website: 'https://bd.com' },
  { id: '5', name: 'bioMerieux', logo: '/images/laborwasser/logos/biomerieux-labor-wasser.webp', website: 'https://biomerieux.com' },
  { id: '6', name: 'Condalab', logo: '/images/laborwasser/logos/condalab-labor-wasser.webp', website: 'https://condalab.com' },
  { id: '7', name: 'DIBICO', logo: '/images/laborwasser/logos/dibico-labor-wasser.webp', website: 'https://dibico.com' },
  { id: '8', name: 'DWK', logo: '/images/laborwasser/logos/dwk-labor-wasser.webp', website: 'https://dwk.com' },
  { id: '9', name: 'Eisco', logo: '/images/laborwasser/logos/eisco-labor-wasser.webp', website: 'https://eiscosci.com' },
  { id: '10', name: 'Fisher Scientific', logo: '/images/laborwasser/logos/fisher.webp', website: 'https://fishersci.com' },
  { id: '11', name: 'HACH', logo: '/images/laborwasser/logos/hach-labor-wasser.webp', website: 'https://hach.com' },
  { id: '12', name: 'HANNA', logo: '/images/laborwasser/logos/hanna-labor-wasser.webp', website: 'https://hannainst.com' },
  { id: '13', name: 'High Purity', logo: '/images/laborwasser/logos/high-purity-labor-wasser.webp', website: 'https://highpurity.com' },
  { id: '14', name: 'Honeywell', logo: '/images/laborwasser/logos/honeywell-labor-wasser.webp', website: 'https://sigmaaldrich.com' },
  { id: '15', name: 'Imparlab', logo: '/images/laborwasser/logos/imparlab-labor-wasser.webp' },
  { id: '16', name: 'JT Baker', logo: '/images/laborwasser/logos/jt-baker-labor-wasser.webp', website: 'https://avantorsciences.com' },
  { id: '17', name: 'Meyer', logo: '/images/laborwasser/logos/meyer-labor-wasser.webp' },
  { id: '18', name: 'Merck', logo: '/images/laborwasser/logos/merck-labor-wasser.webp', website: 'https://sigmaaldrich.com' },
  { id: '19', name: 'Microbiologics', logo: '/images/laborwasser/logos/microbiologics-labor-wasser.webp', website: 'https://microbiologics.com' },
  { id: '20', name: 'Microflex', logo: '/images/laborwasser/logos/microflex-labor-wasser.webp', website: 'https://microflex.com' },
  { id: '21', name: 'Micron', logo: '/images/laborwasser/logos/micron-labor-wasser.webp' },
  { id: '22', name: 'Productos Quimicos Monterrey', logo: '/images/laborwasser/logos/productos-quimicos-monterrey-labor-wasser.webp' },
  { id: '23', name: 'Thermo Scientific', logo: '/images/laborwasser/logos/thermo-labor-wasser.webp', website: 'https://thermofisher.com' },
  { id: '24', name: 'Toronto Research', logo: '/images/laborwasser/logos/toronto-labor-wasser.webp' },
  { id: '25', name: 'USP', logo: '/images/laborwasser/logos/usp-labor-wasser.webp', website: 'https://usp.org' },
  { id: '26', name: 'VWR', logo: '/images/laborwasser/logos/vwr-labor-wasser.webp', website: 'https://vwr.com' },
  { id: '27', name: 'Whatman', logo: '/images/laborwasser/logos/whatman-labor-wasser.webp', website: 'https://cytiva.com' },
  { id: '28', name: 'Whirl-Pak', logo: '/images/laborwasser/logos/whirl-labor-wasser.webp' }
]

export const NuestrasMarcas: React.FC = () => {
  const handleBrandClick = (brand: BrandLogo) => {
    if (brand.website) {
      window.open(brand.website, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className={styles.nuestrasMarcas}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>NUESTRAS MARCAS</h2>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className={styles.brandsGrid}>
              {brandLogos.map((brand) => (
                <div
                  key={brand.id}
                  className={styles.brandCard}
                  onClick={() => handleBrandClick(brand)}
                  role={brand.website ? 'button' : undefined}
                  tabIndex={brand.website ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (brand.website && (e.key === 'Enter' || e.key === ' ')) {
                      handleBrandClick(brand)
                    }
                  }}
                >
                  <div className={styles.brandLogo}>
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={120}
                      height={60}
                      className={styles.brandImage}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
