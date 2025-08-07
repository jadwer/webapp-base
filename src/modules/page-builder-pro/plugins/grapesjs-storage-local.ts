import type { Editor } from 'grapesjs';
import type { ToastType } from '../types/ToastType';

const STORAGE_KEY = 'grapejs-page-builder-content';

export default function pluginStorageLocal(
  editor: Editor,
  notify: (msg: string, type?: ToastType) => void,
  options: { autoLoad?: boolean } = {}
) {
  const { autoLoad = true } = options;

  editor.on('load', () => {
    // Only auto-load from localStorage if explicitly enabled
    if (autoLoad) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          editor.setComponents(data.html || '');
          editor.setStyle(data.css || '');
          notify('📦 Contenido cargado desde localStorage', 'info');
        } catch (e) {
          console.warn(e);
          notify('⚠️ Error al cargar contenido local', 'error');
        }
      }
    }

    editor.Commands.add('storage-save-local', {
      run(editor) {
        const html = editor.getHtml();
        const css = editor.getCss();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ html, css }));
        notify('✅ Contenido guardado en localStorage', 'success');
      },
    });

    editor.on('storage:custom-key', () => STORAGE_KEY);
  });
}
