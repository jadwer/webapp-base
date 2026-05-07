# Roadmap: Integracion Landing Labor Wasser con Backend

## Estado Actual

La landing page `/laborwasser-demo` esta adaptada visualmente al sitio real de laborwasserdemexico.com.
**Fases 1, 2, 3, 4 y 5 completadas** - Landing page completamente funcional con localStorage.

---

## Analisis de Gaps

### 1. Catalogo de Productos Publico

**Estado:** COMPLETADO - Fases 1 y 3

**Ubicacion:**
- Pagina: `/productos` - Catalogo publico completo
- Pagina: `/laborwasser-catalogo` - Landing con catalogo integrado
- Modulo: `src/modules/public-catalog/`

**Que existe:**
- `PublicCatalogTemplate` - Componente all-in-one con filtros, grid, paginacion
- `publicProductsService` - Servicio para endpoint `/api/public/v1/public-products`
- `usePublicProducts` - Hook SWR para data fetching
- `useLocalCart` - Hook para carrito localStorage (sin backend)
- `useLocalCartCount` - Hook ligero para contador en Header
- 5 modos de vista (grid, list, cards, compact, showcase)

**Completado:**
- [x] Enlazar el boton "Ver Productos" del Hero a `/productos`
- [x] Enlazar las ofertas del mes a `/productos?search=X`
- [x] Boton "Agregar al Carrito" funcional con localStorage
- [ ] Verificar que el endpoint `/api/public/v1/public-products` existe en el backend

---

### 2. Detalles de Producto

**Estado:** COMPLETADO (2026-01-12)

**Que existe:**
- Servicio: `publicProductsService.getById(id)` - Obtener producto individual
- Tipos: `PublicProduct`, `EnhancedPublicProduct`
- Pagina: `/productos/[id]` - Detalle de producto publico
- Componente: `ProductDetailPage` - Vista completa de producto

**Completado:**
- [x] Crear pagina `/productos/[id]` para ver detalle de producto
- [x] Componente `ProductDetailPage` con:
  - Imagen grande del producto
  - Nombre, descripcion, precio
  - Categoria, marca, unidad
  - Boton "Agregar al Carrito" con localStorage
  - Productos relacionados (useProductSuggestions)
- [x] Breadcrumb de navegacion
- [x] Selector de cantidad
- [x] Indicador de producto en carrito

---

### 3. Sistema de Cotizaciones

**Estado:** COMPLETADO (2026-01-12) - Con fallback localStorage

**Que existe:**
- Componente: `NecesitasCotizacion` con formulario de email mejorado
- Modulo CRM: `leadsService` para crear leads (opcional)
- Boton WhatsApp funcional
- Fallback localStorage para guardar solicitudes

**Completado:**
- [x] Validacion de email con regex y feedback visual
- [x] Toast notifications en lugar de alert()
- [x] Fallback localStorage cuando API no disponible
- [x] Intento de envio a API `/api/v1/leads`
- [x] Guardado local de solicitudes como backup

**Nota:** El endpoint `/api/v1/leads` requiere autenticacion. Las solicitudes se guardan en localStorage hasta que se implemente un endpoint publico.

---

### 4. Carrito de Ecommerce

**Estado:** PARCIALMENTE COMPLETADO - Fase 1

**Que existe:**
- Pagina: `/cart` - Carrito de compras completo
- Pagina: `/checkout` - Proceso de checkout
- Modulo: `src/modules/ecommerce/`
- Servicios: `cartService`, `cartItemsService`
- Hooks: `useCart`, `useShoppingCart`, `useShoppingCartItems`
- Gestion de sesion via `localStorage` (`ecommerce_session_id`)

**Completado:**
- [x] Agregar icono de carrito en el Header con contador de items
- [x] Hook `usePublicCartCount` para leer items de localStorage
- [x] Enlazar el icono a `/cart`
- [x] Badge con contador en desktop y mobile

**Que falta:**
- [ ] Conectar el boton "Agregar al Carrito" de productos con el carrito real

---

## Plan de Implementacion

