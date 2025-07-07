import AuthenticatedLayout from "@/modules/auth/components/AuthenticatedLayout"

export default function BackPage({
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