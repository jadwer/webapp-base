/**
 * Detalle del conteo con sus acciones (2026-11-16): iniciar, registrar lo contado,
 * editar mientras esta programado y cancelar. Los rechazos del backend se muestran con
 * su motivo.
 */

'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { ConfirmModal, LwSurface, LwPageTitle, toast, type ConfirmModalHandle } from '@lwm/ui'
import { CycleCountDetail } from './CycleCountDetail'
import { FormStateCard } from './FormStateCard'
import { useCycleCount } from '../hooks/useCycleCount'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { apiErrorList, apiErrorMessage } from '../utils/listing'
import { formatQty } from '../utils/format'

const LIST_HREF = '/dashboard/inventory/cycle-counts'

interface ViewCycleCountWrapperProps {
  id: string
}

export const ViewCycleCountWrapper: React.FC<ViewCycleCountWrapperProps> = ({ id }) => {
  const { cycleCount, isLoading: loadingData, error: loadError } = useCycleCount({ id })
  const { startCount, recordCount, cancelCount, isLoading: mutating } = useCycleCountMutations()
  const confirmRef = useRef<ConfirmModalHandle>(null)
  const [recordErrors, setRecordErrors] = useState<string[]>([])

  if (loadingData) return <FormStateCard state="loading" title="Conteo" backHref={LIST_HREF} message="Cargando conteo..." />
  if (loadError) return <FormStateCard state="error" title="Conteo" backHref={LIST_HREF} message={loadError.message || 'No se pudo cargar el conteo.'} />
  if (!cycleCount) return <FormStateCard state="not-found" title="Conteo" backHref={LIST_HREF} icon="bi-clipboard-check" message="El conteo no existe o no está disponible." />

  const c = cycleCount

  const handleStart = async () => {
    const ok = await confirmRef.current?.confirm(`¿Iniciar el conteo ${c.countNumber}? Quedará en proceso para registrar lo contado.`, { title: 'Iniciar conteo', confirmText: 'Iniciar', cancelText: 'Volver', confirmVariant: 'primary' })
    if (!ok) return
    try {
      await startCount(id)
      toast.success(`Conteo ${c.countNumber} en proceso`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo iniciar el conteo.'))
    }
  }

  const handleCancel = async () => {
    const ok = await confirmRef.current?.confirm(`¿Cancelar el conteo ${c.countNumber}? No se puede deshacer.`, { title: 'Cancelar conteo', confirmText: 'Cancelar conteo', cancelText: 'Volver', confirmVariant: 'danger' })
    if (!ok) return
    try {
      await cancelCount(id)
      toast.success(`Conteo ${c.countNumber} cancelado`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo cancelar el conteo.'))
    }
  }

  const handleRecord = async (counted: number, adjust: boolean, notes?: string) => {
    try {
      setRecordErrors([])
      const r = await recordCount(id, counted, adjust, notes)
      const v = Number(r.varianceQuantity ?? 0)
      toast.success(
        v === 0
          ? `Conteo ${c.countNumber} registrado sin diferencia`
          : `Conteo ${c.countNumber} registrado: diferencia de ${v > 0 ? '+' : ''}${formatQty(v)}${r.adjustmentMovementId ? ', existencia ajustada' : ''}`,
      )
    } catch (err) {
      setRecordErrors(apiErrorList(err, 'No se pudo registrar el conteo.'))
    }
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Conteo"
          highlight={c.countNumber}
          subtitle="Conteo físico de un producto en un almacén"
          actions={
            <>
              <Link href={LIST_HREF} className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Volver
              </Link>
              {c.status === 'scheduled' ? (
                <>
                  <Link href={`${LIST_HREF}/${id}/edit`} className="btn btn-outline-primary">
                    <i className="bi bi-pencil me-1" aria-hidden="true" /> Editar
                  </Link>
                  <button type="button" className="btn btn-primary" onClick={handleStart} disabled={mutating}>
                    <i className="bi bi-play-fill me-1" aria-hidden="true" /> Iniciar conteo
                  </button>
                </>
              ) : null}
              {c.status === 'scheduled' || c.status === 'in_progress' ? (
                <button type="button" className="btn btn-outline-danger" onClick={handleCancel} disabled={mutating}>
                  <i className="bi bi-x-circle me-1" aria-hidden="true" /> Cancelar conteo
                </button>
              ) : null}
            </>
          }
        />
        <CycleCountDetail cycleCount={c} onRecord={handleRecord} isLoading={mutating} recordErrors={recordErrors} />
      </LwSurface>
      <ConfirmModal ref={confirmRef} />
    </div>
  )
}
