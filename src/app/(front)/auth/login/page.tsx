'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginTemplate from '@/modules/auth/templates/LoginTemplate'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  return <LoginTemplate redirect={redirect} />
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
