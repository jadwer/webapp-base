'use client'

/**
 * ALTA, EDICION Y CONSULTA DE CATALOGOS (categoria, marca, unidad) con la piel del
 * rediseno (Figma "Crear nueva categoria", "Editar categoria", 2026-11-17): campos a la
 * izquierda, "Vista previa" de la tarjeta a la derecha y modal de exito. Los errores del
 * backend se muestran con su detalle (antes un toast generico "Error al crear").
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LwSurface, LwPageTitle, LwResultModal, LwStatusPill } from '@lwm/ui'
import { useCategory, useBrand, useUnit, useCategoryMutations, useBrandMutations, useUnitMutations } from '../hooks'

export type CatalogKind = 'category' | 'brand' | 'unit'

const CONFIG: Record<CatalogKind, { noun: string; Noun: string; base: string; icon: string; nameLabel: string }> = {
  category: { noun: 'categoría', Noun: 'Categoría', base: '/dashboard/products/categories', icon: 'bi-tag', nameLabel: 'Nombre' },
  brand: { noun: 'marca', Noun: 'Marca', base: '/dashboard/products/brands', icon: 'bi-award', nameLabel: 'Nombre' },
  unit: { noun: 'unidad', Noun: 'Unidad', base: '/dashboard/products/units', icon: 'bi-rulers', nameLabel: 'Nombre' },
}

// Tipos de unidad que ofrece el formulario; el backend acepta texto libre (no es espejo)
export const UNIT_TYPES = [
  { value: 'peso', label: 'Peso' },
  { value: 'longitud', label: 'Longitud' },
  { value: 'volumen', label: 'Volumen' },
  { value: 'cantidad', label: 'Cantidad' },
  { value: 'tiempo', label: 'Tiempo' },
  { value: 'area', label: 'Área' },
  { value: 'otro', label: 'Otro' },
]
const unitTypeLabel = (v?: string) => UNIT_TYPES.find((t) => t.value === v)?.label ?? v ?? ''

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
  .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')

interface ApiErrorShape { response?: { data?: { message?: string; errors?: Array<{ detail?: string; title?: string }> } }; message?: string }
const apiErrors = (err: unknown, fallback: string): string[] => {
  const e = err as ApiErrorShape
  const list = (e?.response?.data?.errors ?? []).map((x) => x.detail || x.title || '').filter(Boolean)
  return list.length ? list : [e?.response?.data?.message || fallback]
}

interface Record_ { id: string; name: string; description?: string; slug?: string; code?: string; unitType?: string; isActive?: boolean; productsCount?: number; createdAt?: string }

/** Lee el registro del catalogo que toca; los otros hooks quedan sin clave (no consultan). */
function useCatalogRecord(kind: CatalogKind, id?: string) {
  const c = useCategory(kind === 'category' ? id : undefined)
  const b = useBrand(kind === 'brand' ? id : undefined)
  const u = useUnit(kind === 'unit' ? id : undefined)
  const r = kind === 'category' ? { rec: c.category, isLoading: c.isLoading, error: c.error } : kind === 'brand' ? { rec: b.brand, isLoading: b.isLoading, error: b.error } : { rec: u.unit, isLoading: u.isLoading, error: u.error }
  return { record: r.rec as Record_ | undefined, isLoading: r.isLoading, error: r.error }
}

function Preview({ kind, name, sub, detail, isActive, productsCount }: { kind: CatalogKind; name: string; sub?: string; detail?: string; isActive?: boolean; productsCount?: number }) {
  const cfg = CONFIG[kind]
  return (
    <div>
      <div className="small fw-semibold mb-2"><i className="bi bi-eye me-1" aria-hidden="true" /> Vista previa</div>
      <div className="border rounded p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <i className={`bi ${cfg.icon} fs-3 text-primary`} aria-hidden="true" />
          {kind !== 'unit' ? <LwStatusPill tone={isActive === false ? 'neutral' : 'success'}>{isActive === false ? 'Inactiva' : 'Activa'}</LwStatusPill> : null}
        </div>
        <div className="fw-semibold">{name || `Sin nombre`}</div>
        {sub ? <div className="small text-primary">{sub}</div> : null}
        <div className="small text-muted">{detail || 'Sin descripción'}</div>
        <div className="small text-muted border-top mt-2 pt-2">{(productsCount ?? 0).toLocaleString('es-MX')} productos</div>
      </div>
    </div>
  )
}

