export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchPageBySlug } from "@/modules/page-builder-pro/services/fetchPage";
import { injectPageBuilderCSS } from "@/modules/page-builder-pro/styles/injectCss";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchPageBySlug(slug);

  if (!page) return notFound();

  const html = injectPageBuilderCSS(page.html, page.css);

  return (
    <main className="pb-10">
      <div
        className="page-builder-output"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
