'use client'

import React, { useState } from 'react'
import { avatarSrc, initials } from '../lib/avatar'

export interface UserAvatarProps {
  avatar?: string | null
  name?: string | null
  size?: number
  className?: string
}

/** Avatar circular: preset, foto o iniciales si no hay (o si la imagen falla). */
export function UserAvatar({ avatar, name, size = 32, className = '' }: UserAvatarProps) {
  const src = avatarSrc(avatar)
  const [broken, setBroken] = useState(false)
  const style: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flex: '0 0 auto' }

  if (src && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ? `Avatar de ${name}` : 'Avatar'}
        className={className}
        style={{ ...style, objectFit: 'cover' }}
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <span
      className={`d-inline-flex align-items-center justify-content-center bg-primary text-white fw-semibold ${className}`}
      style={{ ...style, fontSize: Math.max(10, Math.round(size * 0.4)) }}
      aria-label={name ? `Avatar de ${name}` : 'Avatar'}
      role="img"
    >
      {initials(name)}
    </span>
  )
}

export default UserAvatar
