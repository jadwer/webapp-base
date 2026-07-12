'use client'

import { PublicHeader } from '@/ui/components/PublicHeader'
import { PublicFooter } from '@/ui/components/PublicFooter'
import { CustomerSidebar, ProductSearchBox } from '@/modules/ecommerce'

/**
 * Public route group layout for the template.
 *
 * Tenants replace PublicHeader / PublicFooter here with their own
 * branded versions imported from `clients/<name>/webapp/src/modules/landing/`.
 */
export default function FrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicHeader search={<ProductSearchBox />} />
      <CustomerSidebar />
      <main>{children}</main>
      <PublicFooter />
    </>
  )
}
