/**
 * LOCATION DETAIL
 * Detalle de ubicacion con el esqueleto de detalle (encabezado, secciones y resumen).
 */

'use client'

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ConfirmModal,
  DetailSection,
  PageHeader,
  StatusBadge,
  toast,
  useNavigationProgress,
  type ConfirmModalHandle,
} from '@lwm/ui'
import { useBranchName } from '@lwm/auth'
import { useLocation, useLocationsMutations } from '../hooks'
import { LOCATION_TYPE, WAREHOUSE_TYPE } from '../utils/labels'
import { formatDate, formatQty } from '../utils/format'
import { deleteErrorMessage } from '../utils/listing'

interface LocationDetailProps {
  locationId: string
}

const LIST_HREF = '/dashboard/inventory/locations'

const ACTIVE_STATUS = {
  active: { label: 'Activa', variant: 'success' as const },
  inactive: { label: 'Inactiva', variant: 'secondary' as const },
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="col-sm-5 text-muted fw-normal">{label}</dt>
    <dd className="col-sm-7">{children || <span className="text-muted">-</span>}</dd>
  </>
)

const YesNo = ({ value }: { value?: boolean }) =>
  value ? <span className="text-success">Sí</span> : <span className="text-muted">No</span>

export const LocationDetail = ({ locationId }: LocationDetailProps) => {
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const branchName = useBranchName()
  const { location, isLoading, error } = useLocation(locationId, ['warehouse'])
  const { deleteLocation } = useLocationsMutations()

  const handleDelete = async () => {
    if (!location) return
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar la ubicación "${location.name}"?\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar ubicación', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteLocation(locationId)
      toast.success('Ubicación eliminada')
      navigation.push(LIST_HREF)
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'la ubicación'))
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando ubicación...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !location) {
    return (
      <div className="container-fluid py-4">
        <PageHeader title="Ubicación" backHref={LIST_HREF} />
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'La ubicación no existe o no está disponible.'}
        </div>
      </div>
    )
  }

  const warehouse = location.warehouse
  const hierarchy = [location.aisle, location.rack, location.shelf, location.level].filter(Boolean).join(' / ')

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title={location.name}
        icon="bi-geo-alt"
        badges={
          <>
            <StatusBadge status={location.isActive ? 'active' : 'inactive'} map={ACTIVE_STATUS} />
            <StatusBadge status={location.locationType} map={LOCATION_TYPE} />
          </>
        }
        subtitle={[location.code, warehouse?.name].filter(Boolean).join(' · ') || undefined}
        backHref={LIST_HREF}
        actions={
          <>
            <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
              <i className="bi bi-trash me-1" />
              Eliminar
            </button>
            <Link href={`${LIST_HREF}/${locationId}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil me-1" />
              Editar
            </Link>
          </>
        }
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <DetailSection title="Información general" icon="bi-info-circle">
            <dl className="row mb-0">
              <Field label="Nombre"><strong>{location.name}</strong></Field>
              <Field label="Código"><code>{location.code}</code></Field>
              <Field label="Tipo"><StatusBadge status={location.locationType} map={LOCATION_TYPE} /></Field>
              <Field label="Descripción">{location.description}</Field>
              <Field label="Código de barras">{location.barcode ? <code>{location.barcode}</code> : null}</Field>
            </dl>
          </DetailSection>

          <DetailSection title="Posición física" icon="bi-grid-3x3">
            <dl className="row mb-0">
              <Field label="Pasillo">{location.aisle}</Field>
              <Field label="Rack">{location.rack}</Field>
              <Field label="Estante">{location.shelf}</Field>
              <Field label="Nivel">{location.level}</Field>
              <Field label="Posición">{location.position}</Field>
              {hierarchy && <Field label="Ruta">{hierarchy}</Field>}
            </dl>
          </DetailSection>

          <DetailSection
            title="Almacén"
            icon="bi-building"
            headerActions={warehouse ? (
              <Link href={`/dashboard/inventory/warehouses/${warehouse.id}`} className="btn btn-sm btn-outline-secondary">
                Ver almacén
              </Link>
            ) : undefined}
          >
            <dl className="row mb-0">
              <Field label="Almacén">
                {warehouse?.name}
                {warehouse?.code && <small className="d-block text-muted">Código: {warehouse.code}</small>}
              </Field>
              <Field label="Tipo">{warehouse?.warehouseType ? <StatusBadge status={warehouse.warehouseType} map={WAREHOUSE_TYPE} /> : null}</Field>
              {branchName.multi && <Field label="Sucursal">{warehouse ? branchName.name(warehouse.branchId) : null}</Field>}
              <Field label="Dirección">{warehouse?.address}</Field>
            </dl>
          </DetailSection>
        </div>

        <div className="col-lg-4">
          <DetailSection title="Resumen" icon="bi-sliders">
            <dl className="row mb-0">
              <Field label="Peso máximo">{location.maxWeight != null ? `${formatQty(location.maxWeight)} kg` : null}</Field>
              <Field label="Volumen máximo">{location.maxVolume != null ? `${formatQty(location.maxVolume)} m³` : null}</Field>
              <Field label="Dimensiones">{location.dimensions}</Field>
              <Field label="Prioridad">{location.priority != null ? String(location.priority) : null}</Field>
              <Field label="Permite picking"><YesNo value={location.isPickable} /></Field>
              <Field label="Permite recepción"><YesNo value={location.isReceivable} /></Field>
              <Field label="Creada">{formatDate(location.createdAt, { withTime: true })}</Field>
              <Field label="Actualizada">{formatDate(location.updatedAt, { withTime: true })}</Field>
            </dl>
          </DetailSection>
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
