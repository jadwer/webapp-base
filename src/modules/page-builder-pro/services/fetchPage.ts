// src/modules/page-builder-pro/services/fetchPage.ts

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// JSON:API response type for pages
interface JsonApiPageResource {
  id: string
  attributes: {
    title: string
    html: string
    css?: string
    slug: string
    status: 'draft' | 'published' | 'archived'
    publishedAt?: string | null
    published_at?: string | null // snake_case compatibility
  }
}

interface JsonApiResponse {
  data: JsonApiPageResource[]
}

export async function fetchPageBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/pages?filter[slug]=${slug}`, {
      headers: { Accept: "application/vnd.api+json" },
      next: { revalidate: 60 }, // SSR con caché
    });

    if (!res.ok) return null;

    const json: JsonApiResponse = await res.json();
    const pages = json.data || [];
    
    // Filter for published pages only
    const publishedPages = pages.filter((page: JsonApiPageResource) => {
      return page.attributes.status === 'published';
    });
    
    const data = publishedPages[0];
    if (!data) return null;

    return {
      id: data.id,
      title: data.attributes.title,
      html: data.attributes.html,
      css: data.attributes.css,
      slug: data.attributes.slug,
      status: data.attributes.status,
      publishedAt: data.attributes.publishedAt || data.attributes.published_at,
    };
  } catch (err) {
    console.error("Error fetching page:", err);
    return null;
  }
}
