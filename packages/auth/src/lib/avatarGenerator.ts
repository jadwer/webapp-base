/**
 * Generador de avatares por partes (2026-10-28), copiado de D.17 de
 * AtomoPlatform (@atomo/core avatar) para que la receta sea la misma en los
 * dos lados: `avatar:1:<piel>.<peinado>.<pelo>.<fondo>.<ropa>.<color>.<accesorio>`.
 * Los `preset:N` de LWM siguen siendo los SVG de /images/avatars (lib/avatar).
 * El dibujo corre en el navegador, sin red; el backend solo valida la receta.
 */

export interface AvatarRecipe {
  skin: number
  hair: number
  hairColor: number
  background: number
  clothes: number
  clothesColor: number
  accessory: number
}

export interface AvatarOption {
  label: string
  color?: string
}

export const AVATAR_PARTS = {
  skin: [
    { label: 'Muy clara', color: '#f9dccb' },
    { label: 'Clara', color: '#f1c3a2' },
    { label: 'Media', color: '#d9a27b' },
    { label: 'Morena clara', color: '#b97b55' },
    { label: 'Morena', color: '#8d5a3b' },
    { label: 'Oscura', color: '#5c3a24' },
  ],
  hair: [
    { label: 'Sin pelo' },
    { label: 'Corto' },
    { label: 'Bob' },
    { label: 'Largo' },
    { label: 'Chongo' },
    { label: 'Rizado' },
    { label: 'De lado' },
    { label: 'Rapado' },
  ],
  hairColor: [
    { label: 'Negro', color: '#1f1a17' },
    { label: 'Castaño oscuro', color: '#4a2e1f' },
    { label: 'Castaño', color: '#7b4a2a' },
    { label: 'Rubio oscuro', color: '#b07a3c' },
    { label: 'Rubio', color: '#dcb57a' },
    { label: 'Canoso', color: '#a8adb5' },
  ],
  background: [
    { label: 'Azul', color: '#dbe4ff' },
    { label: 'Verde', color: '#d3f5e1' },
    { label: 'Amarillo', color: '#fdefc3' },
    { label: 'Rosa', color: '#fde0e6' },
    { label: 'Cielo', color: '#d6eefc' },
    { label: 'Lila', color: '#ece3fd' },
    { label: 'Gris', color: '#e4e7eb' },
    { label: 'Durazno', color: '#fde4d3' },
  ],
  clothes: [{ label: 'Cuello redondo' }, { label: 'Cuello en V' }, { label: 'Camisa' }, { label: 'Sudadera' }],
  clothesColor: [
    { label: 'Marino', color: '#243447' },
    { label: 'Verde', color: '#047857' },
    { label: 'Ámbar', color: '#b45309' },
    { label: 'Violeta', color: '#6d28d9' },
    { label: 'Vino', color: '#9f1239' },
    { label: 'Gris', color: '#374151' },
  ],
  accessory: [{ label: 'Ninguno' }, { label: 'Lentes redondos' }, { label: 'Lentes cuadrados' }, { label: 'Aretes' }, { label: 'Diadema' }],
} satisfies Record<keyof AvatarRecipe, AvatarOption[]>

const ORDER: Array<keyof AvatarRecipe> = ['skin', 'hair', 'hairColor', 'background', 'clothes', 'clothesColor', 'accessory']

export const DEFAULT_AVATAR: AvatarRecipe = { skin: 2, hair: 1, hairColor: 1, background: 0, clothes: 0, clothesColor: 0, accessory: 0 }

const clamp = (n: number, max: number) => (Number.isInteger(n) && n >= 0 && n < max ? n : 0)

/** Receta valida: cada indice dentro de su lista (lo de fuera cae a la primera opcion). */
export function normalizeRecipe(recipe: Partial<AvatarRecipe>): AvatarRecipe {
  return Object.fromEntries(ORDER.map((k) => [k, clamp(Number(recipe[k] ?? 0), AVATAR_PARTS[k].length)])) as unknown as AvatarRecipe
}

export function serializeAvatar(recipe: AvatarRecipe): string {
  const r = normalizeRecipe(recipe)
  return `avatar:1:${ORDER.map((k) => r[k]).join('.')}`
}

const RECIPE = /^avatar:1:(\d{1,2}(?:\.\d{1,2}){6})$/

/** La receta de un valor `avatar:1:...`; null si es preset, foto o vacio. */
export function parseRecipe(value: string | null | undefined): AvatarRecipe | null {
  const m = RECIPE.exec((value ?? '').trim())
  if (!m) return null
  const parts = m[1].split('.').map(Number)
  return normalizeRecipe(Object.fromEntries(ORDER.map((k, i) => [k, parts[i]])))
}

/** Una receta al azar (boton "Sorpréndeme"). */
export function randomAvatar(random: () => number = Math.random): AvatarRecipe {
  return Object.fromEntries(ORDER.map((k) => [k, Math.floor(random() * AVATAR_PARTS[k].length)])) as unknown as AvatarRecipe
}

const INK = '#1f2933'

