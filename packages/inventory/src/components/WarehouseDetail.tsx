/**
 * WAREHOUSE DETAIL
 * Detalle de almacen con pestanas Informacion | Ubicaciones.
 */

'use client'

import { useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ConfirmModal,
  DetailSection,
  PageHeader,
  StatusBadge,
  TabNav,
  toast,
  type ConfirmModalHandle,
} from '@lwm/ui'
import { useBranchName } from '@lwm/auth'
import { useLocations, useWarehouse, useWarehousesMutations } from '../hooks'
import { LocationsTableSimple } from './LocationsTableSimple'
import { WAREHOUSE_TYPE } from '../utils/labels'
import { formatDate, toNumber } from '../utils/format'
import { deleteErrorMessage, readPageMeta } from '../utils/listing'

interface WarehouseDetailProps {
  warehouseId: string
}

const LIST_HREF = '/dashboard/inventory/warehouses'

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="col-sm-4 text-muted fw-normal">{label}</dt>
    <dd className="col-sm-8">{children || <span className="text-muted">-</span>}</dd>
  </>
)

export const WarehouseDetail = ({ warehouseId }: WarehouseDetailProps) => {
  const router = useRouter()
  const branchName = useBranchName()
  const [activeTab, setActiveTab] = useState('info')
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { warehouse, isLoading, error } = useWarehouse(warehouseId)
  const { deleteWarehouse } = useWarehousesMutations()
  const {
    locations,
    meta: locationsMeta,
    isLoading: isLoadingLocations,
  } = useLocations({ filters: { warehouseId }, pagination: { size: 100 } })

  const locationsTotal = readPageMeta(locationsMeta).total || locations.length

  const handleDelete = async () => {
    if (!warehouse) return
    const confirmed = await confirmModalRef.current?.confirm(
      `¿Eliminar el almacén "${warehouse.name}"?\n\nEsta acción no se puede deshacer.`,
      { title: 'Eliminar almacén', confirmText: 'Eliminar', confirmVariant: 'danger' },
    )
    if (!confirmed) return

    try {
      await deleteWarehouse(warehouseId)
      toast.success('Almacén eliminado')
      router.push(LIST_HREF)
    } catch (err) {
      toast.error(deleteErrorMessage(err, 'el almacén'))
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando almacén...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !warehouse) {
    return (
      <div className="container-fluid py-4">
        <PageHeader title="Almacén" backHref={LIST_HREF} />
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'El almacén no existe o no está disponible.'}
        </div>
      </div>
    )
  }

  const hasAddress = Boolean(
    warehouse.address || warehouse.city || warehouse.state || warehouse.country || warehouse.postalCode,
  )

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title={warehouse.name}
        icon="bi-building"
        badges={
          <>
            <StatusBadge status={warehouse.warehouseType} map={WAREHOUSE_TYPE} />
            <span className={`badge bg-${warehouse.isActive ? 'success' : 'secondary'}`}>
              {warehouse.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </>
        }
        subtitle={
          <>
            Código <code>{warehouse.code}</code>
            {branchName.multi && <> · Sucursal {branchName.name(warehouse.branchId)}</>}
          </>
        }
        backHref={LIST_HREF}
        actions={
          <>
            <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
              <i className="bi bi-trash me-1" />
              Eliminar
            </button>
            <Link href={`${LIST_HREF}/${warehouseId}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil me-1" />
              Editar
            </Link>
          </>
        }
      />

      <TabNav
        tabs={[
          { key: 'info', label: 'Información', icon: 'bi-info-circle' },
          { key: 'locations', label: 'Ubicaciones', icon: 'bi-geo-alt', count: isLoadingLocations ? undefined : locationsTotal },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'info' ? (
        <div className="row g-4">
          <div className="col-lg-8">
            <DetailSection title="Información general" icon="bi-info-circle">
              <dl className="row mb-0">
                <Field label="Nombre">{warehouse.name}</Field>
                <Field label="Código"><code>{warehouse.code}</code></Field>
                <Field label="Tipo">
                  <StatusBadge status={warehouse.warehouseType} map={WAREHOUSE_TYPE} />
                </Field>
                {branchName.multi && <Field label="Sucursal">{branchName.name(warehouse.branchId)}</Field>}
                <Field label="Descripción">{warehouse.description}</Field>
              </dl>
            </DetailSection>

            <DetailSection title="Dirección" icon="bi-geo-alt">
              {hasAddress ? (
                <dl className="row mb-0">
                  <Field label="Dirección">{warehouse.address}</Field>
                  <Field label="Ciudad">{warehouse.city}</Field>
                  <Field label="Estado">{warehouse.state}</Field>
                  <Field label="País">{warehouse.country}</Field>
                  <Field label="Código postal">{warehouse.postalCode}</Field>
                </dl>
              ) : (
                <p className="text-muted mb-0">Sin dirección registrada.</p>
              )}
            </DetailSection>

            <DetailSection title="Contacto" icon="bi-person-lines-fill">
              <dl className="row mb-0">
                <Field label="Encargado">{warehouse.managerName}</Field>
                <Field label="Teléfono">
                  {warehouse.phone && <a href={`tel:${warehouse.phone}`}>{warehouse.phone}</a>}
                </Field>
                <Field label="Correo">
                  {warehouse.email && <a href={`mailto:${warehouse.email}`}>{warehouse.email}</a>}
                </Field>
              </dl>
            </DetailSection>
          </div>

          <div className="col-lg-4">
            <DetailSection title="Resumen" icon="bi-clipboard-data">
              <dl className="row mb-0">
                <Field label="Estado">{warehouse.isActive ? 'Activo' : 'Inactivo'}</Field>
                <Field label="Ubicaciones">{isLoadingLocations ? '--' : String(locationsTotal)}</Field>
                <Field label="Capacidad">
                  {warehouse.maxCapacity != null &&
                    `${toNumber(warehouse.maxCapacity).toLocaleString('es-MX')} ${warehouse.capacityUnit || 'unidades'}`}
                </Field>
                <Field label="Horario">{warehouse.operatingHours}</Field>
                <Field label="Creado">{formatDate(warehouse.createdAt, { withTime: true })}</Field>
                <Field label="Actualizado">{formatDate(warehouse.updatedAt, { withTime: true })}</Field>
              </dl>
            </DetailSection>
          </div>
        </div>
      ) : (
        <DetailSection
          title="Ubicaciones del almacén"
          icon="bi-geo-alt"
          bodyClassName="p-0"
          headerActions={
            <Link
              href={`/dashboard/inventory/locations/create?warehouseId=${warehouseId}`}
              className="btn btn-sm btn-primary"
            >
              <i className="bi bi-plus-lg me-1" />
              Nueva ubicación
            </Link>
          }
        >
          <LocationsTableSimple locations={locations} isLoading={isLoadingLocations} hideWarehouse />
        </DetailSection>
      )}

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
