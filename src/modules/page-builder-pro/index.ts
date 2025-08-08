import grapesjs, { Editor } from "grapesjs";
import presetWebpage from "grapesjs-preset-webpage";
import blocksBasic from "grapesjs-blocks-basic";
import presetNewsletter from "grapesjs-preset-newsletter";
import blocksFormsExtended from "./plugins/grapejs-bloks-forms-extended";
import blocksUIBootstrap from "./plugins/grapesjs-blocks-ui-bootstrap";
import pluginUiEditorPlus from "./plugins/grapesjs-ui-editor-plus";
import pluginStorageLocal from "./plugins/grapesjs-storage-local";
import organizeDefaultBlocks from "./plugins/grapesjs-organize-default-blocks";
import { ensureGrapeJSGlobalInit } from "./globalInit";

import type { ToastType } from "./types/ToastType";

// Export types and services
export type { 
  Page, 
  CreatePageData, 
  UpdatePageData, 
  PageFilters, 
  PaginatedPages,
  SlugCheckResult,
  SlugGenerationOptions,
  SoftDeleteResult,
  RestorePageOptions 
} from './types/page'
export type { ToastType } from './types/ToastType'
export { PagesService } from './services/pagesService'
export { 
  usePages, 
  usePage, 
  usePageActions,
  useSoftDeleteActions,
  useDeletedPages,
  useSlugValidation 
} from './hooks/usePages'
export { default as PagesAdminTemplate } from './templates/PagesAdminTemplate'
export { default as PageEditorTemplate } from './templates/PageEditorTemplate'
export { default as StatusBadge } from './components/StatusBadge'
export { default as PagesTable } from './components/PagesTable'
export { default as PagesTableDS } from './components/PagesTableDS'
export { default as PageForm } from './components/PageForm'
export { default as PagesFilters } from './components/PagesFilters'
export { default as PaginationControls } from './components/PaginationControls'
export { default as ToastNotifier } from './components/ToastNotifier'
export { default as DeletedPagesPanel } from './components/DeletedPagesPanel'

export default async function initPageBuilder(
  container: HTMLElement,
  onNotify?: (msg: string, type?: ToastType) => void,
  options: { disableAutoLoad?: boolean } = {}
): Promise<Editor> {
  // Ensure global dependencies are loaded first
  try {
    await ensureGrapeJSGlobalInit()
  } catch (error) {
    console.warn('Global init failed, proceeding anyway:', error)
  }
  
  const notify = (msg: string, type: ToastType = "success") => {
    if (onNotify) {
      onNotify(msg, type);
    } else {
      alert(msg);
    }
  };

  const { disableAutoLoad = false } = options;

  const editor = grapesjs.init({
    container,
    height: "100vh",
    fromElement: false,
    storageManager: false,
    plugins: [
      presetWebpage,
      blocksBasic,
      presetNewsletter,
      blocksFormsExtended,
      blocksUIBootstrap,
      (editor) => pluginStorageLocal(editor, notify, { autoLoad: !disableAutoLoad }),
      (editor) => pluginUiEditorPlus(editor, notify),
    ],
  });

  // Don't set global editor anymore - return instance instead
  // This prevents conflicts when multiple editors are initialized

  // Wait for editor to be fully loaded before organizing blocks
  editor.on("load", () => {
    try {
      // Inject Bootstrap CSS with proper validation
      const canvas = editor.Canvas;
      if (canvas && typeof canvas.getDocument === 'function') {
        const canvasDoc = canvas.getDocument();
        if (canvasDoc && canvasDoc.head) {
          const head = canvasDoc.head;
          if (!head.querySelector('link[href*="bootstrap.min.css"]')) {
            const link = canvasDoc.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
            head.appendChild(link);
          }
        }
      }

      // Organize blocks after everything is loaded
      setTimeout(() => {
        try {
          organizeDefaultBlocks(editor);
        } catch (error) {
          console.warn('Error organizing blocks:', error);
        }
      }, 100);
    } catch (error) {
      console.warn('Error during editor initialization:', error);
    }
  });

  return editor;
}