### Fase 1: Enlaces Basicos (Prioridad Alta) - COMPLETADA

**Estado:** COMPLETADA (2026-01-09)

| Tarea | Archivo | Estado |
|-------|---------|--------|
| 1.1 | Header.tsx | COMPLETADO - Icono de carrito con link a `/cart` |
| 1.2 | Header.tsx | COMPLETADO - Hook `usePublicCartCount` con contador |
| 1.3 | Hero.tsx | COMPLETADO - Enlace "Ver Productos" a `/productos` |
| 1.4 | OfertasDelMes.tsx | COMPLETADO - Enlaces a `/productos?search=X` |
| 1.5 | NecesitasCotizacion.tsx | COMPLETADO - ID `cotizacion` para scroll |

### Fase 2: Pagina de Detalle de Producto (Prioridad Alta) - COMPLETADA

**Estado:** COMPLETADA (2026-01-12)

| Tarea | Archivo | Estado |
|-------|---------|--------|
| 2.1 | `src/app/(front)/productos/[id]/page.tsx` | COMPLETADO - Pagina de detalle |
| 2.2 | `src/modules/public-catalog/components/ProductDetailPage.tsx` | COMPLETADO - Componente completo |
| 2.3 | ProductDetailPage.tsx | COMPLETADO - Productos relacionados con useProductSuggestions |
| 2.4 | ProductDetailPage.tsx | COMPLETADO - Agregar al carrito con localStorage |

### Fase 3: Integracion del Carrito (Prioridad Alta)

**Tiempo estimado:** 3-5 horas

| Tarea | Archivo | Descripcion |
|-------|---------|-------------|
| 3.1 | `src/app/(front)/productos/page.tsx` | Integrar `useCart` con `addProduct` |
| 3.2 | ProductDetailPage.tsx | Boton "Agregar al Carrito" funcional |
| 3.3 | Header.tsx | Badge con cantidad de items en carrito |
| 3.4 | Toast notifications | Feedback al agregar productos |

### Fase 4: Sistema de Cotizaciones (Prioridad Media) - COMPLETADA

**Estado:** COMPLETADA (2026-01-12)

| Tarea | Archivo | Estado |
|-------|---------|--------|
| 4.1 | NecesitasCotizacion.tsx | COMPLETADO - Validacion email |
| 4.2 | NecesitasCotizacion.tsx | COMPLETADO - Toast notifications |
| 4.3 | NecesitasCotizacion.tsx | COMPLETADO - Fallback localStorage |
| 4.4 | NecesitasCotizacion.tsx | COMPLETADO - Intento API con fallback |

### Fase 5: Mejoras de UX (Prioridad Baja) - COMPLETADA

**Estado:** COMPLETADA (2026-01-12)

| Tarea | Archivo | Estado |
|-------|---------|--------|
| 5.1 | UltimosProductosEnhanced.tsx | COMPLETADO - Carrito localStorage |
| 5.2 | UltimosProductosEnhanced.tsx | COMPLETADO - Toast notifications |
| 5.3 | NecesitasCotizacion.tsx | COMPLETADO - Toast notifications |
| 5.4 | Varios | COMPLETADO - Eliminados todos los alert()

---

## Dependencias del Backend

Para que todo funcione, el backend debe tener:

### Endpoints Publicos (sin autenticacion)

```
GET  /api/public/v1/public-products          - Listar productos
GET  /api/public/v1/public-products/:id      - Detalle de producto
GET  /api/public/v1/public-categories        - Listar categorias
GET  /api/public/v1/public-brands            - Listar marcas
POST /api/v1/quotes                          - Crear cotizacion (sin auth)
```

### Endpoints de Ecommerce

```
GET    /api/v1/shopping-carts/current        - Carrito actual
POST   /api/v1/shopping-carts                - Crear carrito
POST   /api/v1/shopping-cart-items           - Agregar item
PATCH  /api/v1/shopping-cart-items/:id       - Actualizar cantidad
DELETE /api/v1/shopping-cart-items/:id       - Eliminar item
POST   /api/v1/shopping-carts/:id/checkout   - Convertir a orden
```

---

