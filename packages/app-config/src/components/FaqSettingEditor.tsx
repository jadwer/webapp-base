'use client'

/**
 * FAQ SETTING EDITOR
 *
 * Editor visual del setting `landing.faq` (tipo json en app-config): lista de
 * pregunta/respuesta con agregar, quitar y reordenar. Serializa el JSON por
 * detras; el usuario nunca lo ve. Un JSON invalido a mano dejaba al home
 * caer al fallback sin avisar; este editor lo hace imposible por construccion
 * (regla 7: dato que el sistema aporta no puede fallar).
 */

import React, { useEffect, useMemo, useState } from 'react'

export interface FaqEntry {
  question: string
  answer: string
}

export function parseFaqValue(raw: unknown): FaqEntry[] {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(value)) return []
    return value
      .filter((i) => i && typeof i.question === 'string' && typeof i.answer === 'string')
      .map((i) => ({ question: i.question, answer: i.answer }))
  } catch {
    return []
  }
}

interface FaqSettingEditorProps {
  value: unknown
  saving?: boolean
  onSave: (items: FaqEntry[]) => Promise<void> | void
}

export const FaqSettingEditor: React.FC<FaqSettingEditorProps> = ({ value, saving = false, onSave }) => {
  const initial = useMemo(() => parseFaqValue(value), [value])
  const [items, setItems] = useState<FaqEntry[]>(initial)
  const [dirty, setDirty] = useState(false)

  // Si el valor externo cambia (recarga), resincronizar salvo que haya edicion en curso
  useEffect(() => {
    if (!dirty) setItems(initial)
  }, [initial, dirty])

  const update = (idx: number, patch: Partial<FaqEntry>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
    setDirty(true)
  }
  const remove = (idx: number) => { setItems((prev) => prev.filter((_, i) => i !== idx)); setDirty(true) }
  const add = () => { setItems((prev) => [...prev, { question: '', answer: '' }]); setDirty(true) }
  const move = (idx: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev]
      const j = idx + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
    setDirty(true)
  }

  const cleaned = items
    .map((i) => ({ question: i.question.trim(), answer: i.answer.trim() }))
    .filter((i) => i.question && i.answer)
  const incomplete = items.length - cleaned.length

  const handleSave = async () => {
    await onSave(cleaned)
    setItems(cleaned)
    setDirty(false)
  }

  const handleReset = () => { setItems(initial); setDirty(false) }

  return (
    <div className="border rounded p-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <strong>Preguntas frecuentes del home</strong>
          <div className="text-muted small">Se muestran en el orden de esta lista. Las incompletas no se guardan.</div>
        </div>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={add} disabled={saving}>
          <i className="bi bi-plus-lg me-1" />Agregar pregunta
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-muted small py-2">
          Sin preguntas. El home mostrara las 5 preguntas predeterminadas.
        </div>
      )}

      <ol className="list-unstyled mb-2">
        {items.map((it, idx) => (
          <li key={idx} className="bg-white border rounded p-2 mb-2">
            <div className="d-flex gap-2 align-items-start">
              <span className="badge bg-secondary mt-1">{idx + 1}</span>
              <div className="flex-grow-1">
                <input
                  type="text"
                  className="form-control form-control-sm mb-1"
                  placeholder="Pregunta"
                  value={it.question}
                  onChange={(e) => update(idx, { question: e.target.value })}
                  disabled={saving}
                />
                <textarea
                  className="form-control form-control-sm"
                  placeholder="Respuesta"
                  rows={2}
                  value={it.answer}
                  onChange={(e) => update(idx, { answer: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="d-flex flex-column gap-1">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => move(idx, -1)} disabled={saving || idx === 0} aria-label="Subir">
                  <i className="bi bi-arrow-up" />
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => move(idx, 1)} disabled={saving || idx === items.length - 1} aria-label="Bajar">
                  <i className="bi bi-arrow-down" />
                </button>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(idx)} disabled={saving} aria-label="Quitar">
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="d-flex align-items-center gap-2">
        <button type="button" className="btn btn-sm btn-success" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check me-1" />}
          Guardar preguntas
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleReset} disabled={saving || !dirty}>
          Descartar cambios
        </button>
        {incomplete > 0 && (
          <span className="text-warning small ms-2">
            <i className="bi bi-exclamation-triangle me-1" />
            {incomplete} pregunta{incomplete > 1 ? 's' : ''} incompleta{incomplete > 1 ? 's' : ''} (se omitira{incomplete > 1 ? 'n' : ''} al guardar)
          </span>
        )}
      </div>
    </div>
  )
}

export default FaqSettingEditor
