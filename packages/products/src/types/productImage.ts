export interface ProductImage {
  id: string
  filePath: string
  imageUrl: string | null
  altText: string | null
  sortOrder: number
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductImageData {
  filePath: string
  altText?: string
  sortOrder?: number
  isPrimary?: boolean
  productId: string
}

export interface UpdateProductImageData {
  altText?: string
  sortOrder?: number
  isPrimary?: boolean
}
