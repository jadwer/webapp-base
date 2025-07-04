// src/modules/page-builder-pro/services/fetchPage.ts

const API_URL = process.env.API_URL || "http://localhost:8000/api/v1";

export async function fetchPageBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/pages?filter[slug]=${slug}`, {
      headers: { Accept: "application/vnd.api+json" },
      next: { revalidate: 60 }, // SSR con caché
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json.data?.[0];

    if (!data) return null;

    return {
      id: data.id,
      title: data.attributes.title,
      html: data.attributes.html,
    };
  } catch (err) {
    console.error("Error fetching page:", err);
    return null;
  }
}
