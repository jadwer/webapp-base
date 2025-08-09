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
- **products** - Complete product management system with 4 entities (Product, Unit, Category, Brand)
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

### Products Module
The `products` module provides a complete product management system with 4 entities:

**Entities:**
- **Product** - Main product entity with relationships to Unit, Category, and Brand
- **Unit** - Units of measurement (pieces, kg, liters, etc.)
- **Category** - Product categories with hierarchical support
- **Brand** - Product brands with descriptions and slugs

**Features:**
- Complete CRUD operations for all entities
- JSON:API integration with proper data transformation
- SWR-powered data fetching with caching
- Advanced filtering and sorting capabilities
- Relationship handling and included resources
- Bootstrap-integrated responsive UI
- Real-time search and pagination
- Comprehensive error handling

**Key Components:**
- `ProductsAdminTemplate` - Main products administration interface
- `ProductForm` - Product creation/editing form
- `ProductsTable` - Data table with sorting and filtering
- `UnitsTable/CategoriesTable/BrandsTable` - Management tables for auxiliary entities
- Various utility components (filters, status badges, etc.)

**Technical Implementation:**
- Uses SWR for efficient data fetching and caching
- JSON:API transformers for correct data mapping (camelCase ↔ snake_case)
- Comprehensive debug logging for API diagnostics
- Proper relationship resolution for included resources
- Error handling with user-friendly messages

**API Integration:**
- Full JSON:API compliance with Laravel JSON:API backend
- Automatic Bearer token injection via axios interceptors
- Proper handling of relationships and included resources
- Support for filtering, sorting, and search operations
- Comprehensive error handling and validation

**Usage:**
- Products interface: `/dashboard/products` - List and manage all products
- Units management: `/dashboard/products/units` - Manage measurement units
- Categories management: `/dashboard/products/categories` - Manage product categories
- Brands management: `/dashboard/products/brands` - Manage product brands

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

### State Management
- Uses SWR for server state management and caching
- Zustand available for client-side global state
- Authentication state managed through `useAuth` hook
- Local state preferred for component-specific data

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

### Testing
Currently no specific test framework configured. Check for test scripts in package.json before implementing tests.

### Debugging and Troubleshooting

#### Products Module Debugging
The Products module includes comprehensive debugging capabilities:

**Console Logging:**
- All API requests and responses are logged to browser console
- JSON:API transformation steps are logged with 🔄 prefix
- API request URLs logged with 🔍 prefix
- Raw API data logged for inspection

**Common Issues:**
- **400 Bad Request on Products**: Usually caused by unsupported pagination parameters
- **Empty data in tables**: Check browser console for transformation errors
- **Authentication errors**: Verify `NEXT_PUBLIC_BACKEND_URL` and token validity

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

**Known Limitations:**
- Products pagination is not implemented on backend (avoid `page[number]` and `page[size]`)
- Some sort fields may not be supported on all endpoints

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