export const CatalogFormPage: React.FC<{ kind: CatalogKind; id?: string; readOnly?: boolean }> = ({ kind, id, readOnly = false }) => {
  const cfg = CONFIG[kind]
  const router = useRouter()
  const { record, isLoading, error } = useCatalogRecord(kind, id)
  const cat = useCategoryMutations()
  const brand = useBrandMutations()
  const unit = useUnitMutations()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [code, setCode] = useState('')
  const [unitType, setUnitType] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (!record) return
    setName(record.name ?? ''); setDescription(record.description ?? ''); setSlug(record.slug ?? ''); setSlugTouched(Boolean(record.slug))
    setCode(record.code ?? ''); setUnitType(record.unitType ?? '')
  }, [record])

  if (id && isLoading) {
    return <div className="container-fluid py-5 text-center"><span className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando…</span></span></div>
  }
  if (id && (error || !record)) {
    return <div className="container-fluid py-4"><div className="alert alert-warning">{error ? `No se pudo cargar la ${cfg.noun}.` : `No se encontró la ${cfg.noun}.`}</div></div>
  }

  const shownSlug = slugTouched ? slug : slugify(name)
  const sub = kind === 'unit' ? (code ? `Código: ${code}` : undefined) : shownSlug
  const detail = kind === 'unit' ? unitTypeLabel(unitType) : description

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const local: string[] = []
    if (!name.trim()) local.push(`El nombre de la ${cfg.noun} es obligatorio.`)
    if (kind === 'unit') {
      if (!code.trim()) local.push('El código de la unidad es obligatorio.')
      else if (code.trim().length > 10) local.push('El código no puede pasar de 10 caracteres.')
      if (!unitType) local.push('Elige el tipo de unidad.')
    } else if (description.length > 500) local.push('La descripción no puede pasar de 500 caracteres.')
    setErrors(local)
    if (local.length) return
    setSaving(true)
    try {
      let saved: { data: { id: string } }
      if (kind === 'unit') {
        const data = { name: name.trim(), code: code.trim(), unitType }
        saved = id ? await unit.updateUnit(id, data) : await unit.createUnit(data)
      } else {
        const data = { name: name.trim(), description: description.trim() || undefined, slug: shownSlug || undefined }
        if (kind === 'category') saved = id ? await cat.updateCategory(id, data) : await cat.createCategory(data)
        else saved = id ? await brand.updateBrand(id, data) : await brand.createBrand(data)
      }
      setSavedId(saved.data.id)
    } catch (err) {
      setErrors(apiErrors(err, `No se pudo guardar la ${cfg.noun}.`))
    } finally {
      setSaving(false)
    }
  }

  const title = readOnly ? `Consultar ${cfg.noun}:` : id ? `Editar ${cfg.noun}:` : `Crear nueva ${cfg.noun}`
  const field = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className={`form-control ${readOnly ? 'bg-light' : ''}`} readOnly={readOnly} {...props} />

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <form onSubmit={submit} noValidate>
          <LwPageTitle
            title={title}
            highlight={id ? record?.name : undefined}
            subtitle={readOnly ? 'Comencemos consultando sus datos' : id ? 'Comencemos verificando sus datos' : 'Comencemos ingresando sus datos'}
            actions={<Link href={cfg.base} className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-1" aria-hidden="true" /> Volver</Link>}
          />

          {errors.length ? (
            <div className="alert alert-danger" role="alert"><ul className="mb-0">{errors.map((m) => <li key={m}>{m}</li>)}</ul></div>
          ) : null}

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="mb-3">
                <label htmlFor="cat-name" className="form-label">*{cfg.nameLabel}</label>
                {field({ id: 'cat-name', value: name, maxLength: 255, placeholder: `Nombre de la ${cfg.noun}`, onChange: (e) => setName(e.target.value) })}
              </div>
              {kind === 'unit' ? (
                <>
                  <div className="mb-3">
                    <label htmlFor="cat-code" className="form-label">*Código</label>
                    {field({ id: 'cat-code', value: code, maxLength: 10, placeholder: 'Ej. KG, LTR, H87', onChange: (e) => setCode(e.target.value) })}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cat-unitType" className="form-label">*Tipo</label>
                    <select id="cat-unitType" className={`form-select ${readOnly ? 'bg-light' : ''}`} value={unitType} disabled={readOnly} onChange={(e) => setUnitType(e.target.value)}>
                      <option value="">Selecciona un tipo</option>
                      {UNIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      {unitType && !UNIT_TYPES.some((t) => t.value === unitType) ? <option value={unitType}>{unitType}</option> : null}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <label htmlFor="cat-description" className="form-label">Descripción</label>
                    <textarea id="cat-description" className={`form-control ${readOnly ? 'bg-light' : ''}`} rows={3} maxLength={500} readOnly={readOnly} placeholder={`Describe la ${cfg.noun}`} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cat-slug" className="form-label">Slug</label>
                    {field({ id: 'cat-slug', value: shownSlug, maxLength: 100, placeholder: 'se-genera-del-nombre', onChange: (e) => { setSlugTouched(true); setSlug(slugify(e.target.value)) } })}
                    {!readOnly ? <div className="form-text">URL amigable de la {cfg.noun}. Se genera del nombre si lo dejas así.</div> : null}
                  </div>
                </>
              )}
            </div>
            <div className="col-lg-5">
              <Preview kind={kind} name={name} sub={sub} detail={detail} isActive={record?.isActive} productsCount={record?.productsCount} />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href={cfg.base} className="btn btn-outline-primary px-4">{readOnly ? 'Volver' : 'Cancelar'}</Link>
            {readOnly ? (
              <Link href={`${cfg.base}/${id}/edit`} className="btn btn-primary px-4">Ir a editar {cfg.noun}</Link>
            ) : (
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" /> : null}
                {id ? 'Guardar cambios' : `Crear ${cfg.noun}`}
              </button>
            )}
          </div>
        </form>
      </LwSurface>

      <LwResultModal
        open={savedId !== null}
        tone="success"
        title={`${cfg.Noun} ${id ? 'actualizada' : 'registrada'}`}
        message={`La ${cfg.noun} fue ${id ? 'actualizada' : 'registrada'} con éxito`}
        confirmLabel="Confirmar"
        onConfirm={() => { const s = savedId; setSavedId(null); router.push(id ? `${cfg.base}/${s}` : cfg.base) }}
      />
    </div>
  )
}

export default CatalogFormPage
