import 'grapesjs/dist/css/grapes.min.css';

export default function PageBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <main>{children}</main>
  )
}