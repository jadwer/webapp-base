# @lwm/inventory

Modulo de inventario del dashboard: almacenes (con ubicaciones como pestana), stock, movimientos, lotes, fraccionamiento (con conversiones como pestana) y conteos ciclicos (sin entrada de menu). El backend es la fuente de verdad; este paquete se adapta a sus Schemas JSON:API.

## Estructura

- `services/`: un servicio por recurso JSON:API (axios sobre `lib/axiosClient.ts`), con transformacion snake_case a camelCase.
- `hooks/`: SWR por recurso (`useWarehouses`, `useStock`, `useProductBatches`...) y `useInventoryCounts` para los totales del dashboard (`page[size]=1` y `meta.page.total`).
- `components/`: paginas de lista (`*AdminPage*`), tablas (`*TableSimple`), formularios, detalles, wrappers de alta/edicion y pestanas (`WarehousesTabs`, `FractionationTabs`).
- `types/`: interfaces por entidad y filtros.
- `utils/`: `format.ts` (`toNumber`, `formatDate`, `formatQty`), `labels.ts` (mapas de estado para `StatusBadge` con los valores que valida el backend) y `listing.ts`. Se exportan por nombre desde `index.ts`.

## Esqueletos de pagina

```
LISTA:   container-fluid py-4 > PageHeader > [TabNav] > [fila KpiCard] > ListToolbar
         > {error && Alert} > card > card-body p-0 > XTableSimple > PaginationSimple > ConfirmModal
DETALLE: container-fluid py-4 > PageHeader(title, badges, subtitle, backHref, actions) > [TabNav]
         > row g-4 > col-lg-8 DetailSection(s) | col-lg-4 DetailSection "Resumen"
FORM:    container-fluid py-4 > row justify-content-center > col-lg-8 > PageHeader(backHref) > form > DetailSection(s)
PAGE:    app/(back)/.../page.tsx = metadata + `return <Componente />` (sin wrappers)
```

Primitivas compartidas en `@lwm/ui`: `PageHeader`, `ListToolbar` (buscador con debounce), `StatusBadge`, `EmptyState`, `KpiCard`, `TabNav`, `DetailSection` y `ConfirmModal`. El filtro de sucursal (`BranchFilter`) entra como `children` de `ListToolbar`.

## Pruebas

```bash
cd packages/inventory && npx vitest run
npx tsc --noEmit -p packages/inventory   # desde la raiz de webapp-base
```
