'use client'

/**
 * Administracion de sucursales (Configuracion > Sucursales).
 * Lista con alta y edicion en linea. La principal (Matriz) no se puede
 * eliminar ni desmarcar desde aqui: marcar otra como principal la
 * reemplaza (el backend garantiza una sola). Los 422 se muestran con
 * detalle por campo.
 */

import React, { useState } from 'react'
import { useBranches, branchesService } from '@lwm/auth'
import { getUserValidationErrorMessages } from '../users/utils/jsonApiErrors'
import type { Branch, BranchFormData } from '@lwm/auth'

const EMPTY: BranchFormData = {
  name: '',
  code: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
  email: '',
  isActive: true,
  isMain: false,
}

const toForm = (b: Branch): BranchFormData => ({
  name: b.name,
  code: b.code,
  address: b.address ?? '',
  city: b.city ?? '',
  state: b.state ?? '',
  postalCode: b.postalCode ?? '',
  phone: b.phone ?? '',
  email: b.email ?? '',
  isActive: b.isActive,
  isMain: b.isMain,
})

const FIELDS: Array<{ key: keyof BranchFormData; label: string; col: string; placeholder?: string }> = [
  { key: 'name', label: 'Nombre', col: 'col-md-4', placeholder: 'Sucursal Toluca' },
  { key: 'code', label: 'Clave', col: 'col-md-2', placeholder: 'TOL' },
  { key: 'phone', label: 'Teléfono', col: 'col-md-3' },
  { key: 'email', label: 'Correo', col: 'col-md-3' },
  { key: 'address', label: 'Calle y número', col: 'col-md-5' },
  { key: 'city', label: 'Ciudad', col: 'col-md-3' },
  { key: 'state', label: 'Estado', col: 'col-md-2' },
  { key: 'postalCode', label: 'CP', col: 'col-md-2' },
]

export const BranchesAdmin: React.FC = () => {
  const { branches, isLoading, error, mutate } = useBranches()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<BranchFormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  const startNew = () => {
    setForm(EMPTY)
    setMessages([])
    setEditingId('new')
  }

  const startEdit = (branch: Branch) => {
    setForm(toForm(branch))
    setMessages([])
    setEditingId(branch.id)
  }

  const cancel = () => {
    setEditingId(null)
    setMessages([])
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessages([])
    try {
      if (editingId === 'new') {
        await branchesService.create(form)
      } else if (editingId) {
        await branchesService.update(editingId, form)
      }
      await mutate()
      setEditingId(null)
    } catch (err) {
      const details = getUserValidationErrorMessages(err)
      setMessages(details.length > 0 ? details : ['No se pudo guardar la sucursal. Intenta de nuevo.'])
    } finally {
      setSaving(false)
    }
  }

  const remove = async (branch: Branch) => {
    if (branch.isMain) return
    if (!window.confirm(`¿Eliminar la sucursal "${branch.name}"? Solo es posible si no tiene usuarios, almacenes ni documentos.`)) {
      return
    }
    try {
      await branchesService.remove(branch.id)
      await mutate()
    } catch (err) {
      const details = getUserValidationErrorMessages(err)
      setMessages(
        details.length > 0
          ? details
          : [`No se pudo eliminar "${branch.name}": tiene usuarios, almacenes o documentos ligados. Desactívala en su lugar.`]
      )
    }
  }

  const setField = (key: keyof BranchFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const renderForm = () => (
    <form onSubmit={save} className="border rounded p-3 mb-3 bg-light">
      <div className="row g-2">
        {FIELDS.map((f) => (
          <div className={f.col} key={f.key}>
            <label className="form-label small mb-1" htmlFor={`branch-${f.key}`}>
              {f.label}
            </label>
            <input
              id={`branch-${f.key}`}
              className="form-control form-control-sm"
              value={String(form[f.key] ?? '')}
              placeholder={f.placeholder}
              required={f.key === 'name' || f.key === 'code'}
              onChange={(e) => setField(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="d-flex flex-wrap gap-4 mt-3">
        <div className="form-check">
          <input
            id="branch-isActive"
            type="checkbox"
            className="form-check-input"
            checked={form.isActive}
            onChange={(e) => setField('isActive', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="branch-isActive">Activa</label>
        </div>
        <div className="form-check">
          <input
            id="branch-isMain"
            type="checkbox"
            className="form-check-input"
            checked={form.isMain}
            onChange={(e) => setField('isMain', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="branch-isMain">
            Sucursal principal (reemplaza a la actual)
          </label>
        </div>
      </div>
      <div className="d-flex gap-2 mt-3">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Guardando...' : editingId === 'new' ? 'Crear sucursal' : 'Guardar cambios'}
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 mb-1">Sucursales</h1>
          <p className="text-muted small mb-0">
            Misma empresa y mismos datos fiscales. La sucursal identifica de dónde sale cada documento y a qué sucursales
            tiene acceso cada usuario.
          </p>
        </div>
        {editingId === null && (
          <button type="button" className="btn btn-primary" onClick={startNew}>
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />
            Nueva sucursal
          </button>
        )}
      </div>

      {messages.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <ul className="mb-0">
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {editingId === 'new' && renderForm()}

      {isLoading && <div className="text-muted">Cargando sucursales...</div>}
      {error && <div className="alert alert-danger">No se pudieron cargar las sucursales.</div>}

      {!isLoading && !error && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Clave</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) =>
                editingId === b.id ? (
                  <tr key={b.id}>
                    <td colSpan={6}>{renderForm()}</td>
                  </tr>
                ) : (
                  <tr key={b.id}>
                    <td className="fw-semibold">{b.code}</td>
                    <td>
                      {b.name}
                      {b.isMain && <span className="badge bg-primary ms-2">Principal</span>}
                    </td>
                    <td className="small text-muted">
                      {[b.address, b.city, b.state, b.postalCode && `CP ${b.postalCode}`].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="small">{b.phone || '—'}</td>
                    <td>
                      <span className={`badge ${b.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {b.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => startEdit(b)}
                        disabled={editingId !== null}
                        aria-label={`Editar ${b.name}`}
                      >
                        <i className="bi bi-pencil" aria-hidden="true" />
                      </button>
                      {!b.isMain && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => remove(b)}
                          disabled={editingId !== null}
                          aria-label={`Eliminar ${b.name}`}
                        >
                          <i className="bi bi-trash" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
