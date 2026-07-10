import type { Metadata } from "next";
import '@/ui/styles/sass/main.scss';
import '@/ui/styles/nprogress.css';
import Script from "next/script";
import NavigationProgress from '@/ui/components/NavigationProgress';
import { DemoBanner } from '@/modules/demo';
// BootStrapClient no es necesario para los íconos

export const metadata: Metadata = {
  title: "WebApp Base Template",
  description: "",
  // Demo builds must never be indexed by search engines.
  ...(process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    ? { robots: { index: false, follow: false } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS is compiled from SCSS via main.css. Tenants override the primary color via the CSS custom property `--brand-primary` defined in their own branding.scss. */}
        {/* Only Bootstrap Icons loaded from CDN (icon fonts only) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
        {/*
          Google Analytics: tenants wire their own GA4 ID via env or AppSetting
          in their own clients/<name>/webapp/src/app/layout.tsx.
        */}
      </head>
      <body>
        <NavigationProgress />
        {/* Demo mode banner: renders null unless NEXT_PUBLIC_DEMO_MODE=true
            AND the backend confirms demo mode (double check in useDemoMode). */}
        <DemoBanner />
        {children}
        {/* Bootstrap JS for interactive components (offcanvas, modals, etc.) */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
