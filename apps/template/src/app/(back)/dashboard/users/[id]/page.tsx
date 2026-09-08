'use client'

import React from 'react'
import { UserViewPage } from '@/modules/users'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = React.use(params)

  return <UserViewPage userId={resolvedParams.id} />
}