## Verificacion de Backend

Ejecutar estos comandos para verificar endpoints:

```bash
# Productos publicos
curl -H "Accept: application/vnd.api+json" \
  "${NEXT_PUBLIC_BACKEND_URL}/api/public/v1/public-products"

# Carrito (requiere sesion)
curl -H "Accept: application/vnd.api+json" \
  "${NEXT_PUBLIC_BACKEND_URL}/api/v1/shopping-carts/current?filter[session_id]=test123"
```

---

## Resumen de Prioridades

| Prioridad | Fase | Descripcion | Estado |
|-----------|------|-------------|--------|
| CRITICA | 1 | Enlaces basicos | COMPLETADA |
| ALTA | 2 | Detalle de producto | COMPLETADA |
| ALTA | 3 | Carrito funcional (localStorage) | COMPLETADA |
| MEDIA | 4 | Cotizaciones (localStorage fallback) | COMPLETADA |
| BAJA | 5 | Mejoras UX (toasts) | COMPLETADA |

---

## Notas Tecnicas

1. **Autenticacion:** El carrito funciona con sesiones anonimas via `localStorage`
2. **JSON:API:** Todos los endpoints usan formato JSON:API v1.1
3. **SWR:** Los hooks usan SWR para cache y revalidacion automatica
4. **TypeScript:** Todos los tipos estan definidos en los modulos
5. **Tests:** 1493 tests pasando en total
   - public-catalog: 37 tests (hooks y services)
   - ecommerce: 78 tests

---

## Tests del Modulo public-catalog

**Ubicacion:** `src/modules/public-catalog/tests/`

### Tests de Hooks (16 tests)
- `useLocalCart.test.ts` - Carrito localStorage
  - Inicializacion con carrito vacio
  - Carga desde localStorage al montar
  - addToCart, removeFromCart, updateQuantity, clearCart
  - Calculo de totales
  - isInCart, getQuantity
  - getCartForCheckout
- `useLocalCartCount.test.ts` - Contador ligero
  - Retorno de 0 para carrito vacio
  - Cuenta correcta desde localStorage
  - Actualizacion via eventos

### Tests de Services (21 tests)
- `publicProductsService.test.ts` - API de productos
  - getPublicProducts con filtros, ordenamiento, paginacion
  - getPublicProduct por ID
  - searchProducts
  - getProductsByCategory, getProductsByBrand
  - getProductsByPriceRange
  - getFeaturedProducts
  - getProductSuggestions
  - Formateo de precios
  - Manejo de errores

---

## Archivos Clave

```
src/modules/public-catalog/
├── components/PublicCatalogTemplate.tsx   <- Catalogo all-in-one
├── components/ProductDetailPage.tsx       <- NUEVO: Detalle de producto
├── components/LocalCartPage.tsx           <- Pagina carrito localStorage
├── services/publicProductsService.ts      <- API de productos
├── hooks/usePublicProducts.ts             <- Data fetching
└── hooks/useLocalCart.ts                  <- Carrito localStorage

src/modules/ecommerce/
├── components/CartPage.tsx                <- Pagina del carrito
├── services/cartService.ts                <- API del carrito
└── hooks/useShoppingCart.ts               <- Hook principal

src/modules/laborwasser-landing/
├── components/Header/Header.tsx           <- COMPLETADO: Carrito con badge
├── components/Hero/Hero.tsx               <- COMPLETADO: Enlace a /productos
├── components/OfertasDelMes/              <- COMPLETADO: Enlaces con search
└── components/NecesitasCotizacion/        <- COMPLETADO: Toast + localStorage fallback

src/modules/public-catalog/tests/
├── hooks/
│   └── useLocalCart.test.ts               <- 16 tests pasando
└── services/
    └── publicProductsService.test.ts      <- 21 tests pasando
```

---

## Comandos de Verificacion

```bash
# Ejecutar todos los tests
npm run test:run

# Ejecutar solo tests del modulo public-catalog
npm run test:run -- src/modules/public-catalog/tests/

# Build de produccion
npm run build

# Desarrollo
npm run dev
```
