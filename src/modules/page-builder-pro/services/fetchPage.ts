// src/modules/page-builder-pro/services/fetchPage.ts

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchPageBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/pages?filter[slug]=${slug}`, {
      headers: { Accept: "application/vnd.api+json" },
      next: { revalidate: 60 }, // SSR con caché
    });

    if (!res.ok) return null;

    const json = await res.json();
    const pages = json.data || [];
    
    // Filter for published pages only (where publishedAt is not null)
    // Check both camelCase and snake_case for compatibility
    const publishedPages = pages.filter((page: any) => {
      const publishedAt = page.attributes.publishedAt || page.attributes.published_at;
      return publishedAt !== null && publishedAt !== undefined;
    });
    
    const data = publishedPages[0];
    if (!data) return null;

    return {
      id: data.id,
      title: data.attributes.title,
      html: data.attributes.html,
      css: data.attributes.css,
      slug: data.attributes.slug,
      publishedAt: data.attributes.publishedAt || data.attributes.published_at,
    };
  } catch (err) {
    console.error("Error fetching page:", err);
    return null;
  }
}
