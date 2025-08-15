# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js App Router application serving as the official frontend template for Atomo Soluciones. It's designed as a modular, scalable base for ERPs, internal systems, and web platforms with decoupled, reusable modules.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run sass` - Watch SASS compilation

### SASS and Icons
- `npm run sass` - Watch SASS compilation (src/ui/styles/sass/main.scss → src/ui/styles/main.css)
- `npm run copy-bootstrap-icons` - Copy Bootstrap Icons fonts (runs automatically on postinstall)

### Production Build
Use `npm run build` followed by `npm start` for production deployment. Full deployment guide available at `PRODUCTION_DEPLOYMENT.md`.

## Architecture

### Module System
The application uses a modular architecture where each module in `src/modules/` is completely independent and portable:

```
src/modules/[module-name]/
├── components/         # Internal components
├── hooks/             # Module-specific hooks
├── types/             # TypeScript definitions
├── services/          # API layer
├── templates/         # Visual templates (*.html.tsx for designers)
└── index.ts           # Module exports
```

Each module exports everything through its `index.ts` file, enabling clean imports like:
```ts
import { useInventory } from '@/modules/inventory';
```

### Key Modules
- **auth** - Complete authentication system with Laravel Sanctum integration
- **roles** - Role and permission management (Permission Manager)
- **users** - User CRUD operations
- **permissions** - Permission management
- **products** - Enterprise-level product management system with 4 entities (Product, Unit, Category, Brand) featuring:
  - 5 virtualized view modes (Table, Grid, List, Compact, Showcase)
  - Performance-optimized with TanStack Virtual + React.memo + Zustand
  - Professional UX with debounced filters and focus preservation
  - Complete CRUD operations with JSON:API integration
- **page-builder-pro** - GrapeJS-based visual page builder with full CRUD operations

### Authentication Flow
- Uses Laravel Sanctum with Bearer tokens stored in localStorage
- Token automatically injected via axios interceptors (`src/lib/axiosClient.ts`)
- Profile data fetched with roles and permissions included
- JSON:API compliant error handling

### API Integration
- Base URL configured via `NEXT_PUBLIC_BACKEND_URL` environment variable
- All requests use JSON:API format (`application/vnd.api+json`)
- Automatic token injection for authenticated requests
- Comprehensive error handling with `parseJsonApiErrors` utility

### UI System
Located in `src/ui/`, this is the "atm-ui" design system with:
- Core components: Button, Input, Alert, ConfirmModal, etc.
- Layout components: DashboardLayout, HeaderNavbar, Sidebar
- Role-based components: RoleGuard, DynamicRoleGuard
- Bootstrap integration with custom SASS compilation

### App Router Structure
- `(back)/dashboard/` - Protected admin panel routes
- `(back)/dashboard/pages/` - Page builder administration interface
- `(back)/dashboard/page-builder/` - Visual page editor interface
- `(back)/dashboard/products/` - Products management interface
- `(back)/dashboard/products/units/` - Units management
- `(back)/dashboard/products/categories/` - Categories management
- `(back)/dashboard/products/brands/` - Brands management
- `(front)/` - Public routes including auth pages
- `(front)/p/[slug]/` - Dynamic page rendering from page-builder-pro

### Page Builder Pro Module
The `page-builder-pro` module provides a complete visual page building solution:

**Features:**
- Visual drag-and-drop page editor using GrapeJS
- Complete CRUD operations for pages (Create, Read, Update, Delete, Duplicate)
- Real-time slug generation and validation
- Page status management (draft, published)
- Bootstrap-based component library
- Custom blocks and templates
- CSS injection and styling system
- Navigation progress indicators

**Key Components:**
- `PagesAdminTemplate` - Main administration interface with data table
- `PageEditorTemplate` - Visual page editor with GrapeJS integration
- `PageForm` - Form component for page metadata (title, slug, status)
- `PagesTable` - Data table with search, filter, and pagination
- Various utility components (StatusBadge, ToastNotifier, etc.)

