/**
 * PUBLIC CATALOG TEMPLATES FOR PAGEBUILDER
 * Templates predefinidos que integran el módulo public-catalog
 * Para uso en el sistema de templates del PageBuilder
 */

export const publicCatalogTemplates = [
  {
    id: 'laborwasser-enhanced-landing',
    name: 'LaborWasser Enhanced Landing',
    category: 'Landing Pages',
    description: 'Landing page completa con integración del catálogo público avanzado',
    thumbnail: '/templates/laborwasser-enhanced.jpg',
    tags: ['landing', 'catalog', 'products', 'laborwasser', 'enhanced'],
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Labor Wasser de México - Catálogo Avanzado</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <i class="bi bi-droplet me-2"></i>
                Labor Wasser
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#inicio">Inicio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#productos">Productos</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#ofertas">Ofertas</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#contacto">Contacto</a>
                    </li>
                </ul>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section id="inicio" class="hero-section bg-gradient bg-primary text-white py-5">
        <div class="container">
            <div class="row align-items-center min-vh-75">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold mb-4">
                        Reactivos y Material de Laboratorio de Calidad Superior
                    </h1>
                    <p class="lead mb-4">
                        Más de 20 años distribuyendo productos químicos y equipos científicos 
                        con certificación internacional y asesoría especializada.
                    </p>
                    <div class="d-flex flex-column flex-md-row gap-3">
                        <a href="#productos" class="btn btn-light btn-lg">
                            <i class="bi bi-grid-3x3-gap me-2"></i>
                            Ver Catálogo
                        </a>
                        <a href="#cotizacion" class="btn btn-outline-light btn-lg">
                            <i class="bi bi-calculator me-2"></i>
                            Solicitar Cotización
                        </a>
                    </div>
                </div>
                <div class="col-lg-6 text-center">
                    <i class="bi bi-flask display-1 opacity-75"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Ofertas del Mes Enhanced -->
    <section id="ofertas" class="py-5 bg-light">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center">
                    <h2 class="display-5 fw-bold text-success mb-3">
                        <i class="bi bi-tag-fill me-3"></i>
                        OFERTAS DEL MES
                    </h2>
                    <p class="lead text-muted mb-4">
                        Aprovecha nuestras mejores promociones en productos de laboratorio
                    </p>
                    <div class="alert alert-success border-0 shadow-sm d-inline-block mb-4">
                        <i class="bi bi-clock me-2"></i>
                        <strong>¡Tiempo limitado!</strong> Válido hasta fin de mes
                    </div>
                </div>
            </div>

            <!-- Productos en oferta -->
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
        </div>
    </section>

    <!-- Últimos Productos Enhanced -->
    <section id="productos" class="py-5">
        <div class="container">
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
    </section>

    <!-- Cotización Section -->
    <section id="cotizacion" class="py-5 bg-primary text-white">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h3 class="fw-bold mb-2">¿Necesitas una cotización personalizada?</h3>
                    <p class="mb-0">
                        Nuestro equipo de especialistas te ayudará a encontrar los productos 
                        exactos para tu laboratorio con los mejores precios del mercado.
                    </p>
                </div>
                <div class="col-lg-4 text-center">
                    <button class="btn btn-light btn-lg">
                        <i class="bi bi-calculator me-2"></i>
                        Solicitar Cotización
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <h5 class="fw-bold mb-3">
                        <i class="bi bi-droplet me-2"></i>
                        Labor Wasser de México
                    </h5>
                    <p class="text-light">
                        Distribuidora especializada en reactivos y material de laboratorio 
                        con más de 20 años de experiencia en el mercado mexicano.
                    </p>
                </div>
                <div class="col-lg-4 mb-4">
                    <h6 class="fw-bold mb-3">Contacto</h6>
                    <div class="text-light">
                        <p class="mb-2">
                            <i class="bi bi-geo-alt me-2"></i>
                            Ciudad de México, México
                        </p>
                        <p class="mb-2">
                            <i class="bi bi-telephone me-2"></i>
                            +52 55 1234 5678
                        </p>
                        <p class="mb-2">
                            <i class="bi bi-envelope me-2"></i>
                            ventas@laborwasser.com.mx
                        </p>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <h6 class="fw-bold mb-3">Enlaces Rápidos</h6>
                    <ul class="list-unstyled text-light">
                        <li class="mb-2"><a href="#" class="text-light text-decoration-none">Catálogo</a></li>
                        <li class="mb-2"><a href="#" class="text-light text-decoration-none">Ofertas</a></li>
                        <li class="mb-2"><a href="#" class="text-light text-decoration-none">Cotizaciones</a></li>
                        <li class="mb-2"><a href="#" class="text-light text-decoration-none">Soporte Técnico</a></li>
                    </ul>
                </div>
            </div>
            <hr class="my-4">
            <div class="text-center text-light">
                <p class="mb-0">&copy; 2025 Labor Wasser de México. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
    `,
    css: `
/* Estilos personalizados para LaborWasser Enhanced */
.hero-section {
    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
    min-height: 100vh;
}

.min-vh-75 {
    min-height: 75vh;
}

.card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.badge {
    font-size: 0.7rem;
}

.btn {
    transition: all 0.2s ease-in-out;
}

.btn:hover {
    transform: translateY(-1px);
}

/* View mode animations */
.btn-group .btn {
    transition: all 0.2s ease-in-out;
}

.btn-group .btn:hover:not(.active) {
    background-color: rgba(13, 110, 253, 0.1);
}

/* Product cards animations */
.position-relative .badge {
    transition: transform 0.2s ease-in-out;
}

.card:hover .badge {
    transform: scale(1.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .display-4 {
        font-size: 2.5rem;
    }
    
    .display-5 {
        font-size: 2rem;
    }
    
    .hero-section {
        min-height: 80vh;
    }
}
    `
  },

  {
    id: 'public-catalog-ecommerce',
    name: 'Catálogo Público E-commerce',
    category: 'E-commerce',
    description: 'Página de catálogo completo con filtros avanzados y carrito de compras',
    thumbnail: '/templates/public-catalog-ecommerce.jpg',
    tags: ['ecommerce', 'catalog', 'filters', 'shopping', 'products'],
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo de Productos - E-commerce Avanzado</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body>
    <!-- Header con carrito -->
    <header class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold text-primary" href="#">
                <i class="bi bi-shop me-2"></i>
                TiendaLab
            </a>
            
            <!-- Buscador central -->
            <div class="flex-grow-1 mx-4 d-none d-lg-block">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Buscar productos...">
                    <button class="btn btn-primary">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
            </div>

            <!-- Carrito y usuario -->
            <div class="d-flex align-items-center gap-3">
                <button class="btn btn-outline-primary position-relative">
                    <i class="bi bi-heart"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        3
                    </span>
                </button>
                <button class="btn btn-primary position-relative">
                    <i class="bi bi-cart3"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                        5
                    </span>
                </button>
                <button class="btn btn-outline-secondary">
                    <i class="bi bi-person"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Breadcrumb -->
    <div class="bg-light py-2">
        <div class="container">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><a href="#">Inicio</a></li>
                    <li class="breadcrumb-item active">Catálogo</li>
                </ol>
            </nav>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container-fluid py-4">
        <div class="row">
            <!-- Sidebar Filters -->
            <div class="col-lg-3 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0">
                            <i class="bi bi-funnel me-2"></i>
                            Filtros
                        </h6>
                    </div>
                    <div class="card-body">
                        <!-- Categorías -->
                        <div class="mb-4">
                            <h6 class="fw-bold">Categorías</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cat1">
                                <label class="form-check-label" for="cat1">
                                    Reactivos Químicos <span class="badge bg-secondary">45</span>
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cat2">
                                <label class="form-check-label" for="cat2">
                                    Equipos de Lab <span class="badge bg-secondary">23</span>
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cat3">
                                <label class="form-check-label" for="cat3">
                                    Material de Vidrio <span class="badge bg-secondary">67</span>
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="cat4">
                                <label class="form-check-label" for="cat4">
                                    Instrumentos <span class="badge bg-secondary">34</span>
                                </label>
                            </div>
                        </div>

                        <!-- Marcas -->
                        <div class="mb-4">
                            <h6 class="fw-bold">Marcas</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="brand1">
                                <label class="form-check-label" for="brand1">
                                    LaborWasser <span class="badge bg-secondary">123</span>
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="brand2">
                                <label class="form-check-label" for="brand2">
                                    ChemTech <span class="badge bg-secondary">45</span>
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="brand3">
                                <label class="form-check-label" for="brand3">
                                    LabPro <span class="badge bg-secondary">67</span>
                                </label>
                            </div>
                        </div>

                        <!-- Rango de precio -->
                        <div class="mb-4">
                            <h6 class="fw-bold">Precio</h6>
                            <div class="row g-2">
                                <div class="col">
                                    <input type="number" class="form-control form-control-sm" placeholder="Mín">
                                </div>
                                <div class="col-auto">-</div>
                                <div class="col">
                                    <input type="number" class="form-control form-control-sm" placeholder="Máx">
                                </div>
                            </div>
                            <input type="range" class="form-range mt-2" min="0" max="50000">
                        </div>

                        <!-- Disponibilidad -->
                        <div class="mb-4">
                            <h6 class="fw-bold">Disponibilidad</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="stock1" checked>
                                <label class="form-check-label" for="stock1">
                                    En stock
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="stock2">
                                <label class="form-check-label" for="stock2">
                                    Bajo pedido
                                </label>
                            </div>
                        </div>

                        <button class="btn btn-outline-danger btn-sm w-100">
                            <i class="bi bi-x-circle me-1"></i>
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            <!-- Products Area -->
            <div class="col-lg-9">
                <!-- Toolbar -->
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <span class="text-muted">Mostrando 1-24 de 156 productos</span>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex justify-content-end gap-3">
                                    <!-- Sort -->
                                    <select class="form-select form-select-sm" style="width: auto;">
                                        <option>Ordenar por nombre</option>
                                        <option>Precio: menor a mayor</option>
                                        <option>Precio: mayor a menor</option>
                                        <option>Más nuevos</option>
                                        <option>Más vendidos</option>
                                    </select>

                                    <!-- View Mode -->
                                    <div class="btn-group">
                                        <button class="btn btn-outline-secondary btn-sm active">
                                            <i class="bi bi-grid-3x3-gap"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary btn-sm">
                                            <i class="bi bi-list-ul"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary btn-sm">
                                            <i class="bi bi-card-text"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products Grid -->
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 mb-4">
                    <!-- Producto 1 -->
                    <div class="col">
                        <div class="card h-100 shadow-sm position-relative">
                            <div class="position-absolute top-0 end-0 m-2 z-1">
                                <button class="btn btn-outline-light btn-sm rounded-circle">
                                    <i class="bi bi-heart"></i>
                                </button>
                            </div>
                            <div class="ratio ratio-1x1">
                                <div class="d-flex align-items-center justify-content-center bg-light">
                                    <i class="bi bi-flask text-primary" style="font-size: 3rem;"></i>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="mb-2">
                                    <span class="badge bg-primary bg-opacity-10 text-primary small">LaborWasser</span>
                                    <span class="badge bg-success bg-opacity-10 text-success small">En stock</span>
                                </div>
                                <h6 class="card-title">Ácido Sulfúrico 98%</h6>
                                <p class="card-text small text-muted">
                                    Reactivo analítico de alta pureza para laboratorio.
                                </p>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <span class="fw-bold text-primary fs-5">$1,250.00</span>
                                        <br>
                                        <small class="text-muted">por Litro</small>
                                    </div>
                                    <div class="text-end">
                                        <div class="text-warning small">
                                            <i class="bi bi-star-fill"></i>
                                            <i class="bi bi-star-fill"></i>
                                            <i class="bi bi-star-fill"></i>
                                            <i class="bi bi-star-fill"></i>
                                            <i class="bi bi-star-half"></i>
                                        </div>
                                        <small class="text-muted">(24 reviews)</small>
                                    </div>
                                </div>
                                <div class="d-flex gap-1">
                                    <button class="btn btn-primary btn-sm flex-grow-1">
                                        <i class="bi bi-cart-plus"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm">
                                        <i class="bi bi-share"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Más productos... (repetir estructura) -->
                    <!-- Se pueden agregar más productos aquí -->
                </div>

                <!-- Pagination -->
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
    `,
    css: `
/* E-commerce Catalog Styles */
.navbar {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card {
    transition: all 0.2s ease-in-out;
    border: 1px solid rgba(0,0,0,0.08);
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.badge {
    font-size: 0.7rem;
}

.btn {
    transition: all 0.2s ease-in-out;
}

.btn:hover {
    transform: translateY(-1px);
}

.form-check-label {
    font-size: 0.9rem;
}

.position-relative .btn {
    backdrop-filter: blur(10px);
    background-color: rgba(255,255,255,0.8);
}

.text-warning i {
    margin-right: 1px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .d-none.d-lg-block {
        display: block !important;
        margin: 1rem 0;
    }
}
    `
  }
]

export default publicCatalogTemplates