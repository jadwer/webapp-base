'use client'

/**
 * Factura libre, como en Bind (junta 2026-10-08): cliente con sus datos
 * fiscales, serie con folio que asigna el sistema, conceptos con buscador de
 * productos y claves SAT, IVA por concepto y totales en vivo. Guarda un
 * borrador (CFDI + cuenta por cobrar); se timbra desde el detalle.
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { DetailSection, formatCurrency, toast } from '@lwm/ui'
import { ProductSearchSelect, SatKeyCombobox, productService } from '@lwm/products'
import {
  freeInvoiceService,
  type FreeInvoiceCustomer,
  type FreeInvoiceOptions,
  type FreeInvoiceReceptor,
} from '../services/freeInvoiceService'

export interface FreeInvoiceFormProps {
  onCreated: (cfdiId: string) => void
  onCancel: () => void
}

interface LineState {
  key: string
  productId: string
  descripcion: string
  cantidad: string
  valorUnitario: string
  descuento: string
  claveProdServ: string
  claveUnidad: string
  unidad: string
  noIdentificacion: string
  tasaIva: string
}

const DEFAULT_TASA = '0.160000'

let lineSeq = 0
const emptyLine = (): LineState => ({
  key: `l${++lineSeq}`,
  productId: '',
  descripcion: '',
  cantidad: '1',
  valorUnitario: '',
  descuento: '',
  claveProdServ: '',
  claveUnidad: '',
  unidad: '',
  noIdentificacion: '',
  tasaIva: DEFAULT_TASA,
})

const num = (v: string): number => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

/** Mismo calculo que el backend (FreeInvoiceService): en centavos, IVA sobre importe - descuento. */
export function computeLine(line: Pick<LineState, 'cantidad' | 'valorUnitario' | 'descuento' | 'tasaIva'>) {
  const importe = Math.round(num(line.cantidad) * Math.round(num(line.valorUnitario) * 100))
  const descuento = Math.round(num(line.descuento) * 100)
  const base = importe - descuento
  const iva = line.tasaIva === 'no_objeto' ? 0 : Math.round(base * num(line.tasaIva))
  return { importe, descuento, iva }
}

const tasaFromRate = (rate?: number | null): string => {
  if (rate === 8) return '0.080000'
  if (rate === 0) return '0.000000'
  return DEFAULT_TASA
}

type ApiError = { response?: { data?: { message?: string; error?: string; errors?: Record<string, string[]> } } }

