'use client'

import { useSearchParams } from 'next/navigation'
import LoginTemplate from '@/modules/auth/templates/LoginTemplate'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  return <LoginTemplate redirect={redirect} />
}
