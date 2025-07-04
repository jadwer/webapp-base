export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchPageBySlug } from "@/modules/page-builder-pro/services/fetchPage";
import { injectPageBuilderCSS } from "@/modules/page-builder-pro/styles/injectCss";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function Page({ params }: PageProps) {
  // ⚠️ Nota: en desarrollo puede aparecer un warning visual
  // "params.slug should be awaited before using its properties."
  // Este es un bug conocido de Next.js (Turbopack), no afecta funcionalidad ni producción.

  const page = await fetchPageBySlug(params.slug);

  if (!page) return notFound();

  const html = injectPageBuilderCSS(page.html);

  return (
    <main className="pb-10">
      <div
        className="page-builder-output"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
