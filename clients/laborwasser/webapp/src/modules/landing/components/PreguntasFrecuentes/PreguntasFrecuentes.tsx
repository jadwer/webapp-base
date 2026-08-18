'use client'

/**
 * PREGUNTAS FRECUENTES (rediseno 2026-08, seccion nueva)
 *
 * Foto de fondo a todo el ancho con overlay azul, titulo + bajada alineados a
 * la derecha y un acordeon de 5 preguntas en tarjetas blancas.
 *
 * Fuente de datos: app-config `landing.faq` (JSON: [{question, answer}]) para
 * que el cliente edite preguntas sin deploy; fallback a faqDefaults (las del
 * Figma). Un solo item abierto a la vez (acordeon), accesible con teclado.
 */

import React, { useId, useMemo, useState } from 'react'
import { usePublicSettings } from '@lwm/app-config'
import { faqDefaults, type FaqItem } from '../../data/faqDefaults'
import styles from './PreguntasFrecuentes.module.scss'

function parseFaq(raw: unknown): FaqItem[] | null {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(value)) return null
    const items = value
      .filter((i) => i && typeof i.question === 'string' && typeof i.answer === 'string')
      .map((i) => ({ question: i.question.trim(), answer: i.answer.trim() }))
      .filter((i) => i.question && i.answer)
    return items.length > 0 ? items : null
  } catch {
    return null
  }
}

export const PreguntasFrecuentes: React.FC = () => {
  const { get } = usePublicSettings()
  const items = useMemo(() => parseFaq(get('landing.faq')) ?? faqDefaults, [get])
  const [open, setOpen] = useState<number | null>(null)
  const baseId = useId()

  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <div className={styles.media} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/laborwasser/labor-wasser-redesign-faq.webp"
          alt=""
          className={styles.photo}
          loading="lazy"
          decoding="async"
        />
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <h2 id="faq-title" className={styles.title}>Preguntas Frecuentes</h2>
          <p className={styles.lead}>
            Resolvemos las dudas mas comunes sobre nuestros productos, cotizaciones,
            envios y servicios.
          </p>
        </div>

        <div className={styles.list}>
          {items.map((item, i) => {
            const isOpen = open === i
            const panelId = `${baseId}-panel-${i}`
            const btnId = `${baseId}-btn-${i}`
            return (
              <div key={i} className={`lw-card ${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
                <h3 className={styles.question}>
                  <button
                    id={btnId}
                    type="button"
                    className={styles.trigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{item.question}</span>
                    <i className={`bi bi-chevron-down ${styles.chevron}`} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={styles.panel}
                  hidden={!isOpen}
                >
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
