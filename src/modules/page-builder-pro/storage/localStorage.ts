import type { Editor } from 'grapesjs';
import type { ToastType } from './../types/ToastType';

export const STORAGE_KEY = 'grapejs-page-builder-content';

export function loadFromStorage(editor: Editor, notify: (msg: string, type?: ToastType) => void) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    editor.setComponents(data.html || '');
    editor.setStyle(data.css || '');
    notify('Contenido cargado desde localStorage 📦', 'info');
  } catch {
    notify('⚠️ Error al cargar contenido local', 'error');
  }
}
