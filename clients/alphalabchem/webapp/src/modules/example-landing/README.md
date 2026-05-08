# example-landing

Placeholder landing for the webapp-base template (`apps/template`).

This module intentionally has no images, no external data fetches, and no tenant branding. It exists to give the template a working `/` page so a fresh install verifies the build pipeline end-to-end.

## How tenants override

Tenants replace this with their own landing module under
`clients/<name>/webapp/src/modules/landing/` and import that one from their
own `src/app/HomeClient.tsx`. The example-landing module stays in the
template (master) and is NOT used by client builds.
