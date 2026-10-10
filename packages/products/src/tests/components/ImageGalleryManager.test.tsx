/**
 * Galeria de imagenes del producto (P1 granel, 2026-10-10): subida multiple,
 * principal, reemplazar, quitar, imagen legada sin fila y errores del backend
 * visibles con detalle (regla 7).
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ProductImage } from '../../types/productImage'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }))

vi.mock('@lwm/ui', async () => {
  const ReactMod = await import('react')
  const ConfirmModal = ReactMod.forwardRef(function ConfirmModal(_props: unknown, ref) {
    ReactMod.useImperativeHandle(ref, () => ({ confirm: () => Promise.resolve(true) }))
    return null
  })
  return { toast, ConfirmModal }
})

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('../../services/productService', () => ({
  productService: { uploadImage: vi.fn(), updateProduct: vi.fn() },
}))

vi.mock('../../services/productImageService', () => ({
  productImageService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    setPrimary: vi.fn(),
    reorder: vi.fn(),
  },
}))

const hookState = vi.hoisted(() => ({ images: [] as ProductImage[], mutate: vi.fn() }))
vi.mock('../../hooks/useProductImages', () => ({
  useProductImages: () => ({ images: hookState.images, isLoading: false, error: undefined, mutate: hookState.mutate }),
}))

import { productService } from '../../services/productService'
import { productImageService } from '../../services/productImageService'
import { ImageGalleryManager, sortGalleryImages } from '../../components/ImageGalleryManager'

const upload = vi.mocked(productService.uploadImage)
const updateProduct = vi.mocked(productService.updateProduct)
const create = vi.mocked(productImageService.create)
const update = vi.mocked(productImageService.update)
const remove = vi.mocked(productImageService.delete)
const setPrimary = vi.mocked(productImageService.setPrimary)

function img(id: string, sortOrder: number, isPrimary = false, altText: string | null = null): ProductImage {
  return { id, filePath: `products/${id}.jpg`, imageUrl: `https://api.test/storage/products/${id}.jpg`, altText, sortOrder, isPrimary, createdAt: '', updatedAt: '' }
}

function file(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' })
}

function axiosError(status: number, data: unknown) {
  return Object.assign(new Error('Request failed'), { response: { status, data } })
}

describe('ImageGalleryManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hookState.images = []
    upload.mockImplementation(async (f: File) => ({ path: `products/${f.name}` }) as never)
    create.mockResolvedValue(img('new', 0) as never)
    update.mockResolvedValue(img('1', 0) as never)
  })

  it('ordena la principal primero y luego por sortOrder', () => {
    const sorted = sortGalleryImages([img('a', 0), img('b', 2, true), img('c', 1)])
    expect(sorted.map(i => i.id)).toEqual(['b', 'a', 'c'])
  })

  it('sube varias imagenes a la vez y la primera queda principal si no habia ninguna', async () => {
    render(<ImageGalleryManager productId="7" />)
    const input = screen.getByTestId('gallery-file-input')

    fireEvent.change(input, { target: { files: [file('a.jpg'), file('b.jpg'), file('c.jpg')] } })

    await waitFor(() => expect(create).toHaveBeenCalledTimes(3))
    expect(upload).toHaveBeenCalledTimes(3)
    expect(create.mock.calls[0][0]).toEqual({ filePath: 'products/a.jpg', productId: '7', sortOrder: 0, isPrimary: true })
    expect(create.mock.calls[1][0]).toEqual({ filePath: 'products/b.jpg', productId: '7', sortOrder: 1 })
    expect(create.mock.calls[2][0]).toEqual({ filePath: 'products/c.jpg', productId: '7', sortOrder: 2 })
    expect(toast.success).toHaveBeenCalledWith('3 imagenes subidas correctamente')
  })

  it('con galeria existente agrega al final y solo marca principal si se pide', async () => {
    hookState.images = [img('1', 0, true), img('2', 4)]
    render(<ImageGalleryManager productId="7" />)

    fireEvent.click(screen.getByLabelText('Hacer principal la primera imagen que suba'))
    fireEvent.change(screen.getByTestId('gallery-file-input'), { target: { files: [file('n.jpg')] } })

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    expect(create.mock.calls[0][0]).toEqual({ filePath: 'products/n.jpg', productId: '7', sortOrder: 5, isPrimary: true })
  })

  it('muestra la principal primero y permite marcar otra como principal', async () => {
    hookState.images = [img('1', 0), img('2', 1, true)]
    setPrimary.mockResolvedValue(img('1', 0, true) as never)
    render(<ImageGalleryManager productId="7" />)

    const cards = screen.getAllByTestId('gallery-image')
    expect(cards[0].querySelector('img')?.getAttribute('src')).toContain('/2.jpg')
    expect(screen.getByText('Principal')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Establecer como principal'))
    await waitFor(() => expect(setPrimary).toHaveBeenCalledWith('1'))
    expect(toast.success).toHaveBeenCalledWith('Imagen principal actualizada')
  })

  it('Reemplazar sube el archivo y actualiza filePath de esa imagen', async () => {
    hookState.images = [img('1', 0, true)]
    render(<ImageGalleryManager productId="7" />)

    fireEvent.click(screen.getByLabelText('Reemplazar imagen'))
    fireEvent.change(screen.getByTestId('gallery-replace-input'), { target: { files: [file('r.jpg')] } })

    await waitFor(() => expect(update).toHaveBeenCalledWith('1', { filePath: 'products/r.jpg' }))
    expect(toast.success).toHaveBeenCalledWith('Imagen reemplazada')
  })

  it('Quitar pide confirmacion y borra la imagen', async () => {
    hookState.images = [img('1', 0, true)]
    remove.mockResolvedValue(undefined as never)
    render(<ImageGalleryManager productId="7" />)

    fireEvent.click(screen.getByLabelText('Quitar imagen'))
    await waitFor(() => expect(remove).toHaveBeenCalledWith('1'))
  })

  it('muestra el error del backend con detalle (403 y 422), no un mensaje generico', async () => {
    hookState.images = [img('1', 0, true)]
    create.mockRejectedValueOnce(axiosError(403, { error: 'Forbidden' }))
    upload.mockRejectedValueOnce(axiosError(422, { message: 'The file field must be an image.', errors: { file: ['The file field must be an image.'] } }))
    render(<ImageGalleryManager productId="7" />)

    fireEvent.change(screen.getByTestId('gallery-file-input'), { target: { files: [file('bad.jpg'), file('ok.jpg')] } })

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(2))
    expect(toast.error).toHaveBeenCalledWith('The file field must be an image.')
    expect(toast.error).toHaveBeenCalledWith('Sin permiso para esta accion (403: Forbidden)')
    expect(screen.getByRole('alert')).toHaveTextContent('Sin permiso para esta accion (403: Forbidden)')
  })

  it('error al marcar principal muestra el detalle de JSON:API', async () => {
    hookState.images = [img('1', 0, true), img('2', 1)]
    setPrimary.mockRejectedValueOnce(axiosError(404, { errors: [{ detail: 'Imagen no encontrada' }] }))
    render(<ImageGalleryManager productId="7" />)

    fireEvent.click(screen.getByLabelText('Establecer como principal'))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Imagen no encontrada'))
  })

  describe('producto con img_path pero sin filas en la galeria (dato legado)', () => {
    it('muestra la imagen actual y la puede quitar', async () => {
      updateProduct.mockResolvedValue({} as never)
      render(<ImageGalleryManager productId="7" legacyImgPath="viejo.jpg" legacyImgUrl="https://api.test/storage/products/viejo.jpg" />)

      expect(screen.getByTestId('legacy-image')).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('Quitar imagen actual'))

      await waitFor(() => expect(updateProduct).toHaveBeenCalledWith('7', { imgPath: null }))
      await waitFor(() => expect(screen.queryByTestId('legacy-image')).not.toBeInTheDocument())
    })

    it('Reemplazar crea la nueva como principal', async () => {
      render(<ImageGalleryManager productId="7" legacyImgPath="viejo.jpg" legacyImgUrl="https://api.test/x.jpg" />)

      fireEvent.click(screen.getByLabelText('Reemplazar imagen actual'))
      fireEvent.change(screen.getByTestId('gallery-replace-input'), { target: { files: [file('r.jpg')] } })

      await waitFor(() => expect(create).toHaveBeenCalledWith({ productId: '7', filePath: 'products/r.jpg', sortOrder: 0, isPrimary: true }))
    })

    it('Agregar incorpora primero la imagen actual a la galeria para no perderla', async () => {
      render(<ImageGalleryManager productId="7" legacyImgPath="viejo.jpg" legacyImgUrl="https://api.test/x.jpg" />)

      fireEvent.change(screen.getByTestId('gallery-file-input'), { target: { files: [file('n.jpg')] } })

      await waitFor(() => expect(create).toHaveBeenCalledTimes(2))
      expect(create.mock.calls[0][0]).toEqual({ productId: '7', filePath: 'viejo.jpg', sortOrder: 0, isPrimary: true })
      expect(create.mock.calls[1][0]).toEqual({ filePath: 'products/n.jpg', productId: '7', sortOrder: 1 })
    })
  })

  it('edita el texto alternativo al salir del campo', async () => {
    hookState.images = [img('1', 0, true, 'viejo')]
    render(<ImageGalleryManager productId="7" />)

    const input = screen.getByLabelText('Texto alternativo de la imagen 1')
    fireEvent.change(input, { target: { value: 'Alcohol isopropilico 1 L' } })
    fireEvent.blur(input)

    await waitFor(() => expect(update).toHaveBeenCalledWith('1', { altText: 'Alcohol isopropilico 1 L' }))
  })
})
