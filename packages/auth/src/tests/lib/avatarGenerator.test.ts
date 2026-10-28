/**
 * Generador de avatares por partes (2026-10-28, port de D.17 de AtomoPlatform).
 */
import { describe, expect, it } from 'vitest'
import { DEFAULT_AVATAR, avatarDataUri, avatarSvg, parseRecipe, randomAvatar, serializeAvatar } from '../../lib/avatarGenerator'
import { avatarSrc } from '../../lib/avatar'

describe('avatarGenerator', () => {
  it('una receta va y vuelve igual por el campo avatar', () => {
    const recipe = { skin: 4, hair: 5, hairColor: 0, background: 2, clothes: 3, clothesColor: 1, accessory: 1 }
    const value = serializeAvatar(recipe)
    expect(value).toBe('avatar:1:4.5.0.2.3.1.1')
    expect(parseRecipe(value)).toEqual(recipe)
  })

  it('solo reconoce recetas; presets, fotos y basura dan null', () => {
    expect(parseRecipe('preset:3')).toBeNull()
    expect(parseRecipe('https://api/storage/avatars/1.jpg')).toBeNull()
    expect(parseRecipe('avatar:1:2.1.1')).toBeNull()
    expect(parseRecipe(null)).toBeNull()
  })

  it('indices fuera de rango caen a la primera opcion', () => {
    expect(parseRecipe('avatar:1:99.1.1.1.1.1.1')).toEqual({ skin: 0, hair: 1, hairColor: 1, background: 1, clothes: 1, clothesColor: 1, accessory: 1 })
  })

  it('el SVG es autonomo y el alt se escapa', () => {
    expect(avatarSvg(DEFAULT_AVATAR, 'Ana <López>')).toContain('aria-label="Ana López"')
    expect(avatarSvg(DEFAULT_AVATAR)).toContain('aria-hidden="true"')
    expect(avatarDataUri(DEFAULT_AVATAR).startsWith('data:image/svg+xml;charset=utf-8,%3Csvg')).toBe(true)
  })

  it('avatarSrc dibuja la receta y no muestra recetas invalidas como URL', () => {
    expect(avatarSrc('avatar:1:2.1.1.0.0.0.0')?.startsWith('data:image/svg+xml')).toBe(true)
    expect(avatarSrc('avatar:9:x')).toBeNull()
    const random = randomAvatar(() => 0.999)
    expect(parseRecipe(serializeAvatar(random))).toEqual(random)
  })
})
