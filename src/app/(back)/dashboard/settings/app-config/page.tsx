'use client'

import { useState, useEffect, useCallback } from 'react'
import { appSettingsService, type AppSettingValue, type AppSettingsGrouped } from '@/modules/app-config/services/appSettingsService'
import { toast } from '@/lib/toast'

interface EditingState {
  key: string
  value: string | boolean | number | null
}

const GROUP_CONFIG: Record<string, { label: string; icon: string; description: string }> = {
  company: {
    label: 'Empresa',
    icon: 'bi-building',
    description: 'Datos generales de la empresa.',
  },
  branding: {
    label: 'Branding',
    icon: 'bi-palette',
    description: 'Colores y apariencia visual.',
  },
  auth: {
    label: 'Autenticacion',
    icon: 'bi-shield-lock',
    description: 'Configuracion de autenticacion y seguridad.',
  },
}

const GROUP_ORDER = ['company', 'branding', 'auth']

export default function AppConfigPage() {
  const [settings, setSettings] = useState<AppSettingsGrouped>({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeGroup, setActiveGroup] = useState('company')

  const loadSettings = useCallback(async () => {
    try {
      const data = await appSettingsService.getAll()
      setSettings(data)
    } catch {
      toast.error('Error al cargar la configuracion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleEdit = (setting: AppSettingValue) => {
    setEditing({ key: setting.key, value: setting.value })
  }

  const handleCancel = () => {
    setEditing(null)
  }

  const handleSave = async () => {
    if (!editing) return

    setSaving(true)
    try {
      const updated = await appSettingsService.update(editing.key, editing.value)

      setSettings((prev) => {
        const newSettings = { ...prev }
        for (const group of Object.keys(newSettings)) {
          if (newSettings[group][editing.key]) {
            newSettings[group] = {
              ...newSettings[group],
              [editing.key]: updated,
            }
            break
          }
        }
        return newSettings
      })

      setEditing(null)
      toast.success('Configuracion actualizada')
    } catch {
      toast.error('Error al guardar la configuracion')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (setting: AppSettingValue) => {
    setSaving(true)
    try {
      const newValue = !setting.value
      const updated = await appSettingsService.update(setting.key, newValue)

      setSettings((prev) => {
        const newSettings = { ...prev }
        for (const group of Object.keys(newSettings)) {
          if (newSettings[group][setting.key]) {
            newSettings[group] = {
              ...newSettings[group],
              [setting.key]: updated,
            }
            break
          }
        }
        return newSettings
      })

      toast.success('Configuracion actualizada')
    } catch {
      toast.error('Error al guardar la configuracion')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Cargando configuracion...</p>
        </div>
      </div>
    )
  }

  const groupSettings = settings[activeGroup] || {}
  const groupConfig = GROUP_CONFIG[activeGroup]

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Configuracion del Sistema</h4>
          <p className="text-muted mb-0">Administra los datos de empresa, branding y autenticacion.</p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        {GROUP_ORDER.map((group) => {
          const config = GROUP_CONFIG[group]
          if (!config) return null
          return (
            <li className="nav-item" key={group}>
              <button
                className={`nav-link ${activeGroup === group ? 'active' : ''}`}
                onClick={() => { setActiveGroup(group); setEditing(null) }}
              >
                <i className={`bi ${config.icon} me-1`} />
                {config.label}
              </button>
            </li>
          )
        })}
      </ul>

      {groupConfig && (
        <div className="card">
          <div className="card-header d-flex align-items-center gap-2">
            <i className={`bi ${groupConfig.icon}`} />
            <span className="fw-semibold">{groupConfig.label}</span>
            <span className="text-muted ms-2" style={{ fontSize: '13px' }}>{groupConfig.description}</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '30%' }}>Configuracion</th>
                    <th>Valor</th>
                    <th style={{ width: '100px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupSettings).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">
                        No hay configuraciones en este grupo.
                      </td>
                    </tr>
                  ) : (
                    Object.values(groupSettings).map((setting) => {
                      const isEditing = editing?.key === setting.key

                      return (
                        <tr key={setting.key}>
                          <td>
                            <div className="fw-medium">{setting.label || setting.key}</div>
                            {setting.description && (
                              <small className="text-muted">{setting.description}</small>
                            )}
                          </td>
                          <td>
                            {setting.type === 'boolean' ? (
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={!!setting.value}
                                  onChange={() => handleToggle(setting)}
                                  disabled={saving}
                                />
                                <label className="form-check-label">
                                  {setting.value ? (
                                    <span className="badge bg-success">Activado</span>
                                  ) : (
                                    <span className="badge bg-secondary">Desactivado</span>
                                  )}
                                </label>
                              </div>
                            ) : isEditing ? (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={String(editing.value ?? '')}
                                onChange={(e) =>
                                  setEditing({ ...editing, value: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSave()
                                  if (e.key === 'Escape') handleCancel()
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>
                                {setting.type === 'string' && setting.key.includes('color') ? (
                                  <span className="d-flex align-items-center gap-2">
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: 20,
                                        height: 20,
                                        borderRadius: 4,
                                        backgroundColor: String(setting.value || '#ccc'),
                                        border: '1px solid #dee2e6',
                                      }}
                                    />
                                    {String(setting.value || '—')}
                                  </span>
                                ) : (
                                  String(setting.value ?? '—')
                                )}
                              </span>
                            )}
                          </td>
                          <td>
                            {setting.type === 'boolean' ? null : isEditing ? (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={handleSave}
                                  disabled={saving}
                                >
                                  {saving ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <i className="bi bi-check" />
                                  )}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={handleCancel}
                                >
                                  <i className="bi bi-x" />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(setting)}
                              >
                                <i className="bi bi-pencil" />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <div className="card-body">
          <h6 className="card-title">Ayuda</h6>
          <ul className="mb-0" style={{ fontSize: '13px' }}>
            <li><strong>Empresa:</strong> Datos generales como nombre, telefono, email y direccion.</li>
            <li><strong>Branding:</strong> Color primario de la interfaz.</li>
            <li><strong>Autenticacion:</strong> Controla si se requiere verificacion de email para usar el sistema.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