**Technical Implementation:**
- Uses SWR for efficient data fetching and caching
- Robust editor initialization with race condition protection
- Proper cleanup and memory management
- Bootstrap CSS integration for consistent styling
- Hydration-safe content rendering for public pages

**Usage:**
- Admin interface: `/dashboard/pages` - List and manage all pages
- Page editor: `/dashboard/page-builder/{id}` - Edit specific page
- Public view: `/p/{slug}` - Rendered page content

### Products Module ✨ **ENTERPRISE IMPLEMENTATION**
The `products` module is a **enterprise-level administration system** with 4 entities and revolutionary UX:

**Entities:**
- **Product** - Main product entity with relationships to Unit, Category, and Brand
- **Unit** - Units of measurement (pieces, kg, liters, etc.)
- **Category** - Product categories with hierarchical support
- **Brand** - Product brands with descriptions and slugs

**🚀 Enterprise Features:**
- **5 Virtualized View Modes:** Table, Grid, List, Compact, Showcase
- **Zero Re-renders Performance:** Zustand UI state + React.memo optimizations
- **TanStack Virtual:** Handle thousands of products without lag
- **Debounced Smart Filters:** 300ms delay with focus preservation
- **Professional Pagination:** First/Last/Numbers with ellipsis
- **Complete CRUD operations** for all entities
- **JSON:API integration** with proper data transformation
- **SWR-powered data fetching** with intelligent caching
- **Advanced filtering and sorting** capabilities
- **Real-time search** with instant feedback

**🎨 Revolutionary UI Components:**
- `ProductsAdminPagePro` - **NEW** Enterprise-level main interface
- `ViewModeSelector` - **NEW** Professional 5-view toggle
- `ProductsTableVirtualized` - **NEW** High-performance virtualized table
- `ProductsGrid` - **NEW** 4-card grid with hover effects
- `ProductsList` - **NEW** Mobile-optimized detailed list
- `ProductsCompact` - **NEW** Dense view for quick operations
- `ProductsShowcase` - **NEW** Premium presentation with large images
- `ProductsFiltersSimple` - **NEW** Independent filters with debounce
- `PaginationPro` - **NEW** Professional pagination component
- `ProductForm` - Product creation/editing form
- `ProductsTable` - Data table with sorting and filtering
- `UnitsTable/CategoriesTable/BrandsTable` - Management tables for auxiliary entities
- Various utility components (filters, status badges, etc.)

**Technical Implementation:**
- Uses SWR for efficient data fetching and caching
- JSON:API transformers for correct data mapping (camelCase ↔ snake_case)
- Proper relationship resolution for included resources
- **Enterprise Error Handling System:** Complete FK constraint detection
- **Professional Toast Notifications:** DOM-direct rendering with animations
- **ConfirmModal Integration:** Professional replacement for window.confirm()
- **FormWrapper Pattern:** SWR data loading + mutation hooks integration
- **CRUD Routes Complete:** All auxiliary entities with create/edit/view pages
- **ProductsCount Integration:** Real-time counting of associated products
- **Unified Search:** filter[search] parameter for cross-field search
- **Next.js 15 Compatibility:** Proper Promise params handling

**API Integration:**
- Full JSON:API compliance with Laravel JSON:API backend
- Automatic Bearer token injection via axios interceptors
- Proper handling of relationships and included resources
- Support for filtering, sorting, and search operations
- Comprehensive error handling and validation

**Usage:**
- **Products interface:** `/dashboard/products` - List and manage all products
- **Units management:** `/dashboard/products/units` - Complete CRUD for measurement units
- **Categories management:** `/dashboard/products/categories` - Complete CRUD for product categories  
- **Brands management:** `/dashboard/products/brands` - Complete CRUD for product brands

**✅ CRUD Operations Available:**
- **Create:** `/dashboard/products/{entity}/create` - New entity creation
- **Read:** `/dashboard/products/{entity}/[id]` - View entity details
- **Update:** `/dashboard/products/{entity}/[id]/edit` - Edit existing entity
- **Delete:** Via AdminPagePro with professional ConfirmModal and relationship error handling

