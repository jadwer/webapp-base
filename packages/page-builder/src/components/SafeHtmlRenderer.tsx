'use client'

import { useEffect, useRef } from 'react'

interface SafeHtmlRendererProps {
  html: string
  className?: string
}

// Etiquetas que una pagina del constructor no necesita y que ejecutan codigo o
// sacan al visitante del sitio.
const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'meta', 'base']
const URL_ATTRIBUTES = ['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'data']

/** El valor apunta a un esquema que ejecuta codigo (aunque traiga espacios o saltos al inicio). */
export function isDangerousUrl(value: string): boolean {
  const compact = value.replace(/[\u0000-\u0020\u007f]+/g, '').toLowerCase()
  return compact.startsWith('javascript:') || compact.startsWith('vbscript:') || compact.startsWith('data:text/html')
}

/** Quita de un arbol ya parseado lo que ejecutaria codigo; regresa el HTML limpio. */
export function sanitizePageHtml(root: HTMLElement): string {
  DANGEROUS_TAGS.forEach((tag) => root.querySelectorAll(tag).forEach((el) => el.remove()))
  root.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on') || name === 'srcdoc' || name === 'formaction') {
        el.removeAttribute(attr.name)
      } else if (URL_ATTRIBUTES.includes(name) && isDangerousUrl(attr.value)) {
        el.removeAttribute(attr.name)
      } else if (name === 'style' && /expression\s*\(|javascript:/i.test(attr.value)) {
        el.removeAttribute(attr.name)
      }
    })
  })
  return root.innerHTML
}

/**
 * Limpia el HTML de una pagina. Se parsea con DOMParser, que arma un documento
 * inerte: asignar el HTML a un elemento del documento vivo (aunque no este
 * montado) carga las imagenes y dispara su `onerror` antes de poder quitarlo.
 */
export function cleanPageHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return sanitizePageHtml(doc.body)
}

export default function SafeHtmlRenderer({ html, className }: SafeHtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = cleanPageHtml(html)
  }, [html])

  return <div ref={containerRef} className={className} />
}
