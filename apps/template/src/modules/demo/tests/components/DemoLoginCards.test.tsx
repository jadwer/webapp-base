import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const demoMode = vi.fn()
vi.mock('../../hooks/useDemoMode', () => ({ useDemoMode: () => demoMode() }))

let params = new URLSearchParams()
vi.mock('next/navigation', () => ({ useSearchParams: () => params }))

import { DemoLoginCards } from '../../components/DemoLoginCards'

function LoginFormStub() {
  return (
    <form>
      <input id="email" />
      <input id="password" />
    </form>
  )
}

describe('DemoLoginCards', () => {
  beforeEach(() => {
    params = new URLSearchParams()
    demoMode.mockReturnValue({ isDemo: true })
  })

  it('no renderiza fuera de modo demo', () => {
    demoMode.mockReturnValue({ isDemo: false })
    const { container } = render(<DemoLoginCards />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra los tres perfiles y llena el acceso al elegir uno', () => {
    render(<><DemoLoginCards /><LoginFormStub /></>)
    expect(screen.getAllByRole('button')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Entrar como Cliente' }))
    expect((document.getElementById('email') as HTMLInputElement).value).toBe('cliente@demo.mx')
    expect((document.getElementById('password') as HTMLInputElement).value).toBe('Demo2026!')
  })

  it('preselecciona el perfil que llega en ?perfil=', async () => {
    params = new URLSearchParams('perfil=vendedor')
    render(<><DemoLoginCards /><LoginFormStub /></>)
    await waitFor(() =>
      expect((document.getElementById('email') as HTMLInputElement).value).toBe('vendedor@demo.mx')
    )
    expect(screen.getByRole('button', { name: 'Entrar como Vendedor' })).toHaveAttribute('aria-pressed', 'true')
  })
})
