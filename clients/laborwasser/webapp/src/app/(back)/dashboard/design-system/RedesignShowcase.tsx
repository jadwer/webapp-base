'use client'

import React, { useState } from 'react'
import {
  LwSurface,
  LwPageTitle,
  LwKpiCard,
  LwStatusPill,
  LwCountPill,
  LwTableWrap,
  LwIconButton,
  LwActionMenu,
  LwPagination,
  LwResultModal,
  type LwTone,
} from '@lwm/ui'

const TONES: Array<{ tone: LwTone; label: string; uso: string }> = [
  { tone: 'neutral', label: 'Borrador', uso: 'Sin actividad todavía' },
  { tone: 'info', label: 'Enviada', uso: 'En espera del cliente' },
  { tone: 'success', label: 'Aceptada', uso: 'Avanzó bien' },
  { tone: 'warning', label: 'Por vencer', uso: 'Requiere atención' },
  { tone: 'danger', label: 'Vencida', uso: 'Rechazada, vencida o cancelada' },
  { tone: 'navy', label: 'Convertida', uso: 'Cerrada en otro documento' },
]

/**
 * Componentes Lw* del rediseño 2026-11 (Figma "Rediseño Labor wasser"), en
 * `@lwm/ui`. Los usa Cotizaciones; los demás módulos los adoptan al rediseñarse.
 */
export function RedesignShowcase() {
  const [page, setPage] = useState(2)
  const [perPage, setPerPage] = useState(20)
  const [modal, setModal] = useState<null | 'success' | 'warning' | 'danger'>(null)

  return (
    <div className="row mb-5" id="rediseno-2026">
      <div className="col-12">
        <h2 className="mb-2">Rediseño 2026 (componentes Lw*)</h2>
        <p className="text-muted mb-4">
          Piel nueva del panel según el Figma. Se importan de <code>@lwm/ui</code> y toman los colores de la marca
          (<code>--brand-*</code>). Ya la usan Cotizaciones y el portal del cliente; los demás módulos la adoptan al
          rediseñarse. Las pantallas anteriores siguen con los componentes de abajo.
        </p>

        <LwSurface>
          <LwPageTitle
            title="Cotizaciones"
            highlight="de venta"
            subtitle="LwSurface + LwPageTitle: superficie de la página y título con resaltado y acciones."
            actions={<button className="btn btn-primary" type="button">Nueva cotización</button>}
          />

          <h5 className="mt-4 mb-3">LwKpiCard</h5>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3"><LwKpiCard label="Total" value="128" icon="bi-file-earmark-text" /></div>
            <div className="col-6 col-lg-3"><LwKpiCard label="Por atender" value="14" icon="bi-hourglass-split" hint="Borrador o enviadas" /></div>
            <div className="col-6 col-lg-3"><LwKpiCard label="Aceptadas por convertir" value="5" icon="bi-check2-circle" highlight /></div>
            <div className="col-6 col-lg-3"><LwKpiCard label="Cargando" value="" isLoading /></div>
          </div>

          <h5 className="mb-3">LwStatusPill y LwCountPill</h5>
          <div className="d-flex flex-wrap gap-3 mb-2">
            {TONES.map((t) => (
              <div key={t.tone} className="text-center">
                <LwStatusPill tone={t.tone}>{t.label}</LwStatusPill>
                <div className="small text-muted mt-1"><code>{t.tone}</code>: {t.uso}</div>
              </div>
            ))}
          </div>
          <p className="mb-4">Partidas: <LwCountPill title="3 partidas">3</LwCountPill></p>

          <h5 className="mb-3">LwTableWrap, LwIconButton y LwActionMenu</h5>
          <LwTableWrap>
            <table className="table mb-0 align-middle">
              <thead>
                <tr><th>Folio</th><th>Cliente</th><th>Vendedor</th><th>Estado</th><th className="text-end">Acciones</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>COT-26000077</td>
                  <td>Farmabiot SA</td>
                  <td>Ana López</td>
                  <td><LwStatusPill tone="info">Enviada</LwStatusPill></td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-1">
                      <LwIconButton icon="bi-eye" label="Ver" />
                      <LwIconButton icon="bi-pencil" label="Editar" />
                      <LwActionMenu
                        items={[
                          { key: 'accept', label: 'Marcar aceptada', icon: 'bi-check2' },
                          { key: 'pdf', label: 'Descargar PDF', icon: 'bi-file-earmark-pdf' },
                          { key: 'delete', label: 'Eliminar', icon: 'bi-trash', danger: true, disabled: true, hint: 'Solo un borrador se elimina; lo enviado se cancela' },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </LwTableWrap>
          <p className="small text-muted mt-2 mb-4">
            Lo que no aplica no se esconde: sale deshabilitado con el motivo (<code>hint</code>).
          </p>

          <h5 className="mb-3">LwPagination</h5>
          <LwPagination page={page} lastPage={7} perPage={perPage} total={128} onPage={setPage} onPerPage={setPerPage} />

          <h5 className="mt-4 mb-3">LwResultModal</h5>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-success" onClick={() => setModal('success')}>Éxito</button>
            <button type="button" className="btn btn-outline-warning" onClick={() => setModal('warning')}>Advertencia</button>
            <button type="button" className="btn btn-outline-danger" onClick={() => setModal('danger')}>Confirmar algo destructivo</button>
          </div>
          <LwResultModal
            open={modal !== null}
            tone={modal ?? 'success'}
            title={modal === 'danger' ? '¿Cancelar la cotización?' : modal === 'warning' ? 'Revisa antes de seguir' : 'Cotización enviada'}
            message={modal === 'danger' ? 'Esta acción no se puede deshacer.' : 'Así se ve el resultado de una operación.'}
            cancelLabel={modal === 'danger' ? 'Regresar' : undefined}
            onCancel={() => setModal(null)}
            onConfirm={() => setModal(null)}
          />

          <pre className="bg-light p-3 rounded mt-4 mb-0">
            <code>{`import { LwSurface, LwPageTitle, LwKpiCard, LwStatusPill, LwActionMenu, LwPagination } from '@lwm/ui'`}</code>
          </pre>
        </LwSurface>
      </div>
    </div>
  )
}
