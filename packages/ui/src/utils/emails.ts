/**
 * Reglas de correo compartidas (2026-09-30, peticion de Jasim). Espejo de
 * Modules/Contacts/app/Support/ContactChannels.php en el backend: mismo
 * criterio y mismos mensajes, para que el usuario vea el error en el campo
 * y no hasta el 422.
 */

const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/

/** Mensaje si el valor no es UN solo correo valido; null si es valido o vacio. */
export function singleEmailError(value: string | null | undefined, field = 'correo principal'): string | null {
  const v = (value ?? '').trim()
  if (v === '') return null
  if (/[\s,;]/.test(v) || (v.match(/@/g) ?? []).length !== 1) {
    return `Captura un solo ${field} (sin espacios, comas, punto y coma ni una segunda @).`
  }
  if (!EMAIL_RE.test(v)) return `El correo "${v}" no tiene un formato valido.`
  return null
}

/** Parte un texto pegado o tecleado en correos (coma, punto y coma, espacios o saltos). */
export function splitEmails(text: string): string[] {
  return text
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** Minusculas, sin duplicados y sin los excluidos (por ejemplo el principal). */
export function normalizeEmails(emails: string[], exclude: string[] = []): string[] {
  const skip = new Set(exclude.map((e) => e.trim().toLowerCase()).filter(Boolean))
  const out: string[] = []
  for (const raw of emails) {
    const e = raw.trim().toLowerCase()
    if (e && !skip.has(e) && !out.includes(e)) out.push(e)
  }
  return out
}
