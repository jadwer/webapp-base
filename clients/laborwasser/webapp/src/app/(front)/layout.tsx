'use client'

import { Header, Footer } from '@/modules/landing'
import { CustomerSidebar } from '@lwm/ecommerce'

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <CustomerSidebar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
