# webapp-base: guia para Claude

Monorepo pnpm del frontend del ERP (Next.js 15 + React 19, Bootstrap 5 + SASS). Backend en
`../api-base/`. Rumbo, estado de prod y pendientes: `../ROADMAP.md`, `../PROMPT.md` y
`../roadmap/pendientes.yaml` (carpeta `base/` del workspace, fuera de este repo).

## Reglas

- Commits y push solo con instruccion de Gabino. Sin emojis, sin guion largo, sin
  atribucion ("Generated with Claude", "Co-Authored-By"). Conventional Commits.
- Rama de trabajo: `feat/rediseno-cotizaciones`. `refactor/wp-style` y `master` son
  historicas: no se trabaja ni se despliega de ahi.
- No regenerar modulos existentes. El backend es la fuente de verdad: listas, catalogos y
  enums se consumen del backend, no se duplican aqui.
- Todo texto que ve el usuario va en espanol, incluidos los errores; un error de
  validacion se muestra con su detalle (`getApiErrorMessage` de `@lwm/ui`), nunca un aviso
  generico.
- Un cambio en una pantalla del tenant de LaborWasser se replica en AlphaLab y en la
  plantilla: `npm run check:parity` lo vigila y el hook de push lo corre.

## Estructura

```
webapp-base/
├── apps/template/            # plantilla Next.js (demo marca blanca); aqui corre vitest
├── clients/laborwasser/      # tenant de LaborWasser (lo que esta en prod)
├── clients/alphalabchem/     # tenant de AlphaLab
├── packages/                 # 24 packages @lwm/* consumidos con workspace:*
│   accounting app-config audit auth billing commissions contacts crm ecommerce finance
│   guide hr inventory mailer-manager page-builder permissions primitives products
│   purchase reports sales system-health types ui
└── scripts/                  # verify.sh, check-parity.sh (los usa .githooks/pre-push)
```

Los packages no se publican a ningun registro: viven en el workspace y se empaquetan con
el build del tenant. Las piezas del rediseno (`LwSurface`, `LwPageTitle`, `LwKpiCard`,
`LwStatusPill`, `LwTableWrap`, `LwPagination`, `LwResultModal`, `ConfirmModal`) estan en
`@lwm/ui`.

## Comandos

```bash
pnpm dev                                   # plantilla en localhost:3000
pnpm build:template                        # build de la plantilla
cd apps/template && npx vitest run         # todas las pruebas (la suite del tenant no corre)
pnpm --filter @lwm/sales test              # pruebas de un package
npm run check:parity                       # paridad entre tenants
scripts/verify.sh                          # lo que corre el hook antes del push
fuser -k 3000/tcp && rm -rf apps/template/.next   # liberar el puerto y limpiar
```

Build y despliegue de dev y de prod: `../scripts/ops/build-dev.sh`, `build-prod.sh`,
`deploy_front.sh`; procedimiento en `../docs/RUNBOOK_RELEASE.md`. El build necesita
`.env.production` del tenant o el bundle llama rutas relativas.

## AtomoPlatform es otro proyecto

`~/dev/AtomoSoluciones/AtomoPlatform/` (Vite + Radix, `@atomo/*`, Verdaccio) no se mezcla
con este monorepo. Lo unico compartido es `@lwm/guide`, que consume el backend de
`atomo/guide`.
