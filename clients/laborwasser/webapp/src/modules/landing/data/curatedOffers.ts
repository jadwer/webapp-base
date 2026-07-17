/**
 * OFERTAS CURADAS (fallback)
 *
 * Ofertas destacadas estaticas que se muestran cuando el catalogo no tiene
 * productos marcados como oferta (is_on_sale). Compartidas entre el bloque
 * "Ofertas del Mes" del home (OfertasDelMes) y la pagina dedicada /ofertas,
 * para que ambos muestren lo mismo (antes /ofertas quedaba vacia).
 */

export interface CuratedOffer {
  id: number
  image: string
  description: string
  modelo: string
  precio: string
  whatsappLink: string
  bgClass: string
}

export const curatedOffers: CuratedOffer[] = [
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
