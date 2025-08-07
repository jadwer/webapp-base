import type { Editor } from 'grapesjs';
import type { ToastType } from '../types/ToastType';
import { getCleanHtmlFromEditor } from '../utils/htmlCleaner';

export default function pluginUiEditorPlus(
  editor: Editor,
  notify: (msg: string, type?: ToastType) => void
) {
  editor.Panels.addButton('options', {
    id: 'save-html',
    className: 'fa fa-save',
    label: '',
    command: 'storage-save-local',
    attributes: { title: 'Guardar contenido' },
  });

  editor.Panels.addButton('options', {
    id: 'export-html',
    className: 'bi bi-code-square',
    label: '',
    command: 'export-html-command',
    attributes: { title: 'Exportar HTML' },
  });

  editor.Commands.add('export-html-command', {
    run(editor) {
      try {
        const html = editor.getHtml();
        const css = editor.getCss();
        const fullHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${css}</style></head><body>${html}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        win ? notify('🔍 HTML exportado (modo moderno)', 'info') : notify('⚠️ Popup bloqueado', 'error');
      } catch {
        notify('❌ Error al exportar contenido', 'error');
      }
    },
  });

  editor.Panels.addButton('options', {
    id: 'clear-content',
    className: 'bi bi-eraser-fill',
    label: '',
    command: 'clear-editor-command',
    attributes: { title: 'Borrar contenido y resetear' },
  });

  editor.Commands.add('clear-editor-command', {
    run(editor) {
      const confirmClear = confirm('¿Seguro que quieres borrar todo el contenido? Esta acción no se puede deshacer.');
      if (confirmClear) {
        localStorage.clear(); // o usa la key si prefieres ser específico
        editor.DomComponents.clear();
        editor.Css.clear();
        notify('🧹 Editor limpio', 'info');
      }
    },
  });

  editor.Panels.addButton('options', {
    id: 'download-html',
    className: 'bi bi-file-earmark-code',
    label: '',
    command: 'download-html-command',
    attributes: { title: 'Descargar como archivo .html' },
  });

  editor.Commands.add('download-html-command', {
    run(editor) {
      try {
        const html = editor.getHtml();
        const css = editor.getCss();
        const fullHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${css}</style></head><body>${html}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'page.html.tsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        notify('💾 Archivo "page.html" descargado', 'success');
      } catch {
        notify('❌ Error al generar descarga', 'error');
      }
    },
  });

  editor.Panels.addButton('options', {
    id: 'download-component',
    className: 'bi bi-typescript',
    label: '',
    command: 'download-component-command',
    attributes: { title: 'Descargar como componente React' },
  });

  editor.Commands.add('download-component-command', {
    run(editor) {
      try {
        const html = getCleanHtmlFromEditor(editor); // Clean HTML without body tags
        const css = editor.getCss();
        const componentCode = `
import './page.module.scss';

export default function Page() {
  return (
    <>
      <style jsx>{\`${css}\`}</style>
      <div dangerouslySetInnerHTML={{ __html: \`${html.replace(/`/g, '\\`')}\` }} />
    </>
  );
}`.trim();
        const blob = new Blob([componentCode], { type: 'text/tsx' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'page.html.tsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        notify('⚛️ Componente React descargado como page.html.tsx', 'success');
      } catch {
        notify('❌ Error al generar componente', 'error');
      }
    },
  });
}
