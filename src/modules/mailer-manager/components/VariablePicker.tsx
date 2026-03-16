'use client'

import { useState } from 'react'

interface VariablePickerProps {
  variables: Record<string, string>
  onInsert: (variable: string) => void
}

export default function VariablePicker({ variables, onInsert }: VariablePickerProps) {
  const [search, setSearch] = useState('')

  const entries = Object.entries(variables)
  const filtered = search
    ? entries.filter(([key, desc]) =>
        key.toLowerCase().includes(search.toLowerCase()) ||
        desc.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  return (
    <div className="card">
      <div className="card-header py-2">
        <h6 className="mb-0">
          <i className="bi bi-braces me-2"></i>
          Variables Disponibles
        </h6>
      </div>
      <div className="card-body p-2">
        <input
          type="text"
          className="form-control form-control-sm mb-2"
          placeholder="Buscar variable..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <p className="text-muted small text-center py-2 mb-0">No hay variables</p>
          ) : (
            <div className="list-group list-group-flush">
              {filtered.map(([key, description]) => (
                <button
                  key={key}
                  type="button"
                  className="list-group-item list-group-item-action py-1 px-2"
                  onClick={() => onInsert(`{{${key}}}`)}
                  title={`Insertar {{${key}}}`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <code className="small text-primary">{`{{${key}}}`}</code>
                    <i className="bi bi-plus-circle text-muted small"></i>
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{description}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 border-top pt-2">
          <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
            <strong>Formatos:</strong> {`{{var|currency}}`} {`{{var|date}}`} {`{{var|number}}`}
          </small>
          <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
            <strong>Condicional:</strong> {`{{#if var}}...{{/if}}`}
          </small>
          <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
            <strong>Loop:</strong> {`{{#each items}}...{{/each}}`}
          </small>
        </div>
      </div>
    </div>
  )
}
