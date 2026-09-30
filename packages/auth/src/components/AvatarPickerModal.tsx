'use client'

/**
 * "Editar foto de perfil" (diseno 2026-09-30): vista previa grande, grilla
 * de avatares ilustrados, "Subir foto" y Cancelar / Aplicar.
 *
 * Marcado Bootstrap propio: @lwm/ui depende de @lwm/auth, asi que usar su
 * Modal aqui crearia un ciclo de paquetes.
 */

import React, { useEffect, useRef, useState } from 'react'
import { mutate } from 'swr'
import { AVATAR_PRESETS, avatarPresetSrc, presetNumber } from '../lib/avatar'
import { removeAvatar, setAvatarPreset, uploadAvatar } from '../lib/profileApi'
import { UserAvatar } from './UserAvatar'

const MAX_BYTES = 2 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export interface AvatarPickerModalProps {
  show: boolean
  onHide: () => void
  name?: string | null
  /** Valor actual ("preset:N", URL o null). */
  current?: string | null
  onApplied?: (avatar: string | null) => void
}

type Choice = { kind: 'preset'; n: number } | { kind: 'file'; file: File; preview: string } | { kind: 'none' } | null

function errorMessages(err: unknown): string {
  const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data
  if (data?.errors) return Object.values(data.errors).flat().join(' ')
  return data?.message ?? 'No se pudo guardar el avatar. Intenta de nuevo.'
}

export function AvatarPickerModal({ show, onHide, name, current, onApplied }: AvatarPickerModalProps) {
  const [choice, setChoice] = useState<Choice>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (show) {
      const n = presetNumber(current)
      setChoice(n ? { kind: 'preset', n } : null)
      setError(null)
    }
  }, [show, current])

  useEffect(() => () => {
    if (choice?.kind === 'file') URL.revokeObjectURL(choice.preview)
  }, [choice])

  if (!show) return null

  const previewValue =
    choice?.kind === 'preset' ? `preset:${choice.n}` : choice?.kind === 'file' ? choice.preview : choice?.kind === 'none' ? null : current

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setError('La foto debe ser JPG, PNG o WEBP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('La foto no puede pesar más de 2 MB.')
      return
    }
    setError(null)
    setChoice({ kind: 'file', file, preview: URL.createObjectURL(file) })
  }

  const apply = async () => {
    if (!choice) {
      onHide()
      return
    }
    setSaving(true)
    setError(null)
    try {
      const attrs =
        choice.kind === 'preset'
          ? await setAvatarPreset(choice.n)
          : choice.kind === 'file'
            ? await uploadAvatar(choice.file)
            : await removeAvatar()
      const avatar = (attrs?.avatar as string | null | undefined) ?? null
      // Refresca el usuario de la sesion (header, sidebar).
      await mutate('/api/v1/profile')
      onApplied?.(avatar)
      onHide()
    } catch (err) {
      setError(errorMessages(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="avatar-picker-title" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-4">
              <h2 id="avatar-picker-title" className="h4 text-center mb-3">Editar foto de perfil</h2>

              <div className="d-flex justify-content-center mb-4">
                <UserAvatar avatar={previewValue} name={name} size={128} />
              </div>

              <div className="fw-semibold mb-2">Selecciona un avatar</div>
              <div className="row g-3 mb-3" role="radiogroup" aria-label="Avatares">
                {AVATAR_PRESETS.map((n) => {
                  const selected = choice?.kind === 'preset' && choice.n === n
                  return (
                    <div key={n} className="col-3 text-center">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`Avatar ${n}`}
                        className={`btn p-0 rounded-circle border-0 ${selected ? 'shadow' : ''}`}
                        style={{ outline: selected ? '3px solid var(--bs-primary)' : 'none', outlineOffset: 2 }}
                        onClick={() => setChoice({ kind: 'preset', n })}
                        disabled={saving}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarPresetSrc(n)} alt="" width={72} height={72} className="rounded-circle d-block" />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <input ref={fileRef} type="file" accept={ACCEPTED.join(',')} className="d-none" onChange={onFile} aria-label="Subir foto" />
                <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={saving}>
                  Subir foto
                </button>
                {(current || choice) && (
                  <button type="button" className="btn btn-link text-danger" onClick={() => setChoice({ kind: 'none' })} disabled={saving}>
                    Quitar
                  </button>
                )}
              </div>

              {error && (
                <div className="alert alert-danger small py-2" role="alert">
                  {error}
                </div>
              )}

              <div className="row g-2 mt-2">
                <div className="col-6">
                  <button type="button" className="btn btn-outline-primary w-100 py-2" onClick={onHide} disabled={saving}>
                    Cancelar
                  </button>
                </div>
                <div className="col-6">
                  <button type="button" className="btn btn-primary w-100 py-2" onClick={apply} disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />}
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={saving ? undefined : onHide} />
    </>
  )
}

export default AvatarPickerModal
