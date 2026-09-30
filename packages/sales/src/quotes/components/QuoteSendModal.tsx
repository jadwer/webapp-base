'use client'

/**
 * Enviar cotizacion a destinatarios elegidos (peticion de Jasim, 2026-09-30).
 *
 * La cotizacion no siempre va solo a compras: segun el producto va a
 * laboratorio o inventarios de la empresa cliente. El modal lista el correo
 * principal, los adicionales y los de las personas de contacto con casillas,
 * y permite agregar correos en caliente (con opcion de guardarlos en el
 * contacto para la proxima vez).
 */

import React, { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Modal, EmailChipsInput, normalizeEmails, toast } from '@lwm/ui'
import { quoteService } from '../services'
import { useQuoteMutations } from '../hooks'
import type { Quote } from '../types'
import type { QuoteRecipientOption } from '../services'

const NO_OPTIONS: QuoteRecipientOption[] = []

interface QuoteSendModalProps {
  quote: Quote
  show: boolean
  onHide: () => void
  onSent?: () => void
}

/** Mensajes de un 422 de Laravel ({ errors: { campo: [msg] } }). */
function validationMessages(err: unknown): string[] {
  const data = (err as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string; error?: string } } })
    ?.response
  if (!data) return []
  if (data.data?.errors) return Object.values(data.data.errors).flat()
  const single = data.data?.error ?? data.data?.message
  return single ? [single] : []
}

export function QuoteSendModal({ quote, show, onHide, onSent }: QuoteSendModalProps) {
  const { send } = useQuoteMutations()
  const contactId = quote.contactId ?? quote.contact?.id
  const { data, isLoading } = useSWR(
    show && contactId ? ['quote-recipient-options', String(contactId)] : null,
    () => quoteService.getRecipientOptions(contactId as string | number),
    { revalidateOnFocus: false }
  )
  // Referencia estable: un [] nuevo en cada render disparaba el efecto de
  // apertura en ciclo infinito.
  const options = data ?? NO_OPTIONS

  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [extra, setExtra] = useState<string[]>([])
  const [saveToContact, setSaveToContact] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Al abrir: marcar el correo principal (o el primero disponible).
  useEffect(() => {
    if (!show) return
    const primary = options.find((o) => o.kind === 'primary') ?? options[0]
    setChecked(new Set(primary ? [primary.email] : []))
    setExtra([])
    setSaveToContact(false)
    setErrors([])
  }, [show, options])

  const recipients = useMemo(
    () => normalizeEmails([...options.filter((o) => checked.has(o.email)).map((o) => o.email), ...extra]),
    [options, checked, extra]
  )

  const toggle = (email: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })

  const handleSend = async () => {
    setErrors([])
    try {
      const result = await send.mutateAsync(quote.id, {
        recipients,
        saveToContact: saveToContact && extra.length > 0,
      })
      const meta = result.meta
      if (meta?.emailSent) {
        toast.success(`Cotización enviada a ${meta.recipients.join(', ')}`)
      } else {
        toast.warning(`La cotización quedó como enviada, pero no se mandó el correo: ${meta?.emailError ?? 'sin detalle'}`, {
          duration: 0,
        })
      }
      onSent?.()
      onHide()
    } catch (err) {
      const details = validationMessages(err)
      setErrors(details.length > 0 ? details : ['No se pudo enviar la cotización. Intenta de nuevo.'])
    }
  }

  const footer = (
    <div className="d-flex justify-content-between align-items-center w-100">
      <small className="text-muted">
        {recipients.length === 0 ? 'Sin destinatarios' : `${recipients.length} destinatario${recipients.length === 1 ? '' : 's'}`}
      </small>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-secondary" onClick={onHide} disabled={send.isPending}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSend}
          disabled={send.isPending || recipients.length === 0}
        >
          {send.isPending && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />}
          <i className="bi bi-envelope me-1" aria-hidden="true" />
          Enviar
        </button>
      </div>
    </div>
  )

  return (
    <Modal show={show} onHide={onHide} title={`Enviar cotización ${quote.quoteNumber}`} size="medium" footer={footer}>
      <p className="text-muted small mb-2">Elige a quién se envía el PDF de la cotización.</p>

      {isLoading ? (
        <div className="text-muted small py-2">Cargando correos del cliente...</div>
      ) : options.length === 0 ? (
        <div className="alert alert-light border small">
          El cliente no tiene correos registrados. Agrega al menos uno abajo.
        </div>
      ) : (
        <div className="list-group mb-3">
          {options.map((o) => (
            <label key={o.email} className="list-group-item d-flex align-items-center gap-2">
              <input
                type="checkbox"
                className="form-check-input m-0"
                checked={checked.has(o.email)}
                onChange={() => toggle(o.email)}
              />
              <span className="flex-grow-1">
                {o.email}
                <span className="d-block small text-muted">{o.label}</span>
              </span>
            </label>
          ))}
        </div>
      )}

      <EmailChipsInput
        id="quote-extra-recipients"
        label="Agregar otros correos"
        value={extra}
        onChange={setExtra}
        exclude={options.filter((o) => checked.has(o.email)).map((o) => o.email)}
        placeholder="calidad@cliente.com, almacen@cliente.com"
        helpText="Sepáralos con coma o punto y coma."
      />

      {extra.length > 0 && (
        <div className="form-check mt-2">
          <input
            id="quote-save-to-contact"
            type="checkbox"
            className="form-check-input"
            checked={saveToContact}
            onChange={(e) => setSaveToContact(e.target.checked)}
          />
          <label className="form-check-label small" htmlFor="quote-save-to-contact">
            Guardar estos correos en el cliente para la próxima vez
          </label>
        </div>
      )}

      {errors.length > 0 && (
        <div className="alert alert-danger small mt-3 mb-0" role="alert">
          <ul className="mb-0 ps-3">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}

export default QuoteSendModal