function CustomerSearch({
  selected,
  onSelect,
}: {
  selected: FreeInvoiceCustomer | null
  onSelect: (c: FreeInvoiceCustomer | null) => void
}) {
  const inputId = useId()
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<FreeInvoiceCustomer[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const reqRef = useRef(0)

  useEffect(() => {
    const t = term.trim()
    if (t.length < 2) {
      setResults([])
      return
    }
    const req = ++reqRef.current
    setLoading(true)
    const timer = setTimeout(() => {
      freeInvoiceService
        .searchCustomers(t)
        .then((r) => req === reqRef.current && setResults(r))
        .catch(() => req === reqRef.current && setResults([]))
        .finally(() => req === reqRef.current && setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [term])

  if (selected) {
    return (
      <div className="d-flex align-items-center justify-content-between border rounded p-2">
        <div>
          <div className="fw-semibold">{selected.legalName || selected.name}</div>
          <small className="text-muted">{selected.taxId || 'Sin RFC'}</small>
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onSelect(null)}>
          Cambiar
        </button>
      </div>
    )
  }

  return (
    <div className="position-relative">
      <label htmlFor={inputId} className="form-label">
        Cliente <span className="text-danger">*</span>
      </label>
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-search" />
        </span>
        <input
          id={inputId}
          className="form-control"
          placeholder="Buscar por nombre, razón social, RFC o correo"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
      </div>
      {open && term.trim().length >= 2 && (
        <div className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1050, maxHeight: 280, overflowY: 'auto' }}>
          {loading && <div className="list-group-item text-muted">Buscando...</div>}
          {!loading && results.length === 0 && <div className="list-group-item text-muted">Sin resultados</div>}
          {!loading &&
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => {
                  onSelect(c)
                  setOpen(false)
                  setTerm('')
                }}
              >
                <div className="fw-semibold">{c.legalName || c.name}</div>
                <small className="text-muted">{c.taxId || 'Sin RFC'}</small>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

export const FreeInvoiceForm: React.FC<FreeInvoiceFormProps> = ({ onCreated, onCancel }) => {
  const [options, setOptions] = useState<FreeInvoiceOptions | null>(null)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<FreeInvoiceCustomer | null>(null)
  const [receptor, setReceptor] = useState<FreeInvoiceReceptor | null>(null)
  const [series, setSeries] = useState('')
  const [metodoPago, setMetodoPago] = useState('PPD')
  const [formaPago, setFormaPago] = useState('99')
  const [usoCfdi, setUsoCfdi] = useState('')
  const [condicionesPago, setCondicionesPago] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineState[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    freeInvoiceService
      .getOptions()
      .then((o) => {
        setOptions(o)
        setSeries(o.series.find((s) => s.isDefault)?.code ?? o.series[0]?.code ?? '')
      })
      .catch(() => setOptionsError('No se pudieron cargar las opciones de facturación (series y catálogos SAT).'))
  }, [])

  useEffect(() => {
    setReceptor(null)
    if (!customer) return
    freeInvoiceService
      .getReceptor(customer.id)
      .then((r) => {
        setReceptor(r)
        setUsoCfdi(r.usoCfdi)
      })
      .catch(() => toast.error('No se pudieron leer los datos fiscales del cliente'))
  }, [customer])

  // Regla SAT: PPD siempre con forma 99
  useEffect(() => {
    if (metodoPago === 'PPD') setFormaPago('99')
    else if (formaPago === '99') setFormaPago('03')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metodoPago])

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, l) => {
        const c = computeLine(l)
        return { subtotal: acc.subtotal + c.importe, descuento: acc.descuento + c.descuento, iva: acc.iva + c.iva }
      },
      { subtotal: 0, descuento: 0, iva: 0 }
    )
  }, [lines])
  const total = totals.subtotal - totals.descuento + totals.iva

  const updateLine = (key: string, patch: Partial<LineState>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const handleProduct = async (key: string, productId: string) => {
    updateLine(key, { productId })
    if (!productId) return
    try {
      const { data: p } = await productService.getProduct(productId, ['unit'])
      updateLine(key, {
        descripcion: p.name,
        valorUnitario: p.price ? String(p.price) : '',
        claveProdServ: p.satClaveProdServ || '',
        claveUnidad: p.satClaveUnidad || '',
        unidad: p.unit?.name || '',
        noIdentificacion: p.sku || '',
        tasaIva: tasaFromRate(p.taxRate ?? (p.iva ? 16 : 0)),
      })
    } catch {
      toast.error('No se pudo cargar el producto; captura el concepto a mano')
    }
  }

  const validate = (): string[] => {
    const e: string[] = []
    if (!customer) e.push('Selecciona el cliente.')
    lines.forEach((l, i) => {
      const n = i + 1
      if (!l.descripcion.trim()) e.push(`Concepto ${n}: falta la descripción.`)
      if (num(l.cantidad) <= 0) e.push(`Concepto ${n}: la cantidad debe ser mayor a cero.`)
      if (num(l.valorUnitario) <= 0) e.push(`Concepto ${n}: el precio unitario debe ser mayor a cero.`)
      if (!l.claveProdServ) e.push(`Concepto ${n}: falta la clave SAT de producto o servicio.`)
      if (!l.claveUnidad) e.push(`Concepto ${n}: falta la clave SAT de unidad.`)
      const c = computeLine(l)
      if (c.descuento > c.importe) e.push(`Concepto ${n}: el descuento es mayor que el importe.`)
    })
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const localErrors = validate()
    setErrors(localErrors)
    if (localErrors.length > 0 || !customer) return

    setSaving(true)
    try {
      const result = await freeInvoiceService.create({
        contactId: customer.id,
        series,
        metodoPago,
        formaPago,
        usoCfdi,
        condicionesPago,
        notes,
        items: lines.map((l) => ({
          productId: l.productId || null,
          descripcion: l.descripcion.trim(),
          cantidad: num(l.cantidad),
          valorUnitario: num(l.valorUnitario),
          descuento: num(l.descuento),
          claveProdServ: l.claveProdServ,
          claveUnidad: l.claveUnidad,
          unidad: l.unidad || null,
          noIdentificacion: l.noIdentificacion || null,
          tasaIva: l.tasaIva,
        })),
      })
      toast.success(`Factura ${result.series}-${result.folio} guardada como borrador`)
      onCreated(result.id)
    } catch (err) {
      // Regla 7: el error del backend se muestra con detalle
      const data = (err as ApiError).response?.data
      const list = data?.errors ? Object.values(data.errors).flat() : [data?.message || data?.error || 'No se pudo guardar la factura']
      setErrors(list)
    } finally {
      setSaving(false)
    }
  }

  if (optionsError) return <div className="alert alert-danger">{optionsError}</div>
  if (!options) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <strong>Revisa la factura:</strong>
          <ul className="mb-0 mt-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <DetailSection title="Cliente" icon="bi-person">
            <CustomerSearch selected={customer} onSelect={setCustomer} />
            {receptor && (
              <div className="mt-3">
                <div className="row g-2 small">
                  <div className="col-sm-6">
                    <span className="text-muted">RFC:</span> {receptor.rfc}
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">C.P. fiscal:</span> {receptor.codigoPostal || '-'}
                  </div>
                  <div className="col-12">
                    <span className="text-muted">Razón social:</span> {receptor.nombre}
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Régimen fiscal:</span> {receptor.regimenFiscal}
                  </div>
                </div>
                {receptor.faltantes.length > 0 && (
                  <div className="alert alert-warning mt-2 mb-0 py-2 small">
                    Faltan datos fiscales del cliente: {receptor.faltantes.join(', ')}. Captúralos en Contactos antes de timbrar.
                  </div>
                )}
                <div className="mt-3">
                  <label className="form-label" htmlFor="fi-uso">
                    Uso del CFDI
                  </label>
                  <select id="fi-uso" className="form-select" value={usoCfdi} onChange={(e) => setUsoCfdi(e.target.value)}>
                    {options.usosCfdi.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </DetailSection>
        </div>

        <div className="col-lg-5">
          <DetailSection title="Comprobante" icon="bi-receipt">
            <div className="mb-3">
              <label className="form-label" htmlFor="fi-serie">
                Serie
              </label>
              <select id="fi-serie" className="form-select" value={series} onChange={(e) => setSeries(e.target.value)}>
                {options.series.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name} (siguiente: {s.nextFolio})
                  </option>
                ))}
              </select>
              <div className="form-text">El folio lo asigna el sistema al guardar.</div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="fi-metodo">
                Método de pago
              </label>
              <select id="fi-metodo" className="form-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                {options.metodosPago.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="fi-forma">
                Forma de pago
              </label>
              <select
                id="fi-forma"
                className="form-select"
                value={formaPago}
                disabled={metodoPago === 'PPD'}
                onChange={(e) => setFormaPago(e.target.value)}
              >
                {options.formasPago
                  .filter((f) => (metodoPago === 'PPD' ? f.code === '99' : f.code !== '99'))
                  .map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.label}
                    </option>
                  ))}
              </select>
              {metodoPago === 'PPD' && <div className="form-text">Con PPD el SAT exige 99 (Por definir); el pago real va en el complemento.</div>}
            </div>
            <div>
              <label className="form-label" htmlFor="fi-cond">
                Condiciones de pago
              </label>
              <input
                id="fi-cond"
                className="form-control"
                value={condicionesPago}
                placeholder={metodoPago === 'PPD' ? `Crédito a ${receptor?.paymentTerms || 30} días` : 'Contado'}
                onChange={(e) => setCondicionesPago(e.target.value)}
              />
            </div>
          </DetailSection>
        </div>
      </div>

      <DetailSection
        title="Conceptos"
        icon="bi-list-ul"
        headerActions={
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setLines((p) => [...p, emptyLine()])}>
            <i className="bi bi-plus-lg me-1" />
            Agregar concepto
          </button>
        }
      >
        {lines.map((line, index) => {
          const c = computeLine(line)
          return (
            <div key={line.key} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Concepto {index + 1}</strong>
                {lines.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    aria-label={`Quitar concepto ${index + 1}`}
                    title="Quitar concepto"
                    onClick={() => setLines((p) => p.filter((l) => l.key !== line.key))}
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>
              <div className="row g-2">
                <div className="col-md-6">
                  <ProductSearchSelect
                    label="Producto (opcional)"
                    value={line.productId}
                    onChange={(id) => handleProduct(line.key, id)}
                    className="mb-0"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor={`${line.key}-desc`}>
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <input
                    id={`${line.key}-desc`}
                    className="form-control"
                    value={line.descripcion}
                    onChange={(e) => updateLine(line.key, { descripcion: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <SatKeyCombobox
                    kind="claveProdServ"
                    label="Clave SAT producto/servicio"
                    value={line.claveProdServ}
                    onChange={(v) => updateLine(line.key, { claveProdServ: v || '' })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <SatKeyCombobox
                    kind="claveUnidad"
                    label="Clave SAT de unidad"
                    value={line.claveUnidad}
                    onChange={(v) => updateLine(line.key, { claveUnidad: v || '' })}
                    required
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label" htmlFor={`${line.key}-cant`}>
                    Cantidad
                  </label>
                  <input
                    id={`${line.key}-cant`}
                    type="number"
                    min="0"
                    step="any"
                    className="form-control"
                    value={line.cantidad}
                    onChange={(e) => updateLine(line.key, { cantidad: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label" htmlFor={`${line.key}-pu`}>
                    Precio unitario (sin IVA)
                  </label>
                  <input
                    id={`${line.key}-pu`}
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={line.valorUnitario}
                    onChange={(e) => updateLine(line.key, { valorUnitario: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label" htmlFor={`${line.key}-desc-imp`}>
                    Descuento
                  </label>
                  <input
                    id={`${line.key}-desc-imp`}
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={line.descuento}
                    onChange={(e) => updateLine(line.key, { descuento: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label" htmlFor={`${line.key}-iva`}>
                    Impuesto
                  </label>
                  <select
                    id={`${line.key}-iva`}
                    className="form-select"
                    value={line.tasaIva}
                    onChange={(e) => updateLine(line.key, { tasaIva: e.target.value })}
                  >
                    {options.tasasIva.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 text-md-end">
                  <div className="form-label">Importe</div>
                  <div className="fw-semibold pt-md-2">{formatCurrency((c.importe - c.descuento) / 100, 'MXN')}</div>
                </div>
              </div>
            </div>
          )
        })}
      </DetailSection>

      <div className="row g-4">
        <div className="col-lg-7">
          <DetailSection title="Notas internas" icon="bi-journal-text">
            <textarea className="form-control" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="Notas internas" />
          </DetailSection>
        </div>
        <div className="col-lg-5">
          <DetailSection title="Totales" icon="bi-calculator">
            <dl className="row mb-0">
              <dt className="col-6 fw-normal">Subtotal</dt>
              <dd className="col-6 text-end">{formatCurrency(totals.subtotal / 100, 'MXN')}</dd>
              {totals.descuento > 0 && (
                <>
                  <dt className="col-6 fw-normal">Descuento</dt>
                  <dd className="col-6 text-end">-{formatCurrency(totals.descuento / 100, 'MXN')}</dd>
                </>
              )}
              <dt className="col-6 fw-normal">IVA trasladado</dt>
              <dd className="col-6 text-end">{formatCurrency(totals.iva / 100, 'MXN')}</dd>
              <dt className="col-6 fs-5">Total</dt>
              <dd className="col-6 text-end fs-5 fw-bold">{formatCurrency(total / 100, 'MXN')}</dd>
            </dl>
          </DetailSection>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-save me-2" />}
          Guardar borrador
        </button>
      </div>
    </form>
  )
}

export default FreeInvoiceForm
