// src/modules/page-builder-pro/utils/injectCss.ts

export function injectPageBuilderCSS(html: string): string {
  const styleHref = "/css/page-builder.css"; // Asegúrate de compilarlo a `public/css/`

  if (!html) return "";

  const headTag = `<head><link rel="stylesheet" href="${styleHref}">`;
  const htmlWithHead =
    html.includes("<html") && html.includes("<head>")
      ? html.replace("<head>", headTag)
      : `${headTag}</head><body>${html}</body>`;

  return htmlWithHead;
}
