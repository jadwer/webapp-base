import { describe, it, expect, vi, beforeEach } from 'vitest'
import { systemEmailService } from '../../services/systemEmailService'

vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import axiosClient from '@/lib/axiosClient'

const mockAxios = axiosClient as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
}

const mockSystemEmail = {
  id: '1',
  type: 'system-emails',
  attributes: {
    key: 'sales.quote_sent',
    module: 'Sales',
    name: 'Cotizacion Enviada',
    description: 'Se envia al cliente',
    mailableClass: 'Modules\\Sales\\Mail\\QuoteSentMail',
    availableVariables: { quote_number: 'Numero', customer_name: 'Nombre' },
    sampleData: { quote_number: 'COT-001', customer_name: 'Juan' },
    isEnabled: true,
    defaultSubject: 'Cotizacion {{quote_number}}',
  },
  relationships: {
    emailTemplate: { data: null },
  },
}

const mockSystemEmailWithTemplate = {
  ...mockSystemEmail,
  id: '2',
  relationships: {
    emailTemplate: { data: { type: 'email-templates', id: '10' } },
  },
}

const mockIncluded = [
  {
    id: '10',
    type: 'email-templates',
    attributes: {
      name: 'Custom Template',
      slug: 'custom',
      description: null,
      subject: 'Custom Subject',
      html: '<p>Custom</p>',
      css: '',
      json: null,
      status: 'active',
      category: 'transactional',
      createdAt: '2026-03-16T00:00:00Z',
      updatedAt: '2026-03-16T00:00:00Z',
    },
  },
]

describe('systemEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all system emails', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [mockSystemEmail], included: [] } })

    const result = await systemEmailService.getAll()

    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/system-emails'))
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('sales.quote_sent')
    expect(result[0].module).toBe('Sales')
    expect(result[0].isEnabled).toBe(true)
  })

  it('should fetch with module filter', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [], included: [] } })

    await systemEmailService.getAll({ module: 'Ecommerce' })

    const url = mockAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter%5Bmodule%5D=Ecommerce')
  })

  it('should resolve included emailTemplate', async () => {
    mockAxios.get.mockResolvedValue({
      data: { data: [mockSystemEmailWithTemplate], included: mockIncluded },
    })

    const result = await systemEmailService.getAll()

    expect(result[0].emailTemplateId).toBe('10')
    expect(result[0].emailTemplate).toBeDefined()
    expect(result[0].emailTemplate?.name).toBe('Custom Template')
  })

  it('should handle null emailTemplate relationship', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [mockSystemEmail], included: [] } })

    const result = await systemEmailService.getAll()

    expect(result[0].emailTemplateId).toBeNull()
    expect(result[0].emailTemplate).toBeUndefined()
  })

  it('should update isEnabled', async () => {
    mockAxios.patch.mockResolvedValue({ data: { data: { ...mockSystemEmail, attributes: { ...mockSystemEmail.attributes, isEnabled: false } } } })

    await systemEmailService.update('1', { isEnabled: false })

    const payload = mockAxios.patch.mock.calls[0][1] as Record<string, unknown>
    const data = payload.data as Record<string, unknown>
    const attrs = data.attributes as Record<string, unknown>
    expect(attrs.isEnabled).toBe(false)
  })

  it('should assign template', async () => {
    mockAxios.patch.mockResolvedValue({ data: { data: mockSystemEmailWithTemplate } })

    await systemEmailService.update('1', { emailTemplateId: '10' })

    const payload = mockAxios.patch.mock.calls[0][1] as Record<string, unknown>
    const data = payload.data as Record<string, unknown>
    const rels = data.relationships as Record<string, unknown>
    const emailTemplateRel = rels.emailTemplate as Record<string, unknown>
    const relData = emailTemplateRel.data as Record<string, unknown>
    expect(relData.type).toBe('email-templates')
    expect(relData.id).toBe('10')
  })

  it('should unassign template with null', async () => {
    mockAxios.patch.mockResolvedValue({ data: { data: mockSystemEmail } })

    await systemEmailService.update('1', { emailTemplateId: null })

    const payload = mockAxios.patch.mock.calls[0][1] as Record<string, unknown>
    const data = payload.data as Record<string, unknown>
    const rels = data.relationships as Record<string, unknown>
    const emailTemplateRel = rels.emailTemplate as Record<string, unknown>
    expect(emailTemplateRel.data).toBeNull()
  })

  it('should preview system email', async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        data: {
          subject: 'Test',
          html: '<p>Preview</p>',
          has_custom_template: false,
          available_variables: { quote_number: 'Numero' },
        },
      },
    })

    const result = await systemEmailService.preview('1')

    expect(result.hasCustomTemplate).toBe(false)
    expect(result.html).toContain('Preview')
  })

  it('should send test email', async () => {
    mockAxios.post.mockResolvedValue({
      data: { message: 'Enviado', used_custom_template: false },
    })

    const result = await systemEmailService.sendTest('1', 'dev@test.com')

    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/system-emails/1/send-test', { email: 'dev@test.com' })
    expect(result.message).toBe('Enviado')
    expect(result.usedCustomTemplate).toBe(false)
  })

  it('should transform availableVariables correctly', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [mockSystemEmail], included: [] } })

    const result = await systemEmailService.getAll()

    expect(result[0].availableVariables).toHaveProperty('quote_number')
    expect(result[0].availableVariables.quote_number).toBe('Numero')
  })
})
