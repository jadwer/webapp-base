/**
 * Genera una contrasena de 16 caracteres con al menos una mayuscula,
 * una minuscula, un digito y un simbolo, usando crypto.getRandomValues.
 */
export const generateSecurePassword = (length = 16): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*+-_=?'
  const all = upper + lower + digits + symbols

  const pick = (charset: string, count: number): string[] => {
    const values = new Uint32Array(count)
    crypto.getRandomValues(values)
    return Array.from(values, (v) => charset[v % charset.length])
  }

  const chars = [
    ...pick(upper, 1),
    ...pick(lower, 1),
    ...pick(digits, 1),
    ...pick(symbols, 1),
    ...pick(all, length - 4),
  ]

  const rand = new Uint32Array(chars.length)
  crypto.getRandomValues(rand)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
