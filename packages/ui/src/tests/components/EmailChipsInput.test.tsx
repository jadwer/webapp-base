import { describe, it, expect, vi } from 'vitest'
import React, { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmailChipsInput } from '../../components/base/EmailChipsInput'
import { singleEmailError, splitEmails, normalizeEmails } from '../../utils/emails'

describe('reglas de correo', () => {
  it('el principal acepta un solo correo', () => {
    expect(singleEmailError('compras@lab.mx')).toBeNull()
    expect(singleEmailError('')).toBeNull()
    for (const v of ['a@lab.mx, b@lab.mx', 'a@lab.mx;b@lab.mx', 'a@lab.mx b@lab.mx', 'a@lab@lab.mx']) {
      expect(singleEmailError(v)).toMatch(/un solo correo principal/)
    }
    expect(singleEmailError('sin-arroba.mx')).toMatch(/un solo correo principal/)
    expect(singleEmailError('a@lab')).toMatch(/formato/)
  })

  it('parte y normaliza listas', () => {
    expect(splitEmails('A@lab.mx, b@lab.mx;c@lab.mx\n d@lab.mx')).toEqual(['a@lab.mx', 'b@lab.mx', 'c@lab.mx', 'd@lab.mx'])
    expect(normalizeEmails(['A@lab.mx', 'a@lab.mx', 'p@lab.mx'], ['P@lab.mx'])).toEqual(['a@lab.mx'])
  })
})

function Harness({ exclude = [] as string[], onValue = vi.fn() }) {
  const [value, setValue] = useState<string[]>([])
  return <EmailChipsInput id="extra" value={value} exclude={exclude} onChange={(v) => { setValue(v); onValue(v) }} />
}

describe('EmailChipsInput', () => {
  it('convierte en etiquetas lo pegado con comas y punto y coma', () => {
    const onValue = vi.fn()
    render(<Harness onValue={onValue} exclude={['compras@lab.mx']} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Lab@lab.mx; inv@lab.mx, compras@lab.mx,' } })
    expect(onValue).toHaveBeenLastCalledWith(['lab@lab.mx', 'inv@lab.mx'])
    expect(screen.getByText('lab@lab.mx')).toBeInTheDocument()
  })

  it('deja el invalido en el campo con error en rojo', () => {
    render(<Harness />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'ok@lab.mx malo@' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('ok@lab.mx')).toBeInTheDocument()
    expect(screen.getByText(/Correo no valido: malo@/)).toBeInTheDocument()
    expect((input as HTMLInputElement).value).toBe('malo@')
  })

  it('quita una etiqueta', () => {
    render(<Harness />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a@lab.mx,' } })
    fireEvent.click(screen.getByLabelText('Quitar a@lab.mx'))
    expect(screen.queryByText('a@lab.mx')).not.toBeInTheDocument()
  })
})
