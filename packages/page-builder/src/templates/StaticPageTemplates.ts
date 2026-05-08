/**
 * STATIC PAGE TEMPLATES FOR PAGEBUILDER
 * Template generico para paginas estaticas del sitio (Nosotros, Certificados, etc.)
 * Patron comun: Hero Section + Contenido + CTA
 */

export const staticPageTemplates = [
  {
    id: 'static-page-generic',
    name: 'Pagina Estatica',
    category: 'Paginas',
    description: 'Template generico para paginas institucionales: titulo, contenido y CTA de cotizacion',
    thumbnail: '/templates/static-page.jpg',
    tags: ['static', 'page', 'institutional', 'content'],
    html: `
<!-- Hero Section -->
<div class="hero-sections" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 60px 0; color: white;">
  <div class="container">
    <div class="row align-items-center">
      <div class="col">
        <h1 style="font-size: 2.5rem; font-weight: bold; text-transform: uppercase; margin: 0;">TITULO DE LA PAGINA</h1>
      </div>
    </div>
  </div>
</div>

<!-- Contenido Principal -->
<div class="container my-5">
  <div class="row">
    <div class="col-12">
      <p style="font-size: 1.1rem; line-height: 1.8; color: #333;">
        Escribe aqui el contenido de tu pagina. Puedes agregar texto, imagenes, listas, tablas y cualquier otro elemento HTML.
      </p>
      <p style="font-size: 1.1rem; line-height: 1.8; color: #333;">
        Este template es ideal para paginas institucionales como "Nosotros", "Aviso de Privacidad", "Certificados", etc.
      </p>
    </div>
  </div>
</div>

<!-- CTA Cotizacion -->
<section class="cta-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 0; color: white;">
  <div class="container text-center">
    <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 15px;">¿NECESITAS UNA COTIZACION?</h2>
    <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px;">Ponte en contacto con nosotros y uno de nuestros representantes se pondra en contacto contigo.</p>
    <a href="/productos" class="btn btn-success btn-lg" style="padding: 12px 30px; font-size: 1.1rem;">
      <i class="bi bi-cart-check me-2"></i>Cotiza ahora
    </a>
  </div>
</section>
    `.trim()
  }
]
