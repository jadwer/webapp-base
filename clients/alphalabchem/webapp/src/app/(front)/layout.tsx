'use client'

import AlphaLabHeader from '@/modules/landing/AlphaLabHeader'
import AlphaLabFooter from '@/modules/landing/AlphaLabFooter'
import { CustomerSidebar } from '@lwm/ecommerce'

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AlphaLabHeader />
      <CustomerSidebar />
      <main>{children}</main>
      <AlphaLabFooter />
    </>
  )
}
