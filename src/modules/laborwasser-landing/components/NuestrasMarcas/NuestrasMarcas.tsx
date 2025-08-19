'use client'

import React from 'react'
import styles from './NuestrasMarcas.module.scss'
import type { BrandLogo } from '../../types'

// Mock data for brand logos - in production, this could come from a CMS or API
const brandLogos: BrandLogo[] = [
  { id: '1', name: 'APERA', logo: 'APERA', website: 'https://aperainst.com' },
  { id: '2', name: 'Avantor', logo: 'avantor', website: 'https://avantorsciences.com' },
  { id: '3', name: 'BRAND', logo: 'BRAND', website: 'https://brand.de' },
  { id: '4', name: 'BD', logo: 'BD', website: 'https://bd.com' },
  { id: '5', name: 'BIOMERIEUX', logo: 'BIOMERIEUX', website: 'https://biomerieux.com' },
  { id: '6', name: 'Condalab', logo: 'Condalab', website: 'https://condalab.com' },
  { id: '7', name: 'DIBICO', logo: 'DIBICO', website: 'https://dibico.com' },
  { id: '8', name: 'DWK', logo: 'DWK', website: 'https://dwk.com' },
  { id: '9', name: 'Eisco', logo: 'eisco', website: 'https://eiscosci.com' },
  { id: '10', name: 'Fisher Scientific', logo: 'Fisher Scientific', website: 'https://fishersci.com' },
  { id: '11', name: 'HACH', logo: 'HACH', website: 'https://hach.com' },
  { id: '12', name: 'HANNA', logo: 'HANNA', website: 'https://hannainst.com' },
  { id: '13', name: 'High Purity', logo: 'High Purity', website: 'https://highpurity.com' },
  { id: '14', name: 'Honeywell Fluka', logo: 'Honeywell Fluka', website: 'https://sigmaaldrich.com' },
  { id: '15', name: 'ISOLAB', logo: 'ISOLAB', website: 'https://isolab.de' },
  { id: '16', name: 'AVANTOR', logo: 'AVANTOR', website: 'https://avantorsciences.com' },
  { id: '17', name: 'AquaPhoenix', logo: 'AquaPhoenix', website: 'https://aquaphoenix.com' },
  { id: '18', name: 'MERCK', logo: 'MERCK & SIGMA-ALDRICH', website: 'https://sigmaaldrich.com' },
  { id: '19', name: 'Microbiologics', logo: 'Microbiologics', website: 'https://microbiologics.com' },
  { id: '20', name: 'MICROFLEX', logo: 'MICROFLEX', website: 'https://microflex.com' },
  { id: '21', name: 'MYRON L', logo: 'MYRON L COMPANY', website: 'https://myronl.com' },
  { id: '22', name: 'CHEM SUPPLY', logo: 'CHEM SUPPLY', website: 'https://chemsupply.com.au' },
  { id: '23', name: 'Thermo Scientific', logo: 'thermo scientific', website: 'https://thermofisher.com' },
  { id: '24', name: 'Bio-Techne', logo: 'Bio-Techne', website: 'https://bio-techne.com' },
  { id: '25', name: 'JSR', logo: 'JSR', website: 'https://jsr.co.jp' },
  { id: '26', name: 'VWR', logo: 'VWR', website: 'https://vwr.com' },
  { id: '27', name: 'Agilent', logo: 'agilent', website: 'https://agilent.com' },
  { id: '28', name: 'Whatman', logo: 'Whatman', website: 'https://cytiva.com' },
  { id: '29', name: 'WHEATON', logo: 'WHEATON', website: 'https://wheaton.com' }
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
              <p className={styles.sectionSubtitle}>
                Trabajamos con las marcas más reconocidas y confiables del sector
              </p>
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleBrandClick(brand)
                    }
                  }}
                >
                  <div className={styles.brandLogo}>
                    {/* Placeholder for brand logo - in production, use actual images */}
                    <div className={styles.brandLogoPlaceholder}>
                      <span className={styles.brandName}>{brand.logo}</span>
                    </div>
                  </div>
                  <div className={styles.brandTooltip}>
                    {brand.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className={styles.brandsStats}>
              <div className="row">
                <div className="col-md-4 text-center">
                  <div className={styles.statNumber}>50+</div>
                  <div className={styles.statLabel}>Marcas Internacionales</div>
                </div>
                <div className="col-md-4 text-center">
                  <div className={styles.statNumber}>25+</div>
                  <div className={styles.statLabel}>Años de Experiencia</div>
                </div>
                <div className="col-md-4 text-center">
                  <div className={styles.statNumber}>100%</div>
                  <div className={styles.statLabel}>Productos Certificados</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 text-center">
            <p className={styles.callToAction}>
              <i className="bi bi-info-circle" />
              ¿No encuentras la marca que buscas? Contáctanos y te ayudamos a conseguir el producto que necesitas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}