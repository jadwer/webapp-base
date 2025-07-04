import type { Editor } from 'grapesjs';
import { STORAGE_KEY } from '../storage/localStorage';
import type { ToastType } from '../components/ToastNotifier';

export default function registerEditorButtons(editor: Editor, notify: (msg: string, type?: ToastType) => void) {
  editor.Panels.addButton('options', {
    id: 'save-html',
    className: 'fa fa-save',
    command: 'save-html-command',
    attributes: { title: 'Guardar contenido' },
  });

  editor.Commands.add('save-html-command', {
    run(editor) {
      const html = editor.getHtml();
      const css = editor.getCss();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ html, css }));
      notify('✅ Contenido guardado', 'success');
    },
  });

  editor.Panels.addButton('options', {
    id: 'export-html',
    className: 'bi bi-code-square',
    command: 'export-html-command',
    attributes: { title: 'Exportar HTML' },
  });

  editor.Commands.add('export-html-command', {
    run(editor) {
      try {
        const html = editor.getHtml();
        const css = editor.getCss();
        const fullHtml = \`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>\${css}</style></head><body>\${html}</body></html>\`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        notify('🔍 HTML exportado (modo moderno)', 'info');
      } catch {
        notify('❌ Error al exportar contenido', 'error');
      }
    },
  });
}
