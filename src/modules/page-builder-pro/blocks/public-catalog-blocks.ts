/**
 * PUBLIC CATALOG BLOCKS FOR GRAPEJS
 * Blocks avanzados para integrar el módulo public-catalog en PageBuilder
 * Incluye catálogo completo, grids de productos, y filtros
 */

import type { Editor } from 'grapesjs'

export function registerPublicCatalogBlocks(editor: Editor) {
  const blockManager = editor.BlockManager

  // 1. CATÁLOGO COMPLETO - Template completo con todos los features
  blockManager.add('public-catalog-complete', {
    label: '🛍️ Catálogo Completo',
    category: 'Catálogo Público',
    content: {
      type: 'div',
      classes: ['public-catalog-wrapper'],
      components: [{
        type: 'div',
        attributes: { id: 'public-catalog-complete' },
        classes: ['container-fluid', 'py-5'],
        components: [`
          <!-- Catálogo de Productos Completo -->
          <div class="public-catalog-complete-section">
            <!-- Header -->
            <div class="row mb-5">
              <div class="col-12 text-center">
                <h2 class="display-4 fw-bold text-primary mb-3">
                  <i class="bi bi-grid-3x3-gap me-3"></i>
                  Catálogo de Productos
                </h2>
                <p class="lead text-muted mb-4">
                  Explora nuestro catálogo completo con filtros avanzados
                </p>
                <div class="d-flex flex-wrap justify-content-center gap-3">
                  <div class="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
                    <i class="bi bi-lightning me-2"></i>
                    Búsqueda en tiempo real
                  </div>
                  <div class="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                    <i class="bi bi-funnel me-2"></i>
                    Filtros avanzados
                  </div>
                  <div class="badge bg-info bg-opacity-10 text-info fs-6 px-3 py-2">
                    <i class="bi bi-eye me-2"></i>
                    5 modos de vista
                  </div>
                </div>
              </div>
            </div>

            <!-- Filtros -->
            <div class="row mb-4">
              <div class="col-12">
                <div class="bg-light rounded p-4">
                  <h5 class="mb-3">
                    <i class="bi bi-funnel me-2"></i>
                    Filtros de Búsqueda
                  </h5>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <input type="text" class="form-control" placeholder="Buscar productos...">
                    </div>
                    <div class="col-md-2">
                      <select class="form-select">
                        <option>Todas las categorías</option>
                        <option>Reactivos</option>
                        <option>Equipos</option>
                        <option>Material de vidrio</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <select class="form-select">
                        <option>Todas las marcas</option>
                        <option>LaborWasser</option>
                        <option>ChemTech</option>
                        <option>LabPro</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <input type="range" class="form-range" min="0" max="50000">
                      <small class="text-muted">Precio: $0 - $50,000</small>
                    </div>
                    <div class="col-md-2">
                      <div class="btn-group w-100">
                        <button class="btn btn-outline-primary btn-sm active" title="Vista grilla">
                          <i class="bi bi-grid-3x3-gap"></i>
                        </button>
                        <button class="btn btn-outline-primary btn-sm" title="Vista lista">
                          <i class="bi bi-list-ul"></i>
                        </button>
                        <button class="btn btn-outline-primary btn-sm" title="Vista tarjetas">
                          <i class="bi bi-card-text"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resultados -->
            <div class="row mb-4">
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Mostrando 1-24 de 156 productos</span>
                  <select class="form-select w-auto">
                    <option>Ordenar por nombre</option>
                    <option>Ordenar por precio</option>
                    <option>Más recientes</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Grid de Productos -->
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 g-3 mb-5">
              <!-- Producto 1 -->
              <div class="col">
                <div class="card h-100 shadow-sm">
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-image text-muted" style="font-size: 2rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title">Reactivo Químico A</h6>
                    <div class="d-flex flex-wrap gap-1 mb-2">
                      <span class="badge bg-secondary bg-opacity-10 text-secondary small">
                        <i class="bi bi-tag me-1"></i>Reactivos
                      </span>
                      <span class="badge bg-primary bg-opacity-10 text-primary small">
                        <i class="bi bi-award me-1"></i>LaborWasser
                      </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-primary">$1,250.00</span>
                      <small class="text-muted">/ Litro</small>
                    </div>
                    <div class="d-flex gap-1 mt-2">
                      <button class="btn btn-primary btn-sm flex-grow-1">
                        <i class="bi bi-cart-plus"></i>
                      </button>
                      <button class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Producto 2 -->
              <div class="col">
                <div class="card h-100 shadow-sm">
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-image text-muted" style="font-size: 2rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title">Equipo de Laboratorio B</h6>
                    <div class="d-flex flex-wrap gap-1 mb-2">
                      <span class="badge bg-secondary bg-opacity-10 text-secondary small">
                        <i class="bi bi-tag me-1"></i>Equipos
                      </span>
                      <span class="badge bg-primary bg-opacity-10 text-primary small">
                        <i class="bi bi-award me-1"></i>ChemTech
                      </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-primary">$15,750.00</span>
                      <small class="text-muted">/ Pieza</small>
                    </div>
                    <div class="d-flex gap-1 mt-2">
                      <button class="btn btn-primary btn-sm flex-grow-1">
                        <i class="bi bi-cart-plus"></i>
                      </button>
                      <button class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Producto 3 -->
              <div class="col">
                <div class="card h-100 shadow-sm">
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-image text-muted" style="font-size: 2rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title">Material de Vidrio C</h6>
                    <div class="d-flex flex-wrap gap-1 mb-2">
                      <span class="badge bg-secondary bg-opacity-10 text-secondary small">
                        <i class="bi bi-tag me-1"></i>Vidrio
                      </span>
                      <span class="badge bg-primary bg-opacity-10 text-primary small">
                        <i class="bi bi-award me-1"></i>LabPro
                      </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-primary">$850.00</span>
                      <small class="text-muted">/ Set</small>
                    </div>
                    <div class="d-flex gap-1 mt-2">
                      <button class="btn btn-primary btn-sm flex-grow-1">
                        <i class="bi bi-cart-plus"></i>
                      </button>
                      <button class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Más productos... -->
              <div class="col">
                <div class="card h-100 shadow-sm border-dashed">
                  <div class="card-body d-flex align-items-center justify-content-center text-center">
                    <div>
                      <i class="bi bi-plus-circle display-6 text-muted mb-2"></i>
                      <p class="text-muted mb-0">Ver más productos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Paginación -->
            <div class="row">
              <div class="col-12">
                <nav aria-label="Paginación de productos">
                  <ul class="pagination justify-content-center">
                    <li class="page-item disabled">
                      <span class="page-link"><i class="bi bi-chevron-double-left"></i></span>
                    </li>
                    <li class="page-item disabled">
                      <span class="page-link"><i class="bi bi-chevron-left"></i></span>
                    </li>
                    <li class="page-item active">
                      <span class="page-link">1</span>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#">2</a>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#">3</a>
                    </li>
                    <li class="page-item">
                      <span class="page-link">...</span>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#">7</a>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#"><i class="bi bi-chevron-right"></i></a>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#"><i class="bi bi-chevron-double-right"></i></a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        `]
      }]
    },
    attributes: {
      title: 'Catálogo de Productos Completo',
      'data-type': 'public-catalog-complete'
    }
  })

  // 2. ÚLTIMOS PRODUCTOS - Versión mejorada
  blockManager.add('public-latest-products', {
    label: '🆕 Últimos Productos',
    category: 'Catálogo Público',
    content: {
      type: 'section',
      classes: ['latest-products-section', 'py-5'],
      components: [{
        type: 'div',
        classes: ['container'],
        components: [`
          <!-- Últimos Productos con Public Catalog -->
          <div class="latest-products-enhanced">
            <div class="row">
              <div class="col-12 text-center">
                <h2 class="display-5 fw-bold text-primary mb-3">ÚLTIMOS PRODUCTOS</h2>
                <p class="lead text-muted mb-4">
                  Descubre nuestras últimas incorporaciones al catálogo
                </p>
                <div class="d-flex flex-wrap justify-content-center gap-3 mb-4">
                  <div class="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
                    <i class="bi bi-box-seam me-2"></i>
                    6 productos destacados
                  </div>
                  <div class="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                    <i class="bi bi-lightning me-2"></i>
                    Actualizados en tiempo real
                  </div>
                </div>
              </div>
            </div>

            <!-- View Mode Toggle -->
            <div class="row mb-4">
              <div class="col-12 text-center">
                <div class="btn-group" role="group">
                  <button class="btn btn-primary btn-sm active">
                    <i class="bi bi-grid-3x3-gap"></i> Grilla
                  </button>
                  <button class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-list-ul"></i> Lista
                  </button>
                  <button class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-card-text"></i> Tarjetas
                  </button>
                </div>
              </div>
            </div>

            <!-- Productos Grid -->
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-5">
              <div class="col">
                <div class="card h-100 shadow-sm position-relative">
                  <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-success">NUEVO</span>
                  </div>
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-box-seam text-primary" style="font-size: 3rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <span class="badge bg-secondary bg-opacity-10 text-secondary small">LaborWasser</span>
                      <span class="badge bg-primary bg-opacity-10 text-primary small">Reactivos</span>
                    </div>
                    <h6 class="card-title">Ácido Sulfúrico Concentrado</h6>
                    <p class="card-text small text-muted">
                      Reactivo de alta pureza para análisis químico profesional.
                    </p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="fw-bold fs-5 text-primary">$2,450.00</span>
                      <small class="text-muted">/ Litro</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-primary btn-sm flex-grow-1">
                        <i class="bi bi-eye me-1"></i> Ver Detalles
                      </button>
                      <button class="btn btn-outline-success btn-sm">
                        <i class="bi bi-calculator"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col">
                <div class="card h-100 shadow-sm position-relative">
                  <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-success">NUEVO</span>
                  </div>
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-speedometer2 text-success" style="font-size: 3rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <span class="badge bg-secondary bg-opacity-10 text-secondary small">ChemTech</span>
                      <span class="badge bg-info bg-opacity-10 text-info small">Equipos</span>
                    </div>
                    <h6 class="card-title">Balanza Analítica Digital</h6>
                    <p class="card-text small text-muted">
                      Precisión de 0.1mg, calibración automática incluida.
                    </p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="fw-bold fs-5 text-primary">$28,750.00</span>
                      <small class="text-muted">/ Pieza</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-primary btn-sm flex-grow-1">
                        <i class="bi bi-eye me-1"></i> Ver Detalles
                      </button>
                      <button class="btn btn-outline-success btn-sm">
                        <i class="bi bi-calculator"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col">
                <div class="card h-100 shadow-sm position-relative">
                  <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-success">NUEVO</span>
                  </div>
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-droplet text-info" style="font-size: 3rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <span class="badge bg-secondary bg-opacity-10 text-secondary small">LabPro</span>
                      <span class="badge bg-warning bg-opacity-10 text-warning small">Vidrio</span>
                    </div>
                    <h6 class="card-title">Set de Pipetas Volumétricas</h6>
                    <p class="card-text small text-muted">
                      Kit completo con certificado de calibración.
                    </p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="fw-bold fs-5 text-primary">$1,890.00</span>
                      <small class="text-muted">/ Set</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-primary btn-sm flex-grow-1">
                        <i class="bi bi-eye me-1"></i> Ver Detalles
                      </button>
                      <button class="btn btn-outline-success btn-sm">
                        <i class="bi bi-calculator"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col d-none d-lg-block">
                <div class="card h-100 border-2 border-dashed border-primary">
                  <div class="card-body d-flex align-items-center justify-content-center text-center">
                    <div>
                      <i class="bi bi-plus-circle display-4 text-primary mb-3"></i>
                      <h6 class="text-primary">Ver Más Productos</h6>
                      <p class="text-muted small mb-0">Explora todo el catálogo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="row">
              <div class="col-12 text-center">
                <div class="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <a href="/productos" class="btn btn-primary btn-lg">
                    <i class="bi bi-grid-3x3-gap me-2"></i>
                    Ver Catálogo Completo
                  </a>
                  <a href="/productos?sort=created_at" class="btn btn-outline-primary btn-lg">
                    <i class="bi bi-clock-history me-2"></i>
                    Ver Todos los Nuevos
                  </a>
                  <a href="/ofertas" class="btn btn-outline-success btn-lg">
                    <i class="bi bi-tag me-2"></i>
                    Ver Ofertas
                  </a>
                </div>
              </div>
            </div>
          </div>
        `]
      }]
    },
    attributes: {
      title: 'Últimos Productos Mejorados',
      'data-type': 'public-latest-products'
    }
  })

  // 3. OFERTAS DEL MES - Con public catalog
  blockManager.add('public-monthly-offers', {
    label: '🏷️ Ofertas del Mes',
    category: 'Catálogo Público',
    content: {
      type: 'section',
      classes: ['monthly-offers-section', 'py-5', 'bg-light'],
      components: [{
        type: 'div',
        classes: ['container'],
        components: [`
          <!-- Ofertas del Mes Enhanced -->
          <div class="monthly-offers-enhanced">
            <div class="row">
              <div class="col-12 text-center">
                <h2 class="display-5 fw-bold text-success mb-3">
                  <i class="bi bi-tag-fill me-3"></i>
                  OFERTAS DEL MES
                </h2>
                <p class="lead text-muted mb-4">
                  Aprovecha nuestras mejores promociones en productos de laboratorio
                </p>
                <div class="alert alert-success border-0 shadow-sm d-inline-block">
                  <i class="bi bi-clock me-2"></i>
                  <strong>¡Tiempo limitado!</strong> Válido hasta fin de mes
                </div>
              </div>
            </div>

            <!-- Productos en Oferta -->
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
              <div class="col">
                <div class="card h-100 shadow border-success position-relative">
                  <div class="position-absolute top-0 start-0 m-2">
                    <span class="badge bg-success fs-6">-25%</span>
                  </div>
                  <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-warning text-dark">OFERTA</span>
                  </div>
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-flask text-success" style="font-size: 4rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <span class="badge bg-success bg-opacity-10 text-success small">LaborWasser</span>
                      <span class="badge bg-primary bg-opacity-10 text-primary small">Reactivos</span>
                    </div>
                    <h5 class="card-title">Kit de Reactivos Básicos</h5>
                    <p class="card-text">
                      Conjunto completo de 12 reactivos esenciales para análisis químico básico.
                    </p>
                    <div class="mb-3">
                      <div class="d-flex align-items-center">
                        <span class="text-decoration-line-through text-muted me-2">$4,500.00</span>
                        <span class="fw-bold fs-4 text-success">$3,375.00</span>
                      </div>
                      <small class="text-muted">Ahorra $1,125.00</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-success flex-grow-1">
                        <i class="bi bi-cart-plus me-1"></i> Aprovechar Oferta
                      </button>
                      <button class="btn btn-outline-secondary">
                        <i class="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col">
                <div class="card h-100 shadow border-success position-relative">
                  <div class="position-absolute top-0 start-0 m-2">
                    <span class="badge bg-success fs-6">-15%</span>
                  </div>
                  <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-warning text-dark">OFERTA</span>
                  </div>
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-thermometer text-info" style="font-size: 4rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <span class="badge bg-info bg-opacity-10 text-info small">ChemTech</span>
                      <span class="badge bg-warning bg-opacity-10 text-warning small">Instrumentos</span>
                    </div>
                    <h5 class="card-title">Termómetro Digital Premium</h5>
                    <p class="card-text">
                      Precisión ±0.1°C, rango -50°C a 300°C, certificación incluida.
                    </p>
                    <div class="mb-3">
                      <div class="d-flex align-items-center">
                        <span class="text-decoration-line-through text-muted me-2">$2,890.00</span>
                        <span class="fw-bold fs-4 text-success">$2,456.50</span>
                      </div>
                      <small class="text-muted">Ahorra $433.50</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-success flex-grow-1">
                        <i class="bi bi-cart-plus me-1"></i> Aprovechar Oferta
                      </button>
                      <button class="btn btn-outline-secondary">
                        <i class="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col">
                <div class="card h-100 shadow border-success position-relative">
                  <div class="position-absolute top-0 start-0 m-2">
                    <span class="badge bg-success fs-6">-30%</span>
                  </div>
                  <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-danger">ÚLTIMAS PIEZAS</span>
                  </div>
                  <div class="ratio ratio-4x3">
                    <div class="d-flex align-items-center justify-content-center bg-light">
                      <i class="bi bi-eyedropper text-warning" style="font-size: 4rem;"></i>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <span class="badge bg-warning bg-opacity-10 text-warning small">LabPro</span>
                      <span class="badge bg-info bg-opacity-10 text-info small">Material</span>
                    </div>
                    <h5 class="card-title">Set Completo de Micropipetas</h5>
                    <p class="card-text">
                      4 micropipetas de diferentes volúmenes con puntas incluidas.
                    </p>
                    <div class="mb-3">
                      <div class="d-flex align-items-center">
                        <span class="text-decoration-line-through text-muted me-2">$8,750.00</span>
                        <span class="fw-bold fs-4 text-success">$6,125.00</span>
                      </div>
                      <small class="text-muted">Ahorra $2,625.00</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-success flex-grow-1">
                        <i class="bi bi-cart-plus me-1"></i> Aprovechar Oferta
                      </button>
                      <button class="btn btn-outline-secondary">
                        <i class="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Call to Action -->
            <div class="row">
              <div class="col-12 text-center">
                <div class="bg-white rounded-3 shadow-sm p-4">
                  <h5 class="mb-3">¿Quieres ver todas nuestras ofertas?</h5>
                  <p class="text-muted mb-4">
                    Descubre más productos con descuentos especiales y promociones exclusivas
                  </p>
                  <div class="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    <a href="/ofertas" class="btn btn-success btn-lg">
                      <i class="bi bi-tag me-2"></i>
                      Ver Todas las Ofertas
                    </a>
                    <a href="/newsletter" class="btn btn-outline-primary btn-lg">
                      <i class="bi bi-envelope me-2"></i>
                      Suscribirse a Ofertas
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `]
      }]
    },
    attributes: {
      title: 'Ofertas del Mes Mejoradas',
      'data-type': 'public-monthly-offers'
    }
  })

  // 4. BUSCADOR DE PRODUCTOS - Componente independiente
  blockManager.add('public-product-search', {
    label: '🔍 Buscador de Productos',
    category: 'Catálogo Público',
    content: {
      type: 'div',
      classes: ['product-search-widget', 'mb-4'],
      components: [{
        type: 'div',
        classes: ['container'],
        components: [`
          <!-- Widget de Búsqueda -->
          <div class="product-search-enhanced bg-primary text-white rounded-3 p-4">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h4 class="mb-2">
                  <i class="bi bi-search me-2"></i>
                  Buscar Productos
                </h4>
                <p class="mb-3 opacity-75">
                  Encuentra exactamente lo que necesitas en nuestro catálogo
                </p>
                <div class="input-group input-group-lg">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input type="text" class="form-control" placeholder="Buscar productos, marcas, categorías...">
                  <button class="btn btn-success" type="button">
                    <i class="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-4 text-center d-none d-md-block">
                <i class="bi bi-grid-3x3-gap display-1 opacity-25"></i>
              </div>
            </div>

            <!-- Búsquedas Populares -->
            <div class="mt-4">
              <small class="opacity-75">Búsquedas populares:</small>
              <div class="mt-2">
                <span class="badge bg-white bg-opacity-25 text-white me-2 mb-1">reactivos</span>
                <span class="badge bg-white bg-opacity-25 text-white me-2 mb-1">balanzas</span>
                <span class="badge bg-white bg-opacity-25 text-white me-2 mb-1">pipetas</span>
                <span class="badge bg-white bg-opacity-25 text-white me-2 mb-1">material de vidrio</span>
                <span class="badge bg-white bg-opacity-25 text-white me-2 mb-1">ph metro</span>
              </div>
            </div>
          </div>
        `]
      }]
    },
    attributes: {
      title: 'Buscador de Productos',
      'data-type': 'public-product-search'
    }
  })

}

export default registerPublicCatalogBlocks