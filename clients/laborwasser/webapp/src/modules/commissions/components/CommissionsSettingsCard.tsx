/**
 * Commissions Module - Settings Card (admin only)
 *
 * Reads/writes the "commissions" AppSettings group:
 * commissions.enabled, commissions.default_pct, commissions.basis,
 * commissions.payout_period. Only enabled/default_pct are editable here;
 * basis and payout_period are shown read-only (v1 only supports
 * basis=collected, payout_period is informational for the payout report).
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useCommissionsSettings } from '../hooks'

export const CommissionsSettingsCard: React.FC = () => {
  const { settings, isLoading, updateSetting } = useCommissionsSettings()
  const [defaultPctDraft, setDefaultPctDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setDefaultPctDraft(String(settings.defaultPct))
    }
  }, [settings])

  const handleToggleEnabled = async () => {
    if (!settings) return
    setIsSaving(true)
    setSavedMessage(null)
    try {
      await updateSetting('commissions.enabled', !settings.enabled)
      setSavedMessage('Configuracion actualizada')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePct = async () => {
    const parsed = Number(defaultPctDraft)
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) return

    setIsSaving(true)
    setSavedMessage(null)
    try {
      await updateSetting('commissions.default_pct', String(parsed))
      setSavedMessage('Porcentaje default actualizado')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="card mb-4">
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-gear me-2" />
          Comisiones - Configuracion
        </h6>
        {savedMessage && <span className="small text-success">{savedMessage}</span>}
      </div>
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small text-muted mb-1">Comisiones habilitadas</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={settings.enabled}
                onChange={handleToggleEnabled}
                disabled={isSaving}
              />
              <label className="form-check-label small">
                {settings.enabled ? 'Activas' : 'Inactivas'}
              </label>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small text-muted mb-1">Porcentaje default (%)</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                min={0}
                max={100}
                step="0.1"
                value={defaultPctDraft}
                onChange={(e) => setDefaultPctDraft(e.target.value)}
                disabled={isSaving}
              />
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleSavePct}
                disabled={isSaving || defaultPctDraft === String(settings.defaultPct)}
              >
                Guardar
              </button>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted mb-1">Base de calculo</label>
            <input type="text" className="form-control" value={settings.basis} disabled />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small text-muted mb-1">Periodo de corte</label>
            <input type="text" className="form-control" value={settings.payoutPeriod} disabled />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommissionsSettingsCard
