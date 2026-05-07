# webapp-base template

Generic Next.js + React 19 + Bootstrap 5 frontend template for ERP-style apps
backed by `api-base` (Laravel + JSON:API). Lives at `apps/template/` inside
the `lwm-codebase` monorepo and serves as the demo/master that every tenant
client repo extends.

## Quick start

```bash
# from the monorepo root:
pnpm install
pnpm dev
```

Configure backend URL by copying `.env.example` to `.env.local` (or
`.env.development`) and pointing `NEXT_PUBLIC_BACKEND_URL` at your local
Laravel instance.

## Production build

```bash
pnpm --filter ./apps/template build
pnpm --filter ./apps/template start
```

## Architecture

- `src/modules/<name>/`: independent, portable feature modules (auth, products,
  contacts, sales, ecommerce, page-builder-pro, mailer-manager, etc.). Each
  module owns its components, hooks, services, types, and templates.
- `src/ui/`: thin layer of layout-level UI (HeaderNavbar, Sidebar,
  DashboardLayout). Base primitives (Button, Card, Modal, Input, etc.) are
  imported from the shared `@lwm/ui` workspace package.
- `src/app/`: Next.js App Router routes, split into `(back)` (dashboard) and
  `(front)` (public store) groups.
- `src/lib/`: shared API clients (axios + Sanctum token interceptor) and
  utilities.

## Tenant overrides

This template is the master that ships generic placeholder branding,
landing, and seeders. Tenants build their own client repo at
`clients/<name>/webapp/` that consumes `@lwm/*` packages and replaces:

- Landing module → `clients/<name>/webapp/src/modules/landing/`
- Branding (colors, logo, favicon) → `clients/<name>/webapp/src/styles/branding.scss`
  + `clients/<name>/webapp/public/images/brand/`
- Public-site Header/Footer → `clients/<name>/webapp/src/ui/components/PublicHeader.tsx`
  (overrides this template's placeholder)
- Static pages content → tenant's PageBuilder seeder (e.g.
  `clients/<name>/api/Modules/PageBuilder/Database/Seeders/<Name>PagesSeeder.php`)

Backend overrides go through `app/Providers/CustomerServiceProvider.php` in
the tenant's `api-base` clone (see api-base's docstring on that file).

## Scripts

| Command | Effect |
| --- | --- |
| `npm run dev` | Next dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Production runtime |
| `npm run lint` | ESLint |
| `npm run sass` | Watch SCSS compilation (rare; Next handles it via SCSS modules) |
| `npx vitest run` | Run the 1716-test suite once |

## Documentation

- Monorepo-level WP-style refactor: `../../CLAUDE.md`
- Per-module conventions: `./CLAUDE.md`
- Plan: `~/.claude/plans/zesty-snacking-dijkstra.md`
