'use client'

import { useEffect, useRef } from 'react'

interface SafeHtmlRendererProps {
  html: string
  className?: string
}

export default function SafeHtmlRenderer({ html, className }: SafeHtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create a temporary element to parse the HTML
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Remove potentially dangerous elements
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea']
    dangerousTags.forEach(tag => {
      const elements = temp.querySelectorAll(tag)
      elements.forEach(el => el.remove())
    })

    // Remove dangerous attributes from all elements
    const allElements = temp.querySelectorAll('*')
    allElements.forEach(el => {
      const attrs = Array.from(el.attributes)
      attrs.forEach(attr => {
        if (attr.name.startsWith('on') || attr.value.startsWith('javascript:')) {
          el.removeAttribute(attr.name)
        }
      })
    })

    containerRef.current.innerHTML = temp.innerHTML
  }, [html])

  return <div ref={containerRef} className={className} />
}
