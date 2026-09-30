import { describe, it, expect } from 'vitest'
import { cleanPhones, maxDigitsFor, parsePhoneText, phoneError, phonesForDisplay } from '../../utils/phones'

describe('reglas de telefono (espejo del backend)', () => {
  it('con +52 exige exactamente 10 digitos', () => {
    expect(phoneError({ code: '52', number: '5516666344' })).toBeNull()
    expect(phoneError({ code: '52', number: '33553445' })).toMatch(/10 digitos/)
    expect(maxDigitsFor('52')).toBe(10)
  })

  it('con otra lada permite hasta 12', () => {
    expect(phoneError({ code: '1', number: '2025550143' })).toBeNull()
    expect(phoneError({ code: '1', number: '1234567890123' })).toMatch(/12 digitos/)
    expect(maxDigitsFor('34')).toBe(12)
  })

  it('interpreta un telefono pegado con lada y extension', () => {
    expect(parsePhoneText('+52 55 1666-6344 ext 2213')).toEqual({ code: '52', number: '5516666344', ext: '2213' })
    expect(parsePhoneText('(33) 5534 4512')).toEqual({ code: '52', number: '3355344512', ext: '' })
    expect(parsePhoneText('+1 202 555 0143')).toEqual({ code: '1', number: '2025550143', ext: '' })
  })

  it('limpia simbolos y quita filas vacias', () => {
    expect(cleanPhones([
      { label: ' Matriz ', code: '+52', number: '55-1666-6344', ext: 'ext 2213' },
      { label: '', code: '52', number: '', ext: '' },
    ])).toEqual([{ label: 'Matriz', code: '52', number: '5516666344', ext: '2213' }])
  })

  it('muestra la lista o el telefono legado', () => {
    expect(phonesForDisplay({ phones: [{ label: 'Matriz', code: '52', number: '5516666344', ext: '2213' }] }))
      .toEqual(['Matriz: +52 5516666344 ext. 2213'])
    expect(phonesForDisplay({ phone: '555-1234', phoneExtension: '9' })).toEqual(['555-1234 ext. 9'])
  })
})