function hairShapes(style: number, color: string): { back: string; front: string } {
  const p = (d: string) => `<path d="${d}" fill="${color}"/>`
  switch (style) {
    case 1:
      return { back: '', front: p('M37 50C36 30 48 22 60 22C73 22 85 30 83 50C79 40 71 34 60 34C49 34 41 40 37 50Z') }
    case 2:
      return { back: '', front: p('M33 74C31 52 32 26 60 19C88 26 89 52 87 74C85 79 79 79 79 74L79 46C71 37 49 37 41 46L41 74C41 79 35 79 33 74Z') }
    case 3:
      return {
        back: p('M32 98C27 70 30 30 60 19C90 30 93 70 88 98L78 98L78 50L42 50L42 98Z'),
        front: p('M37 52C36 32 47 22 60 22C73 22 84 32 83 52C78 41 70 35 60 35C50 35 42 41 37 52Z'),
      }
    case 4:
      return { back: `<circle cx="60" cy="17" r="10" fill="${color}"/>`, front: p('M37 50C36 31 47 23 60 23C73 23 84 31 83 50C79 41 71 35 60 35C49 35 41 41 37 50Z') }
    case 5:
      return {
        back: '',
        front: [[39, 44, 9], [44, 33, 9], [54, 26, 9], [66, 26, 9], [76, 33, 9], [81, 44, 9], [60, 30, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join(''),
      }
    case 6:
      return { back: '', front: p('M37 53C34 29 49 20 62 21C76 22 86 32 83 52C80 41 71 32 53 36C45 38 40 44 37 53Z') }
    case 7:
      return { back: '', front: `<path d="M38 46C40 31 50 25 60 25C70 25 80 31 82 46C76 39 68 36 60 36C52 36 44 39 38 46Z" fill="${color}" opacity="0.85"/>` }
    default:
      return { back: '', front: '' }
  }
}

/** La ropa: `behind` va antes del cuello (la capucha), `front` despues. */
function clothesShapes(style: number, color: string, skin: string): { behind: string; front: string } {
  const bust = `<path d="M16 120C16 97 35 86 60 86C85 86 104 97 104 120Z" fill="${color}"/>`
  switch (style) {
    case 1:
      return { behind: '', front: `${bust}<path d="M51 86L60 101L69 86Z" fill="${skin}"/>` }
    case 2:
      return { behind: '', front: `${bust}<path d="M48 85L58 98L60 88Z" fill="#ffffff"/><path d="M72 85L62 98L60 88Z" fill="#ffffff"/>` }
    case 3:
      return {
        behind: `<path d="M40 92C38 78 48 72 60 72C72 72 82 78 80 92Z" fill="${color}"/><path d="M40 92C38 78 48 72 60 72C72 72 82 78 80 92Z" fill="#000000" fill-opacity="0.18"/>`,
        front: `${bust}<path d="M50 86Q60 95 70 86Z" fill="#000000" fill-opacity="0.18"/><path d="M55 90L54 103M65 90L66 103" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>`,
      }
    default:
      return { behind: '', front: `${bust}<path d="M50 86Q60 96 70 86Z" fill="${skin}"/>` }
  }
}

function accessoryShapes(style: number): string {
  switch (style) {
    case 1:
      return `<g fill="none" stroke="${INK}" stroke-width="2"><circle cx="51" cy="52" r="6"/><circle cx="69" cy="52" r="6"/><path d="M57 52H63"/></g>`
    case 2:
      return `<g fill="none" stroke="${INK}" stroke-width="2"><rect x="44.5" y="47" width="13" height="10" rx="2"/><rect x="62.5" y="47" width="13" height="10" rx="2"/><path d="M57.5 52H62.5"/></g>`
    case 3:
      return '<circle cx="38" cy="61" r="2.6" fill="#e3a21a"/><circle cx="82" cy="61" r="2.6" fill="#e3a21a"/>'
    case 4:
      return '<path d="M38 41C46 30 74 30 82 41" fill="none" stroke="#be123c" stroke-width="4" stroke-linecap="round"/>'
    default:
      return ''
  }
}

/**
 * El SVG de una receta (120 x 120, recorte circular). `title` es el texto
 * alternativo; sin el, decorativo.
 */
export function avatarSvg(input: AvatarRecipe, title?: string): string {
  const r = normalizeRecipe(input)
  const skin = AVATAR_PARTS.skin[r.skin]!.color
  const hairColor = AVATAR_PARTS.hairColor[r.hairColor]!.color
  const hair = hairShapes(r.hair, hairColor)
  const clothes = clothesShapes(r.clothes, AVATAR_PARTS.clothesColor[r.clothesColor]!.color, skin)
  const label = title ? `role="img" aria-label="${title.replace(/[<>&"]/g, '')}"` : 'aria-hidden="true"'
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" ${label}>`,
    '<defs><clipPath id="lwm-avatar-clip"><circle cx="60" cy="60" r="60"/></clipPath></defs>',
    '<g clip-path="url(#lwm-avatar-clip)">',
    `<rect width="120" height="120" fill="${AVATAR_PARTS.background[r.background]!.color}"/>`,
    hair.back,
    clothes.behind,
    `<rect x="52" y="68" width="16" height="20" rx="6" fill="${skin}"/>`,
    clothes.front,
    `<circle cx="38" cy="53" r="5" fill="${skin}"/><circle cx="82" cy="53" r="5" fill="${skin}"/>`,
    `<ellipse cx="60" cy="50" rx="22" ry="26" fill="${skin}"/>`,
    `<circle cx="51" cy="52" r="2.4" fill="${INK}"/><circle cx="69" cy="52" r="2.4" fill="${INK}"/>`,
    '<path d="M53 63Q60 69 67 63" fill="none" stroke="#7a3e2b" stroke-width="2" stroke-linecap="round"/>',
    hair.front,
    accessoryShapes(r.accessory),
    '</g></svg>',
  ].join('')
}

/** El SVG como `src` de una imagen (correo, `<img>`, favicon). */
export function avatarDataUri(recipe: AvatarRecipe, title?: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg(recipe, title))}`
}
