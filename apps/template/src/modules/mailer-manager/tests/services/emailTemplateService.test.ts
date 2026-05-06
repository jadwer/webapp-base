import { describe, it, expect, vi, beforeEach } from 'vitest'
import { emailTemplateService } from '../../services/emailTemplateService'

vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import axiosClient from '@/lib/axiosClient'

const mockAxios = axiosClient as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockTemplate = {
  id: '1',
  type: 'email-templates',
  attributes: {
    name: 'Welcome Email',
    slug: 'welcome-email',
    description: 'Welcome template',
    subject: 'Welcome {{customer_name}}',
    html: '<h1>Hello</h1>',
    css: 'h1 { color: blue; }',
    json: null,
    status: 'draft',
    category: 'transactional',
    createdAt: '2026-03-16T00:00:00Z',
    updatedAt: '2026-03-16T00:00:00Z',
  },
}

describe('emailTemplateService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all templates', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [mockTemplate] } })

    const result = await emailTemplateService.getAll()

    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/email-templates'))
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Welcome Email')
    expect(result[0].slug).toBe('welcome-email')
  })

  it('should fetch templates with filters', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [mockTemplate] } })

    await emailTemplateService.getAll({ status: 'active', category: 'transactional' })

    const url = mockAxios.get.mock.calls[0][0] as string
    expect(url).toContain('filter%5Bstatus%5D=active')
    expect(url).toContain('filter%5Bcategory%5D=transactional')
  })

  it('should fetch template by id', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: mockTemplate } })

    const result = await emailTemplateService.getById('1')

    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/email-templates/1')
    expect(result.id).toBe('1')
    expect(result.subject).toBe('Welcome {{customer_name}}')
  })

  it('should create a template', async () => {
    mockAxios.post.mockResolvedValue({ data: { data: mockTemplate } })

    const result = await emailTemplateService.create({
      name: 'Welcome Email',
      slug: 'welcome-email',
      subject: 'Welcome',
    })

    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/email-templates', expect.objectContaining({
      data: expect.objectContaining({
        type: 'email-templates',
        attributes: expect.objectContaining({ name: 'Welcome Email' }),
      }),
    }))
    expect(result.name).toBe('Welcome Email')
  })

  it('should update a template', async () => {
    mockAxios.patch.mockResolvedValue({ data: { data: mockTemplate } })

    await emailTemplateService.update('1', { name: 'Updated', status: 'active' })

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/email-templates/1', expect.objectContaining({
      data: expect.objectContaining({
        type: 'email-templates',
        id: '1',
        attributes: expect.objectContaining({ name: 'Updated', status: 'active' }),
      }),
    }))
  })

  it('should delete a template', async () => {
    mockAxios.delete.mockResolvedValue({})

    await emailTemplateService.delete('1')

    expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/email-templates/1')
  })

  it('should preview a template', async () => {
    mockAxios.post.mockResolvedValue({
      data: { data: { subject: 'Test Subject', html: '<p>Test</p>' } },
    })

    const result = await emailTemplateService.preview('1')

    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/email-templates/1/preview', expect.any(Object))
    expect(result.subject).toBe('Test Subject')
    expect(result.html).toBe('<p>Test</p>')
  })

  it('should send test email', async () => {
    mockAxios.post.mockResolvedValue({
      data: { message: 'Email enviado a test@example.com' },
    })

    const result = await emailTemplateService.sendTest('1', 'test@example.com')

    expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/email-templates/1/send-test', expect.objectContaining({
      email: 'test@example.com',
    }))
    expect(result.message).toContain('test@example.com')
  })

  it('should upload an image', async () => {
    mockAxios.post.mockResolvedValue({
      data: { data: { id: '10', filename: 'logo.png', url: '/storage/logo.png', path: 'email-templates/1/logo.png' } },
    })

    const file = new File(['test'], 'logo.png', { type: 'image/png' })
    const result = await emailTemplateService.uploadImage('1', file)

    expect(mockAxios.post).toHaveBeenCalledWith(
      '/api/v1/email-templates/1/upload-image',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    )
    expect(result.filename).toBe('logo.png')
  })

  it('should transform JSON:API response to camelCase', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [mockTemplate] } })

    const result = await emailTemplateService.getAll()

    expect(result[0]).toHaveProperty('createdAt')
    expect(result[0]).toHaveProperty('updatedAt')
    expect(result[0]).not.toHaveProperty('created_at')
  })
})
