// src/modules/page-builder-pro/styles/injectCss.ts

export function injectPageBuilderCSS(html: string, css?: string): string {
  if (!html) return "";

  // For Next.js pages, we should NOT create full HTML structure
  // Instead, just clean the content and return it with CSS injected inline
  
  // Extract body content if HTML contains full structure
  let cleanContent = html;
  
  if (html.includes("<html") || html.includes("<body")) {
    // Extract content from body tag, removing html/body wrapper
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      cleanContent = bodyMatch[1].trim();
    } else {
      // If no body tag found but has html tags, remove them
      cleanContent = html
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '')
        .trim();
    }
  }
  
  // Page-specific CSS - inject as inline style at the beginning
  const pageCSS = css ? `<style>${css}</style>` : '';
  
  // Return clean content with CSS injected
  return pageCSS + cleanContent;
}
