import { PageEditorTemplate } from '@/modules/page-builder-pro'

interface EditPagePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  const { id } = await params
  
  return (
    <div className="container-fluid py-4">
      <PageEditorTemplate pageId={id} />
    </div>
  )
}