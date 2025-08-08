import { ProductFormTemplate } from '@/modules/products'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  return (
    <div className="container-fluid py-4">
      <ProductFormTemplate 
        productId={id}
        isEditing={true}
      />
    </div>
  )
}