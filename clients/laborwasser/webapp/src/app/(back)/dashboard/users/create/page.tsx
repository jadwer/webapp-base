'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { UserForm } from '@/modules/users'

export default function CreateUserPage() {
  const router = useRouter()

  return (
    <div className="container-fluid py-4">
      <UserForm
        onSuccess={() => router.push('/dashboard/users')}
        onCancel={() => router.push('/dashboard/users')}
      />
    </div>
  )
}
