# AlphaLab Chemicals

Tenant client built on the LWM monorepo (master alive + `@lwm/*` packages).

## Structure

```
clients/alphalabchem/
├── README.md                  # this file
├── webapp/                    # Next.js 15 frontend (this repo, in monorepo)
│   ├── public/images/brand/   # logo.png, footer-banner.png (from client)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     # root: brand metadata + main.scss
│   │   │   ├── (back)/        # dashboard routes — uses @lwm/ui DashboardLayout
│   │   │   └── (front)/       # public routes — uses AlphaLab Header/Footer
│   │   ├── config/
│   │   │   └── navigationConfig.ts  # tenant-specific sidebar config
│   │   ├── modules/
│   │   │   └── landing/       # AlphaLabHeader, AlphaLabFooter (branded)
│   │   └── styles/
│   │       ├── branding.scss  # CSS custom props (--brand-*)
│   │       └── main.scss      # Bootstrap with $primary = #1B3766
│   ├── next.config.ts         # transpilePackages + sassOptions
│   ├── package.json           # consumes @lwm/* via workspace:*
│   └── tsconfig.json
└── (api lives outside this monorepo at ../../../api-alphalabchem/,
   a git clone of api-base — Fase 4.4)
```

## Brand identity (provided by client 2026-05-08)

- **Commercial name:** AlphaLab Chemicals
- **Tagline:** Pure Solutions. Powerful Results.
- **Domain:** alphalabchem.com.mx + api.alphalabchem.com.mx
- **Address:** Laureles #62, Jardines de Atizapán, Atizapán de Zaragoza, Estado de México, CP 52978
- **Phones:** 55-8939-3444 / 55-2121-2494
- **Sales email:** ventas@alphalabchem.com.mx
- **SKU pattern:** `ALB-{abrev3}-{size}` (e.g. `ALB-BUT-005` = 1-Butanol, garrafa 5L)

## Brand palette (visual reading from client logo)

| Token | Hex | Use |
|-------|-----|-----|
| `--brand-primary` | `#1B3766` | Wordmark "Alpha", main CTAs |
| `--brand-secondary` | `#1A8B8C` | Wordmark "Lab", accents |
| `--brand-accent` | `#7AC74F` | Pillars (chemistry leaf), success |
| `--brand-banner-bg` | `#0F2752` | Footer banner with 4 pillars |

> Replace these with the official brand guide hex codes when client provides them.

## Run dev locally

```bash
# From monorepo root
pnpm install
pnpm --filter @lwm-clients/alphalabchem-webapp dev

# Open http://localhost:3000
```

## Backend

The matching Laravel backend lives at `../../../api-alphalabchem/` as a
separate git repo (clone of `api-base`). Each tenant has its own DB +
seeders + custom migrations. To upgrade after a master release:

```bash
cd ../../../api-alphalabchem
git fetch upstream
git merge upstream/lwm     # resolve seeder conflicts in favor of tenant
php artisan migrate --force
php artisan db:seed --class=AlphaLabSeeder --force
```

## Outstanding (waiting on client)

- [ ] SVG vector of the logo (have PNG only)
- [ ] Favicon
- [ ] OG image 1200x630 (social card)
- [ ] Brand guide with exact hex codes
- [ ] Razón social fiscal completa for CFDI
- [ ] PAC SW Sapien credentials (using LWM creds for now — see B7 handoff)
- [ ] SMTP credentials
- [ ] First admin email/phone for `god` user seeding
