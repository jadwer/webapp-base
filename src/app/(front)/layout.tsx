'use client'

import HeaderNavbar from '@/ui/components/HeaderNavbar'

export default function BackPage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HeaderNavbar />

      <main>{children}</main>
    </>
  )
}