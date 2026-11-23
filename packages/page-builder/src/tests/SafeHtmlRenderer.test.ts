import { describe, it, expect } from 'vitest'
import { cleanPageHtml, isDangerousUrl } from '../components/SafeHtmlRenderer'

describe('saneado de las paginas del constructor', () => {
  it('quita lo que ejecuta codigo y conserva el contenido', () => {
    const clean = cleanPageHtml(
      '<h1 class="t">Hola</h1><script>alert(1)</script><img src="x" onerror="alert(2)">' +
        '<a href=" java\nscript:alert(3)">clic</a><a href="/productos">catalogo</a>' +
        '<iframe srcdoc="<script>alert(4)</script>"></iframe><div srcdoc="x" style="width: expression(alert(5))">ok</div>' +
        '<meta http-equiv="refresh" content="0;url=https://malo.test"><base href="https://malo.test/">' +
        '<a href="data:text/html,<script>alert(6)</script>">d</a><p style="color:red">rojo</p>',
    )

    expect(clean).not.toMatch(/<script|onerror|javascript:|<iframe|srcdoc|<meta|<base|expression\(|data:text\/html/i)
    expect(clean).toContain('<h1 class="t">Hola</h1>')
    expect(clean).toContain('<a href="/productos">catalogo</a>')
    expect(clean).toContain('<p style="color:red">rojo</p>')
    expect(clean).toContain('<img src="x">')
  })

  it('reconoce esquemas peligrosos aunque traigan espacios o mayusculas', () => {
    expect(isDangerousUrl('  JaVaScRiPt:alert(1)')).toBe(true)
    expect(isDangerousUrl('java\tscript:alert(1)')).toBe(true)
    expect(isDangerousUrl('vbscript:x')).toBe(true)
    expect(isDangerousUrl('https://laborwasser.test/a?b=javascript:')).toBe(false)
    expect(isDangerousUrl('data:image/png;base64,AAAA')).toBe(false)
  })
})
