'use client'

import { PublicHeader, PublicFooter } from '@lwm/ui'
import { CustomerSidebar, ProductSearchBox } from '@/modules/ecommerce'
import { PortalLanding, HeaderCartLink } from '@/modules/portal-landing'

interface HomeClientProps {
  showFullCatalog?: boolean
  enableProductModal?: boolean
}

/**
 * Portada de la plantilla: landing del portal (vende el sistema y muestra la
 * tienda viva). La home vive fuera de (front), asi que monta aqui el mismo
 * encabezado y pie del sitio publico. Los tenants la reemplazan con la suya.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HomeClient(_props: HomeClientProps = {}) {
  return (
    <>
      <PublicHeader search={<ProductSearchBox />} cart={<HeaderCartLink />} />
      <CustomerSidebar />
      <main>
        <PortalLanding />
      </main>
      <PublicFooter />
    </>
  )
}
