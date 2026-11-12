'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './redesign.module.scss'

export interface LwResultModalProps {
  open: boolean
  tone?: 'success' | 'warning' | 'danger'
  title: ReactNode
  message?: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  /** Si se define, aparece el boton secundario (para confirmaciones) */
  cancelLabel?: string
  onCancel?: () => void
  busy?: boolean
}

const ICON = { success: 'bi-check-circle', warning: 'bi-exclamation-triangle', danger: 'bi-exclamation-octagon' }

/** Modal centrado del rediseno: aviso de exito o confirmacion de una accion delicada. */
export function LwResultModal({ open, tone = 'success', title, message, confirmLabel = 'Aceptar', onConfirm, cancelLabel, onCancel, busy }: LwResultModalProps) {
  if (!open) return null
  return (
    <div className={styles.backdrop} role="presentation" onClick={() => (onCancel && !busy ? onCancel() : undefined)}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="lw-result-title" onClick={(e) => e.stopPropagation()}>
        <div className={clsx(styles.dialogIcon, styles[`dialogIcon-${tone}`])} aria-hidden="true">
          <i className={clsx('bi', ICON[tone])} />
        </div>
        <div className={styles.dialogTitle} id="lw-result-title">{title}</div>
        {message ? <div className={styles.dialogText}>{message}</div> : null}
        <div className={styles.dialogActions}>
          <button type="button" className={clsx('btn', tone === 'danger' ? 'btn-danger' : 'btn-primary')} onClick={onConfirm} disabled={busy}>
            {busy ? 'Procesando...' : confirmLabel}
          </button>
          {cancelLabel && onCancel ? (
            <button type="button" className="btn btn-outline-primary" onClick={onCancel} disabled={busy}>
              {cancelLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
