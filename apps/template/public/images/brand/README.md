# public/images/brand/

Tenant brand assets live here. The template ships a single placeholder
`logo.svg` so a fresh install renders without 404s. Tenants replace it with
their own `logo.svg` / `logo.png` (and other brand assets like favicon, OG
image) in `clients/<name>/webapp/public/images/brand/`.

The `HeaderNavbar` component reads the actual logo path from the
`company.logo_path_alt` AppSetting at runtime; this directory is the
fallback when no AppSetting is configured (e.g. fresh install).
