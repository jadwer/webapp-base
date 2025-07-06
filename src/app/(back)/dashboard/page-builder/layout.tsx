import AuthenticatedLayout from "@/modules/auth/components/AuthenticatedLayout"
import 'grapesjs/dist/css/grapes.min.css';

export default function PageBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout>
      <main>{children}</main>
    </AuthenticatedLayout>
  )
}