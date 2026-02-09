'use client'

import { Header } from '@/modules/laborwasser-landing/components/Header/Header'
import { TopNav } from '@/modules/laborwasser-landing/components/TopNav/TopNav'
import { Footer } from '@/modules/laborwasser-landing/components/Footer/Footer'
import CustomerSidebar from '@/modules/ecommerce/components/CustomerSidebar'

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <TopNav />
      <CustomerSidebar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