### Enterprise Error Handling System ✨ **NUEVO**
Complete professional error handling system implemented across all entities:

**🎯 FK Constraint Detection:**
- **Automatic Detection:** Status 409 + JSON:API error codes
- **User-friendly Messages:** Entity-specific constraint messages
- **Graceful Degradation:** No application crashes
- **Professional UX:** Toast notifications instead of alerts

**🎨 Toast Notification System:**
- **DOM Direct Rendering:** Bypasses React state complexity 
- **Professional Animations:** CSS keyframe animations
- **Consistent Styling:** Green (success) / Red (error)
- **Auto Removal:** 4-6 second duration based on error type
- **Positioning:** Top-right corner, z-index 9999

**📱 Implementation Details:**
```typescript
// Error Detection Example
if (axiosError.response?.status === 409) {
  const hasConstraintCode = parsedErrors.some(err => 
    err.code === 'FOREIGN_KEY_CONSTRAINT'
  )
  return true  // Detected FK constraint violation
}

// User-friendly Messages
"No se puede eliminar la categoría porque tiene productos asociados"
"No se puede eliminar la marca porque tiene productos asociados"  
"No se puede eliminar la unidad porque tiene productos asociados"
```

**🔧 Components Updated:**
- ✅ **Categories:** Complete error handling with toast notifications
- ✅ **Brands:** Complete error handling with toast notifications
- ✅ **Units:** Complete error handling with toast notifications
- ✅ **useErrorHandler:** Centralized error management hook
- ✅ **Error Utilities:** FK detection and message generation

## Development Guidelines

### Module Independence
- Modules must be completely independent and portable
- No shared interfaces or logic between modules
- Each module should have its own types, hooks, and services
- Always create an `index.ts` export file per module

### File Conventions
- `*.html.tsx` files are designated for designers (visual templates)
- Business logic and hooks should not be modified by designers
- Use TypeScript throughout the application
- Follow existing patterns for API service integration

### State Management ⚡ **ENTERPRISE ARCHITECTURE**
- **SWR** for server state management and intelligent caching
- **Zustand** for UI state (filters, pagination, view modes) - **ZERO RE-RENDERS**
- **React.memo** + **useCallback** for performance optimization
- **TanStack Virtual** for handling thousands of records
- Authentication state managed through `useAuth` hook
- Local state preferred for component-specific data

**🏗️ Enterprise Pattern:**
```tsx
// UI State (Zustand) - Independent, no data re-fetch
const filters = useProductsFilters()
const viewMode = useProductsViewMode()

// Server State (SWR) - Data fetching with cache
const { products, isLoading } = useProducts({ filters })

// Performance: Zero re-renders on filter changes
```

**🆕 New Patterns - Enero 2025:**
- **Error Handling:** Robust system with relationship constraint detection (`errorHandling.ts`)
- **ConfirmModal:** Professional async/await replacement for window.confirm()
- **FormWrapper:** SWR data loading integrated with mutation hooks
- **CRUD Routes:** Complete create/read/update/delete for all entities

**📋 Architecture Documentation:**
- `MODULE_ARCHITECTURE_BLUEPRINT.md` - Complete implementation guide (UPDATED)
- `DESIGN_SYSTEM_REGISTRY.md` - All components documented
- `CURRENT_ROADMAP.md` - Development roadmap and status

### Navigation Progress System
The application includes a navigation progress indicator for better UX:

**Components:**
- `NavigationProgress` - Global progress bar component (included in root layout)
- `useNavigationProgress` - Custom hook providing navigation methods with automatic progress indication

**Usage:**
```tsx
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

const Component = () => {
  const navigation = useNavigationProgress()
  
  // Automatic progress indication on navigation
  navigation.push('/some-path')
  navigation.back()
}
```

**Integration:**
- Automatically shows progress bar during route transitions
- Custom NProgress styling with dark mode support
- Used throughout page-builder-pro module for seamless navigation

