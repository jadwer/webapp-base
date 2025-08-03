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
- **page-builder-pro** - GrapeJS-based page builder

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
- `(front)/` - Public routes including auth pages
- `(front)/p/[slug]/` - Dynamic page rendering from page-builder

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

## Integration Notes

This frontend is designed to work with `api-base`, the official modular backend from Atomo Soluciones. The backend exposes available modules via `/api/modules` endpoint for dynamic feature detection.

## Documentation References

- Complete project documentation: `docs/README.PROYECTO_BASE_ATM_WEBAPP.md`
- Production deployment guide: `PRODUCTION_DEPLOYMENT.md`
- Role system documentation: `docs/SISTEMA_ROLES_AUTENTICACION.md`
- Bootstrap Icons integration: `docs/BOOTSTRAP_ICONS_MEJORA.md`