/**
 * HTML Cleaner utilities for GrapesJS editor
 * Removes unwanted HTML tags for clean component exports
 */

/**
 * Removes <body>, <html>, and <head> tags from HTML content
 * This is useful for component exports where we only want the inner content
 */
export function cleanHtmlForExport(html: string): string {
  if (!html) return ''
  
  // Remove DOCTYPE declaration
  let cleaned = html.replace(/<!DOCTYPE[^>]*>/i, '').trim()
  
  // Remove <html> wrapper
  cleaned = cleaned.replace(/<html[^>]*>/i, '').replace(/<\/html>/i, '')
  
  // Remove <head> section entirely
  cleaned = cleaned.replace(/<head[^>]*>[\s\S]*?<\/head>/i, '')
  
  // Remove <body> wrapper but keep inner content
  cleaned = cleaned.replace(/<body[^>]*>/i, '').replace(/<\/body>/i, '')
  
  // Clean up extra whitespace
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * Removes <body> tags specifically while preserving inner content
 * Less aggressive than cleanHtmlForExport - only removes body wrapper
 */
export function removeBodyTags(html: string): string {
  if (!html) return ''
  
  return html
    .replace(/<body[^>]*>/i, '')
    .replace(/<\/body>/i, '')
    .trim()
}

/**
 * Gets clean HTML from GrapesJS editor without body wrapper
 * This should be used instead of editor.getHtml() for component exports
 */
export function getCleanHtmlFromEditor(editor: { getHtml: () => string }): string {
  const rawHtml = editor.getHtml()
  return removeBodyTags(rawHtml)
}