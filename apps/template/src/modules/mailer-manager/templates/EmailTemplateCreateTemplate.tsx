'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEmailTemplateActions } from '../hooks/useEmailTemplates'
import { toast } from '@/lib/toast'
import type { EmailTemplateCategory } from '../types/emailTemplate'

export default function EmailTemplateCreateTemplate() {
  const router = useRouter()
  const { create, isSubmitting } = useEmailTemplateActions()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<EmailTemplateCategory | ''>('')

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim() || !subject.trim()) {
      toast.warning('Nombre, slug y asunto son requeridos')
      return
    }

    try {
      const template = await create({
        name: name.trim(),
        slug: slug.trim(),
        subject: subject.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        status: 'draft',
      })
      toast.success('Template creado. Abre el editor para disenar el contenido.')
      router.push(`/dashboard/mailer-manager/${template.id}/edit`)
    } catch {
      toast.error('Error al crear el template')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push('/dashboard/mailer-manager')}>
          <i className="bi bi-arrow-left me-1"></i>Volver
        </button>
        <h1 className="h3 mb-0">
          <i className="bi bi-plus-lg me-2"></i>
          Nueva Plantilla de Email
        </h1>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Cotizacion Enviada"
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="slug" className="form-label">Slug *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="cotizacion-enviada"
                    required
                  />
                  <div className="form-text">Identificador unico. Se genera automaticamente del nombre.</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">Asunto del Email *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={'Ej: Cotizacion {{quote_number}} - {{company_name}}'}
                    required
                  />
                  <div className="form-text">{'Puedes usar variables: {{variable_name}}'}</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Descripcion</label>
                  <textarea
                    className="form-control"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Descripcion opcional del template"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EmailTemplateCategory | '')}
                  >
                    <option value="">Sin categoria</option>
                    <option value="transactional">Transaccional</option>
                    <option value="notification">Notificacion</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => router.push('/dashboard/mailer-manager')}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Creando...</>
                    ) : (
                      <><i className="bi bi-plus-lg me-2"></i>Crear y Abrir Editor</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