### Bootstrap Icons Configuration
Bootstrap Icons are configured for the Design System:

**CDN Integration (Recommended):**
- Bootstrap Icons CSS is loaded via CDN in `src/app/layout.tsx`
- Uses official Bootstrap Icons v1.11.3 from jsdelivr CDN
- No additional configuration needed for basic icon usage

**Usage in Components:**
```tsx
// ✅ Correct way - Use Bootstrap Icons classes
<i className={clsx('bi', 'bi-envelope', styles.icon)} aria-hidden="true" />

// ❌ Incorrect - Don't use Unicode characters directly
<span style={{ fontFamily: 'bootstrap-icons' }}>{'\f32f'}</span>
```

**Input Component Icons:**
- Uses `leftIcon` prop with Bootstrap Icons class names (e.g., `bi-envelope`, `bi-lock`)
- Password toggle automatically uses `bi-eye` and `bi-eye-slash`
- Select boxes use contextual icons: chevron-down (normal), exclamation-triangle (error), check-circle-fill (success)

**SVG Documentation:**
- All custom SVGs are documented in `SVG_DOCUMENTATION.md`
- Prefer Bootstrap Icons over custom SVGs for consistency
- SVGs in select boxes are documented with inline comments in `Input.module.scss`

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_BACKEND_URL` - Backend API base URL

### Testing - ⚡ **OBLIGATORIO DESDE ENERO 2025**

**🚨 POLÍTICA CRÍTICA:** Después de 2 módulos fallidos, el testing con **Vitest** es **OBLIGATORIO** para todos los módulos nuevos.

#### **Configuración Vitest:**
- **Framework:** Vitest (10x más rápido que Jest)
- **Environment:** happy-dom (performance optimizada)
- **Coverage:** Mínimo 70% en functions, lines, branches, statements
- **Ubicación:** Tests deben estar en `src/modules/{module}/tests/` 
- **Patrón:** `*.test.ts` o `*.spec.ts`

#### **Scripts Disponibles:**
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode

#### **Estructura de Testing por Módulo:**
```
src/modules/{module}/tests/
├── utils/
│   ├── test-utils.ts        # Mock factories, utilities
│   └── index.ts             # Exports centralizados
├── services/
│   ├── {service}.test.ts    # Unit tests para services
│   └── index.ts
├── hooks/
│   ├── {hook}.test.ts       # Unit tests para hooks
│   └── index.ts
└── components/
    ├── {component}.test.tsx  # Integration tests para components
    └── index.ts
