/**
 * Telefonos de contacto (2026-09-30, peticion de Jasim). Espejo de
 * Modules/Contacts/app/Support/ContactChannels.php: mismas reglas y mismos
 * mensajes que el backend.
 */

import type { ContactPhone } from '../types'

export const DEFAULT_COUNTRY_CODE = '52'
export const MX_NUMBER_DIGITS = 10
export const MAX_NUMBER_DIGITS = 12
export const MAX_EXT_DIGITS = 10

export const digitsOnly = (value: string | null | undefined): string => (value ?? '').replace(/\D+/g, '')

/** Maximo de digitos del numero segun la lada. */
export const maxDigitsFor = (code: string | null | undefined): number =>
  (digitsOnly(code) || DEFAULT_COUNTRY_CODE) === DEFAULT_COUNTRY_CODE ? MX_NUMBER_DIGITS : MAX_NUMBER_DIGITS

export const emptyPhone = (): ContactPhone => ({ label: '', code: DEFAULT_COUNTRY_CODE, number: '', ext: '' })

export function phoneError(phone: ContactPhone): string | null {
  const code = digitsOnly(phone.code) || DEFAULT_COUNTRY_CODE
  const number = digitsOnly(phone.number)
  const ext = digitsOnly(phone.ext)
  if (code.length > 4) return `La lada +${code} no es valida (maximo 4 digitos).`
  if (number === '') return 'El numero de telefono es obligatorio.'
  if (code === DEFAULT_COUNTRY_CODE && number.length !== MX_NUMBER_DIGITS) {
    return `El telefono debe tener exactamente 10 digitos (lleva ${number.length}).`
  }
  if (number.length > MAX_NUMBER_DIGITS) return 'El telefono no puede tener mas de 12 digitos.'
  if (ext.length > MAX_EXT_DIGITS) return 'La extension no puede tener mas de 10 digitos.'
  return null
}

/**
 * Interpreta un telefono pegado como texto libre:
 * "+52 55 1666 6344 ext 2213" -> { code: '52', number: '5516666344', ext: '2213' }.
 */
export function parsePhoneText(text: string): Pick<ContactPhone, 'code' | 'number' | 'ext'> {
  let rest = text
  let ext = ''
  const extMatch = rest.match(/(?:ext(?:ension|ensión)?\.?|x)\s*[:#]?\s*(\d{1,10})\s*$/i)
  if (extMatch) {
    ext = extMatch[1]
    rest = rest.slice(0, extMatch.index)
  }
  let digits = digitsOnly(rest)
  let code = DEFAULT_COUNTRY_CODE
  if (/^\s*\+/.test(rest)) {
    if (digits.startsWith('52') && digits.length >= 12) {
      digits = digits.slice(digits.startsWith('521') && digits.length === 13 ? 3 : 2)
    } else if (digits.length > MX_NUMBER_DIGITS) {
      const codeLen = digits.length - MX_NUMBER_DIGITS
      code = digits.slice(0, Math.min(codeLen, 4))
      digits = digits.slice(code.length)
    }
  } else if (digits.length === 12 && digits.startsWith('52')) {
    digits = digits.slice(2)
  }
  return { code, number: digits.slice(0, MAX_NUMBER_DIGITS), ext }
}

/** Limpia la lista antes de enviarla: quita filas vacias. */
export function cleanPhones(phones: ContactPhone[]): ContactPhone[] {
  return phones
    .map((p) => ({
      label: p.label?.trim() || null,
      code: digitsOnly(p.code) || DEFAULT_COUNTRY_CODE,
      number: digitsOnly(p.number),
      ext: digitsOnly(p.ext) || null,
    }))
    .filter((p) => p.number !== '')
}

export const formatPhone = (p: ContactPhone): string =>
  `+${p.code || DEFAULT_COUNTRY_CODE} ${p.number}${p.ext ? ` ext. ${p.ext}` : ''}`

/** Lista para mostrar: la estructurada o, si no hay, el telefono legado. */
export function phonesForDisplay(contact: { phones?: ContactPhone[]; phone?: string; phoneExtension?: string }): string[] {
  if (contact.phones && contact.phones.length > 0) {
    return contact.phones.map((p) => `${p.label ? `${p.label}: ` : ''}${formatPhone(p)}`)
  }
  if (contact.phone) return [`${contact.phone}${contact.phoneExtension ? ` ext. ${contact.phoneExtension}` : ''}`]
  return []
}
