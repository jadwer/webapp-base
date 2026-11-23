import { describe, it, expect } from 'vitest'
import { safeRedirect, withRedirect } from '../../lib/redirect'

describe('pagina de destino tras iniciar sesion o registrarse (BUG-03)', () => {
  it('acepta solo rutas internas', () => {
    expect(safeRedirect('/cart?action=quote')).toBe('/cart?action=quote')
    expect(safeRedirect(null)).toBe('/dashboard')
    expect(safeRedirect('https://malo.test/x')).toBe('/dashboard')
    expect(safeRedirect('//malo.test/x')).toBe('/dashboard')
    expect(safeRedirect('/\\malo.test')).toBe('/dashboard')
    expect(safeRedirect('javascript:alert(1)')).toBe('/dashboard')
  })

  it('lleva el destino entre el inicio de sesion y el registro', () => {
    expect(withRedirect('/auth/register', '/cart?action=quote')).toBe('/auth/register?redirect=%2Fcart%3Faction%3Dquote')
    expect(withRedirect('/auth/login?registered=true', '/cart')).toBe('/auth/login?registered=true&redirect=%2Fcart')
    expect(withRedirect('/auth/register', '/dashboard')).toBe('/auth/register')
    expect(withRedirect('/auth/register', 'https://malo.test')).toBe('/auth/register')
  })
})
