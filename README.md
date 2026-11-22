# webapp-base

Monorepo pnpm del frontend del ERP: plantilla (`apps/template`), tenants
(`clients/laborwasser`, `clients/alphalabchem`) y packages `@lwm/*` en `packages/`.

```bash
pnpm install
pnpm dev                              # plantilla en localhost:3000
pnpm build:template
cd apps/template && npx vitest run    # pruebas
npm run check:parity                  # paridad entre tenants
```

Reglas de trabajo, estructura y despliegue: [CLAUDE.md](./CLAUDE.md).