```

#### **Patrones de Testing Implementados:**
- **✅ AAA Pattern:** Arrange, Act, Assert
- **✅ Mock Factories:** Para crear datos de prueba consistentes
- **✅ Service Layer Testing:** Tests unitarios completos para API layer
- **✅ Hook Testing:** Tests para SWR hooks con mocks
- **✅ Component Testing:** Integration tests con React Testing Library
- **✅ Coverage Thresholds:** Enforcement automático de cobertura

#### **Testing Guidelines:**
1. **OBLIGATORIO:** Crear tests para todos los services, hooks principales y componentes
2. **Mock Strategy:** Usar mocks para axios, Next.js router, external dependencies
3. **Test Organization:** Tests organizados por módulo, no globalmente
4. **Coverage Enforcement:** CI/CD fallará si coverage < 70%
5. **Performance:** Tests deben ejecutarse en < 5 segundos por módulo

#### **Quality Gates:**
- ❌ **NO SE PERMITE** código sin tests en módulos nuevos
- ❌ **NO SE PERMITE** coverage < 70%
- ❌ **NO SE PERMITE** tests lentos (> 10s por suite)
- ✅ **OBLIGATORIO** tests passing 100% antes de commit

**Razón:** Prevenir pérdida de trabajo como en los 2 módulos anteriores que se tuvieron que borrar.

### Debugging and Troubleshooting

#### Products Module Debugging ✨ **ENTERPRISE LEVEL**
The Products module includes **comprehensive debugging and performance monitoring**:

**🔧 Performance Debugging:**
- **React.memo renders** logged with component names
- **Zustand state changes** logged with 🔍 prefix (filters), 📊 (sort), 📄 (page)
- **Virtualizer performance** tracked with rendered item counts
- **SWR cache hits/misses** visible in React DevTools

**📊 Console Logging:**
- All API requests and responses logged to browser console
- JSON:API transformation steps logged with 🔄 prefix
- **View mode switches** logged with 👁️ prefix
- **Filter debounce** operations logged with timing
- Raw API data logged for inspection

**⚠️ Common Issues Resolved:**
- ✅ **Re-render issues**: Fixed with Zustand UI state separation
- ✅ **Focus loss in search**: Fixed with local state + debounce pattern  
- ✅ **Performance with large datasets**: Fixed with TanStack Virtual
- ✅ **Filter dependencies**: Fixed with independent UI state
- ✅ **Button variant errors**: Fixed info -> primary globally
- ✅ **StatusBadge errors**: Removed from auxiliary entities
- ✅ **window.confirm() UX**: Replaced with professional ConfirmModal
- ✅ **Delete constraint errors**: Added relationship error detection
- **400 Bad Request on Products**: Usually caused by unsupported pagination parameters
- **Authentication errors**: Verify `NEXT_PUBLIC_BACKEND_URL` and token validity

**🎯 Performance Monitoring:**
- **Zero re-renders** on filter changes (check console for 🔄 logs)
- **Virtualization active** for all views with 1000+ items
- **Debounce working** - search updates every 300ms max
- **Focus preserved** - no input blur on filter changes

**API Testing:**
Use curl to test backend endpoints directly:
```bash
# Test products endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/vnd.api+json" \
     "http://127.0.0.1:8000/api/v1/products"

# Test with sorting
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/vnd.api+json" \
     "http://127.0.0.1:8000/api/v1/products?sort=name&include=unit,category,brand"
```

**✅ Recent Improvements (Enero 2025):**
- **CRUD Routes:** Complete create/edit/view pages for Units, Categories, Brands
- **Error Handling:** Professional relationship constraint detection
- **ConfirmModal:** Replaced all window.confirm() with async modal
- **Focus Preservation:** Fixed input focus loss during filter operations
- **TypeScript:** Fixed button variant errors (info -> primary)

**Known Limitations:**
- Products pagination is not implemented on backend (avoid `page[number]` and `page[size]`)
- Some sort fields may not be supported on all endpoints
- Alert component needs to be created and registered in Design System
- FormWrapper data loading issues in edit mode (under investigation)

## Integration Notes

This frontend is designed to work with `api-base`, the official modular backend from Atomo Soluciones. The backend exposes available modules via `/api/modules` endpoint for dynamic feature detection.

## ⚠️ IMPORTANT GIT COMMIT GUIDELINES

**CRITICAL:** Claude Code should NEVER execute git commits directly. Always provide commit text for manual execution by the developer.

**Reasoning:** Previous incidents have resulted in work loss when Claude Code executed commits directly. To prevent data loss and maintain developer control:

- ❌ **NEVER use:** `git commit` commands via Bash tool
- ❌ **NEVER use:** `git push` commands via Bash tool  
- ✅ **ALWAYS provide:** Commit message text for manual copy-paste
- ✅ **ALWAYS provide:** Clear instructions for staging and committing

**Proper workflow:**
1. Claude Code stages changes with `git add .` if needed
2. Claude Code provides formatted commit message text
3. Developer manually executes: `git commit -m "message"`
4. Developer handles push and any merge conflicts

This ensures developer maintains full control over git history and prevents accidental work loss.

## Documentation References

- Complete project documentation: `docs/README.PROYECTO_BASE_ATM_WEBAPP.md`
- Production deployment guide: `PRODUCTION_DEPLOYMENT.md`
- Role system documentation: `docs/SISTEMA_ROLES_AUTENTICACION.md`
- Bootstrap Icons integration: `docs/BOOTSTRAP_ICONS_MEJORA.md`