'use client'

/**
 * Usuario en el encabezado. Con sesion: avatar, nombre y una flecha que abre la tarjeta del
 * perfil (Figma "Diseno final - Perfil", 2026-11-18): avatar sobre la franja azul, nombre,
 * correo, fecha de alta y las acciones Mi perfil, Cambiar contrasena y Cerrar sesion. El
 * diseno tambien dibuja telefono, direcciones y RFC; el usuario no los tiene (se quitaron del
 * perfil el 30-09 porque eran filas fijas sin dato).
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/auth'
import { useIsClient } from '@lwm/primitives'
import { UserAvatar } from './UserAvatar'
import { roleLabel } from '../lib/roleLabels'

type HeaderUser = {
  name: string
  email?: string
  avatar?: string | null
  createdAt?: string
  created_at?: string
  roles?: Array<{ name: string; description?: string } | string>
  role?: string
}

const roleOf = (user: HeaderUser): string | null => {
  const first = user.roles?.[0] ?? user.role
  if (!first) return null
  const name = typeof first === 'string' ? first : first.name
  return roleLabel(name)
}

export default function AuthStatus() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const isClient = useIsClient()
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  // Renderizar el mismo contenido en servidor y cliente hasta que se hidrate
  if (!isClient || isLoading) {
    return <span className="text-muted small">Cargando sesión...</span>
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    router.replace('/auth/login')
  }

  if (!user) {
    return (
      <Link href="/auth/login" className="text-decoration-none text-muted small d-flex align-items-center gap-2">
        <i className="bi bi-box-arrow-in-right fs-5 text-secondary" aria-hidden="true"></i>
        Iniciar sesión
      </Link>
    )
  }

  const u = user as HeaderUser
  const role = roleOf(u)
  const created = u.createdAt ?? u.created_at
  const go = (href: string) => { setOpen(false); router.push(href) }

  return (
    <div className="position-relative" ref={boxRef}>
      <button
        type="button"
        className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Menú de ${u.name}`}
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar avatar={u.avatar} name={u.name} size={34} />
        <span className="text-start lh-sm d-none d-sm-block">
          <span className="d-block fw-semibold small text-body">{u.name}</span>
          {role ? <span className="d-block small text-muted">{role}</span> : null}
        </span>
        <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`} aria-hidden="true"></i>
      </button>

      {open ? (
        <div
          className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow overflow-hidden"
          style={{ width: 300, zIndex: 1050 }}
          role="dialog"
          aria-label="Mi cuenta"
        >
          <div className="bg-primary" style={{ height: 64 }} />
          <div className="px-3 pb-3" style={{ marginTop: -40 }}>
            <UserAvatar avatar={u.avatar} name={u.name} size={72} />
            <div className="fw-bold fs-5 mt-2 text-break">{u.name}</div>
            {role ? <div className="small text-muted mb-1">{role}</div> : null}
            {u.email ? <div className="small text-break"><span className="fw-semibold">Contacto:</span> {u.email}</div> : null}
            {created ? (
              <div className="small"><span className="fw-semibold">Registrado desde:</span> {new Date(created).toLocaleDateString('es-MX')}</div>
            ) : null}
            <button type="button" className="btn btn-link btn-sm p-0 mt-2" onClick={() => go('/dashboard/profile')}>
              Mi perfil y foto
            </button>
            <div className="d-flex gap-2 mt-3">
              <button type="button" className="btn btn-primary btn-sm flex-fill" onClick={() => go('/dashboard/profile?tab=security')}>
                Cambiar contraseña
              </button>
              <button type="button" className="btn btn-outline-primary btn-sm flex-fill" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
