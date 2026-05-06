# LWM Codebase Monorepo - Guía para Claude

Este es el monorepo `lwm-codebase`: el master vivo de la arquitectura WordPress-style.
Contiene el template Next.js base + los packages `@lwm/*` publicados a GitHub Packages.

> Repo de cliente (consumidor de packages): vive en `clients/<name>/` aparte. NO en este repo.
> Backend: `../api-base/` (template Laravel separado, no es monorepo).

---

## Críticas reglas (heredadas de webapp-base original)

- NUNCA ejecutar `git commit` ni `git push` automáticamente. Solo entregar el texto del mensaje para ejecución manual.
- NO emojis en commits ni en respuestas. Tono profesional.
- NO atribución "Generated with Claude" ni "Co-Authored-By".
- NO regenerar módulos existentes.
- Conventional Commits cuando aplique (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

---

## Estructura

```
webapp-base/  (este monorepo, slug GitHub mantenido)
├── apps/
│   └── template/          # Next.js 15 demo del template (ex-webapp-base raíz)
├── packages/
│   ├── ui/                # @lwm/ui - design system
│   ├── auth/              # @lwm/auth - Sanctum + role guards
│   ├── app-config/        # @lwm/app-config - AppSettings runtime
│   ├── products/          # @lwm/products
│   ├── contacts/          # @lwm/contacts
│   ├── sales/             # @lwm/sales
│   ├── ecommerce/         # @lwm/ecommerce
│   ├── page-builder/      # @lwm/page-builder
│   ├── mailer-manager/    # @lwm/mailer-manager
│   ├── permissions/       # @lwm/permissions
│   └── types/             # @lwm/types - shared TS types
├── legacy_files/          # documentos históricos pre-refactor
├── package.json           # root, name "lwm-codebase", scripts agregadores
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .changeset/            # Changesets config (semver + publish)
├── .npmrc                 # @lwm scope → GitHub Packages
└── CLAUDE.md              # este archivo
```

---

## Comandos clave

```bash
# Dev del template Next.js (igual que antes del refactor):
pnpm dev

# Build de todo (template + packages):
pnpm build

# Build solo packages (skip template):
pnpm build:packages

# Tests del template:
pnpm test:template

# Tests de todos los packages + template:
pnpm test

# Crear changeset cuando modificas un package:
pnpm changeset

# Aplicar versiones pendientes:
pnpm version

# Publicar a GitHub Packages:
pnpm release
```

---

## Publicación a GitHub Packages

1. Crear PAT en GitHub con scopes `write:packages`, `read:packages`, `repo`.
2. Local: `echo "//npm.pkg.github.com/:_authToken=YOUR_PAT" >> ~/.npmrc`
3. CI: settear secret `NPM_TOKEN` en repo settings.

El registry para `@lwm` ya está configurado en `.npmrc` del monorepo:
```
@lwm:registry=https://npm.pkg.github.com
```

---

## Política de hotfixes durante el refactor

- Hotfix urgente a producción LWM → branch `master` (NO `refactor/wp-style`).
- Refactor activo → branch `refactor/wp-style`.
- Tag de retorno garantizado: `v1-stable-pre-refactor` (en este repo y en `api-base`).

---

## Aislamiento de AtomoPlatform

Este monorepo NO se mezcla con AtomoPlatform (`/home/jadwer/dev/AtomoSoluciones/AtomoPlatform/`).

| Ecosistema | Stack | npm scope | Registry |
|---|---|---|---|
| **LWM Codebase (este)** | Next.js 15 + Bootstrap 5 + SASS | `@lwm/*` | GitHub Packages |
| **AtomoPlatform** | Vite + Radix + CSS Modules | `@atomo/*` | Verdaccio |

---

## Plan completo

`/home/jadwer/.claude/plans/zesty-snacking-dijkstra.md`
