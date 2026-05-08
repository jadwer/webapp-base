export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { Metadata } from "next"
import { fetchPageBySlug } from "@/modules/page-builder-pro"
import { injectPageBuilderCSS } from "@/modules/page-builder-pro"
import { SafeHtmlRenderer } from "@/modules/page-builder-pro"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await fetchPageBySlug(slug)

  if (!page) {
    return { title: "Pagina no encontrada" }
  }

  return {
    title: `${page.title}`,
    description: `${page.title}`,
    robots: { index: true, follow: true },
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const page = await fetchPageBySlug(slug)

  if (!page) return notFound()

  const html = injectPageBuilderCSS(page.html, page.css)

  return (
    <div className="pb-page-content">
      <SafeHtmlRenderer html={html} className="page-builder-output" />
    </div>
  )
}
