import type { Metadata } from "next";
import '@/ui/styles/main.css';
import '@/ui/styles/nprogress.css';
import Script from "next/script";
import NavigationProgress from '@/ui/components/NavigationProgress';
// BootStrapClient no es necesario para los íconos

export const metadata: Metadata = {
  title: "WebApp Base",
  description: "By Labor Wasser de México",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-M1SCXB58G4"></Script>
        <Script id="google-analytics">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-M1SCXB58G4');
`}
        </Script>
      </head>
      <body>
        <NavigationProgress />
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
