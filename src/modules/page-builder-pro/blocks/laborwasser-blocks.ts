/**
 * LABORWASSER CUSTOM BLOCKS FOR GRAPEJS
 * Professional landing page components as reusable blocks
 */

import type { Editor } from 'grapesjs'

export interface LaborWasserBlock {
  id: string
  label: string
  category: string
  media: string // Icon class
  content: string | { type: string; [key: string]: unknown }
  attributes?: { [key: string]: unknown }
}

/**
 * Hero Section Block
 * Professional banner with gradient background and CTA buttons
 */
export const heroBlock: LaborWasserBlock = {
  id: 'lw-hero',
  label: 'Hero Banner',
  category: 'LaborWasser',
  media: '<i class="bi bi-window-fullscreen"></i>',
  content: `
    <section class="lw-hero-section" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 80px 0; color: white;">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 style="font-size: 3.5rem; font-weight: bold; margin-bottom: 20px;">
              MEJORAMOS EL<br>
              <span style="color: #4CAF50;">RENDIMIENTO</span>
            </h1>
            <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.95;">
              Somos distribuidores especializados en reactivos y material de laboratorio 
              con más de 20 años de experiencia brindando soluciones de calidad.
            </p>
            <div class="d-flex gap-3">
              <button class="btn btn-success btn-lg">
                Ver Productos <i class="bi bi-arrow-right"></i>
              </button>
              <button class="btn btn-outline-light btn-lg">
                Cotizar Ahora
              </button>
            </div>
          </div>
          <div class="col-lg-6">
            <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 60px; text-align: center;">
              <i class="bi bi-flask" style="font-size: 120px;"></i>
              <p style="margin-top: 20px; font-size: 1.1rem;">Laboratorio Profesional</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  attributes: {
    class: 'gjs-row',
  }
}

/**
 * Products Showcase Block
 * Grid of featured products with cards
 */
export const productsShowcaseBlock: LaborWasserBlock = {
  id: 'lw-products',
  label: 'Productos Destacados',
  category: 'LaborWasser',
  media: '<i class="bi bi-grid-3x3-gap"></i>',
  content: `
    <section style="padding: 60px 0; background: #f8f9fa;">
      <div class="container">
        <div class="text-center mb-5">
          <h2 style="font-size: 2.5rem; font-weight: bold; color: #1e3c72;">OFERTAS DEL MES</h2>
          <p style="font-size: 1.1rem; color: #666;">
            Aprovecha nuestras mejores promociones en reactivos y equipos de laboratorio
          </p>
        </div>
        <div class="row g-4">
          ${[1, 2, 3].map(i => `
            <div class="col-lg-4 col-md-6">
              <div class="card h-100 shadow-sm" style="transition: transform 0.3s; cursor: pointer;">
                <div class="position-relative">
                  <span class="badge bg-danger position-absolute top-0 start-0 m-3">OFERTA</span>
                  <div style="height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-box-seam text-white" style="font-size: 60px;"></i>
                  </div>
                </div>
                <div class="card-body">
                  <h5 class="card-title">Producto ${i}</h5>
                  <p class="card-text text-muted">Descripción del producto de alta calidad para laboratorio profesional.</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="text-decoration-line-through text-muted">$1,299</span>
                      <span class="h4 text-success ms-2">$999</span>
                    </div>
                    <button class="btn btn-success btn-sm">Ver Más</button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `
}

/**
 * Why Choose Us Block
 * Benefits section with icons
 */
export const whyChooseBlock: LaborWasserBlock = {
  id: 'lw-why-choose',
  label: '¿Por qué elegirnos?',
  category: 'LaborWasser',
  media: '<i class="bi bi-award"></i>',
  content: `
    <section style="padding: 80px 0; background: white;">
      <div class="container">
        <div class="text-center mb-5">
          <h2 style="font-size: 2.5rem; font-weight: bold; color: #1e3c72;">¿Por qué comprar con nosotros?</h2>
          <p style="font-size: 1.1rem; color: #666; max-width: 700px; margin: 0 auto;">
            Nos especializamos en brindar soluciones integrales para laboratorios con los más altos estándares de calidad
          </p>
        </div>
        <div class="row g-4">
          <div class="col-md-3 col-6 text-center">
            <div style="background: #f0f8ff; border-radius: 20px; padding: 30px; height: 100%;">
              <i class="bi bi-shield-check" style="font-size: 48px; color: #1e3c72;"></i>
              <h5 style="margin-top: 20px; color: #1e3c72;">Calidad Garantizada</h5>
              <p style="color: #666; font-size: 0.9rem;">Productos certificados con los más altos estándares</p>
            </div>
          </div>
          <div class="col-md-3 col-6 text-center">
            <div style="background: #f0fff0; border-radius: 20px; padding: 30px; height: 100%;">
              <i class="bi bi-truck" style="font-size: 48px; color: #4CAF50;"></i>
              <h5 style="margin-top: 20px; color: #1e3c72;">Envío Rápido</h5>
              <p style="color: #666; font-size: 0.9rem;">Entrega en 24-48 horas en todo el país</p>
            </div>
          </div>
          <div class="col-md-3 col-6 text-center">
            <div style="background: #fff5f0; border-radius: 20px; padding: 30px; height: 100%;">
              <i class="bi bi-headset" style="font-size: 48px; color: #ff6b6b;"></i>
              <h5 style="margin-top: 20px; color: #1e3c72;">Asesoría Especializada</h5>
              <p style="color: #666; font-size: 0.9rem;">Equipo técnico para resolver tus dudas</p>
            </div>
          </div>
          <div class="col-md-3 col-6 text-center">
            <div style="background: #f5f0ff; border-radius: 20px; padding: 30px; height: 100%;">
              <i class="bi bi-cash-stack" style="font-size: 48px; color: #764ba2;"></i>
              <h5 style="margin-top: 20px; color: #1e3c72;">Mejores Precios</h5>
              <p style="color: #666; font-size: 0.9rem;">Precios competitivos y descuentos especiales</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

/**
 * Statistics Block
 * Impressive numbers section
 */
export const statisticsBlock: LaborWasserBlock = {
  id: 'lw-statistics',
  label: 'Estadísticas',
  category: 'LaborWasser',
  media: '<i class="bi bi-graph-up"></i>',
  content: `
    <section style="padding: 60px 0; background: #f8f9fa;">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-3 col-6 mb-4">
            <h2 style="font-size: 3rem; font-weight: bold; color: #1e3c72;">5000+</h2>
            <p style="color: #666; font-weight: 500;">PRODUCTOS</p>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <h2 style="font-size: 3rem; font-weight: bold; color: #4CAF50;">1200+</h2>
            <p style="color: #666; font-weight: 500;">CLIENTES SATISFECHOS</p>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <h2 style="font-size: 3rem; font-weight: bold; color: #ff6b6b;">50+</h2>
            <p style="color: #666; font-weight: 500;">MARCAS PREMIUM</p>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <h2 style="font-size: 3rem; font-weight: bold; color: #764ba2;">24/7</h2>
            <p style="color: #666; font-weight: 500;">SOPORTE TÉCNICO</p>
          </div>
        </div>
      </div>
    </section>
  `
}

/**
 * CTA Section Block
 * Call to action with form
 */
export const ctaBlock: LaborWasserBlock = {
  id: 'lw-cta',
  label: 'Solicitar Cotización',
  category: 'LaborWasser',
  media: '<i class="bi bi-envelope-paper"></i>',
  content: `
    <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px 0; color: white;">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h2 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 20px;">
              ¿NECESITAS UNA COTIZACIÓN?
            </h2>
            <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.95;">
              Nuestros especialistas están listos para brindarte la mejor atención personalizada. 
              Contamos con precios competitivos y condiciones especiales.
            </p>
            <div class="mb-4">
              <div class="d-flex align-items-center mb-3">
                <i class="bi bi-check-circle-fill me-3" style="font-size: 24px; color: #4CAF50;"></i>
                <span>Precios especiales por volumen</span>
              </div>
              <div class="d-flex align-items-center mb-3">
                <i class="bi bi-check-circle-fill me-3" style="font-size: 24px; color: #4CAF50;"></i>
                <span>Asesoría técnica especializada</span>
              </div>
              <div class="d-flex align-items-center mb-3">
                <i class="bi bi-check-circle-fill me-3" style="font-size: 24px; color: #4CAF50;"></i>
                <span>Respuesta en menos de 24 horas</span>
              </div>
            </div>
            <div class="d-flex gap-3">
              <button class="btn btn-success btn-lg">
                <i class="bi bi-whatsapp"></i> WhatsApp
              </button>
              <button class="btn btn-outline-light btn-lg">
                <i class="bi bi-telephone"></i> 01 55 5762 1412
              </button>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card shadow-lg" style="border-radius: 20px;">
              <div class="card-body p-5">
                <h4 class="card-title text-dark mb-3">Solicita tu Cotización</h4>
                <p class="text-muted mb-4">Déjanos tu email y te contactaremos</p>
                <form>
                  <div class="mb-3">
                    <input type="email" class="form-control form-control-lg" placeholder="tu@email.com">
                  </div>
                  <button type="submit" class="btn btn-success btn-lg w-100">
                    <i class="bi bi-send"></i> Solicitar Cotización
                  </button>
                </form>
                <div class="mt-3 text-center">
                  <small class="text-muted">
                    <i class="bi bi-shield-check"></i> Tus datos están protegidos
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

/**
 * Brands Grid Block
 * Partner brands showcase
 */
export const brandsBlock: LaborWasserBlock = {
  id: 'lw-brands',
  label: 'Nuestras Marcas',
  category: 'LaborWasser',
  media: '<i class="bi bi-bookmark-star"></i>',
  content: `
    <section style="padding: 60px 0; background: white;">
      <div class="container">
        <div class="text-center mb-5">
          <h2 style="font-size: 2.5rem; font-weight: bold; color: #1e3c72;">NUESTRAS MARCAS</h2>
          <p style="font-size: 1.1rem; color: #666;">
            Trabajamos con las mejores marcas reconocidas a nivel mundial
          </p>
        </div>
        <div class="row g-4">
          ${Array.from({ length: 12 }, (_, i) => `
            <div class="col-lg-2 col-md-3 col-4">
              <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 10px; padding: 20px; text-align: center; height: 100px; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
                <span style="font-weight: bold; color: #666;">MARCA ${i + 1}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `
}

/**
 * Footer Block
 * Complete footer with links and contact
 */
export const footerBlock: LaborWasserBlock = {
  id: 'lw-footer',
  label: 'Footer Completo',
  category: 'LaborWasser',
  media: '<i class="bi bi-layout-text-window-reverse"></i>',
  content: `
    <footer style="background: #1e3c72; color: white; padding: 60px 0 20px;">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <h3 style="font-weight: bold; margin-bottom: 20px;">LABOR WASSER</h3>
            <p style="opacity: 0.9;">
              Distribuidora especializada en reactivos y material de laboratorio.
              Más de 20 años de experiencia brindando soluciones de calidad.
            </p>
            <div class="d-flex gap-3 mt-3">
              <a href="#" style="color: white; font-size: 24px;"><i class="bi bi-facebook"></i></a>
              <a href="#" style="color: white; font-size: 24px;"><i class="bi bi-instagram"></i></a>
              <a href="#" style="color: white; font-size: 24px;"><i class="bi bi-linkedin"></i></a>
              <a href="#" style="color: white; font-size: 24px;"><i class="bi bi-youtube"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-md-6">
            <h5 style="margin-bottom: 20px;">PRODUCTOS</h5>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Reactivos</a></li>
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Material de Vidrio</a></li>
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Equipos</a></li>
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Consumibles</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-md-6">
            <h5 style="margin-bottom: 20px;">EMPRESA</h5>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Nosotros</a></li>
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Servicios</a></li>
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Certificaciones</a></li>
              <li style="margin-bottom: 10px;"><a href="#" style="color: white; text-decoration: none; opacity: 0.9;">Blog</a></li>
            </ul>
          </div>
          <div class="col-lg-4 col-md-12">
            <h5 style="margin-bottom: 20px;">CONTACTO</h5>
            <div style="margin-bottom: 15px;">
              <i class="bi bi-geo-alt me-2"></i>
              Av. Principal #123, CDMX, México
            </div>
            <div style="margin-bottom: 15px;">
              <i class="bi bi-telephone me-2"></i>
              01 55 5762 1412
            </div>
            <div style="margin-bottom: 15px;">
              <i class="bi bi-envelope me-2"></i>
              ventas@laborwasser.com.mx
            </div>
            <div>
              <i class="bi bi-clock me-2"></i>
              Lun - Vie: 9:00 AM - 6:00 PM
            </div>
          </div>
        </div>
        <hr style="margin: 40px 0 20px; opacity: 0.2;">
        <div class="text-center" style="opacity: 0.7;">
          <p>&copy; 2025 Labor Wasser de México. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `
}

/**
 * Complete collection of LaborWasser blocks
 */
export const laborWasserBlocks: LaborWasserBlock[] = [
  heroBlock,
  productsShowcaseBlock,
  whyChooseBlock,
  statisticsBlock,
  ctaBlock,
  brandsBlock,
  footerBlock
]

/**
 * Register all LaborWasser blocks in GrapeJS
 */
export function registerLaborWasserBlocks(editor: Editor) {
  const blockManager = editor.BlockManager
  
  // Register each block with its category
  laborWasserBlocks.forEach(block => {
    blockManager.add(block.id, {
      label: block.label,
      category: block.category,
      media: block.media,
      content: block.content,
      attributes: block.attributes || {}
    })
  })
}

/**
 * Pre-made complete templates
 */
export const laborWasserTemplates = {
  landingComplete: {
    name: 'Landing Page Completa',
    description: 'Página de inicio profesional con todas las secciones',
    thumbnail: '/templates/laborwasser-landing.jpg',
    content: [
      heroBlock.content,
      productsShowcaseBlock.content,
      whyChooseBlock.content,
      statisticsBlock.content,
      ctaBlock.content,
      brandsBlock.content,
      footerBlock.content
    ].join('\n')
  },
  productShowcase: {
    name: 'Catálogo de Productos',
    description: 'Página para mostrar productos destacados',
    thumbnail: '/templates/product-showcase.jpg',
    content: [
      heroBlock.content,
      productsShowcaseBlock.content,
      statisticsBlock.content,
      footerBlock.content
    ].join('\n')
  },
  corporate: {
    name: 'Página Corporativa',
    description: 'Presentación empresarial profesional',
    thumbnail: '/templates/corporate.jpg',
    content: [
      heroBlock.content,
      whyChooseBlock.content,
      brandsBlock.content,
      ctaBlock.content,
      footerBlock.content
    ].join('\n')
  },
  modernSlider: {
    name: 'Página con Hero Slider',
    description: 'Landing moderna con slider animado y múltiples slides',
    thumbnail: '/templates/hero-slider.jpg',
    content: [
      '<!-- Hero Slider será insertado dinámicamente -->',
      productsShowcaseBlock.content,
      whyChooseBlock.content,
      ctaBlock.content,
      footerBlock.content
    ].join('\n')
  },
  videoLanding: {
    name: 'Landing con Video',
    description: 'Página impactante con video de fondo',
    thumbnail: '/templates/video-hero.jpg',
    content: [
      '<!-- Hero Video será insertado dinámicamente -->',
      statisticsBlock.content,
      whyChooseBlock.content,
      ctaBlock.content,
      footerBlock.content
    ].join('\n')
  },
  parallaxExperience: {
    name: 'Experiencia Parallax',
    description: 'Página premium con efectos parallax avanzados',
    thumbnail: '/templates/parallax-hero.jpg',
    content: [
      '<!-- Hero Parallax será insertado dinámicamente -->',
      productsShowcaseBlock.content,
      statisticsBlock.content,
      brandsBlock.content,
      footerBlock.content
    ].join('\n')
  }
}