import grapesjs from "grapesjs";
import presetWebpage from "grapesjs-preset-webpage";
import blocksBasic from "grapesjs-blocks-basic";
import presetNewsletter from "grapesjs-preset-newsletter";
import blocksFormsExtended from "./plugins/grapejs-bloks-forms-extended";
import blocksUIBootstrap from "./plugins/grapesjs-blocks-ui-bootstrap";
import pluginUiEditorPlus from "./plugins/grapesjs-ui-editor-plus";
import pluginStorageLocal from "./plugins/grapesjs-storage-local";
import organizeDefaultBlocks from "./plugins/grapesjs-organize-default-blocks";

import type { ToastType } from "./types/ToastType";

export default function initPageBuilder(
  container: HTMLElement,
  onNotify?: (msg: string, type?: ToastType) => void
): void {
  const notify = (msg: string, type: ToastType = "success") => {
    if (onNotify) {
      onNotify(msg, type);
    } else {
      alert(msg);
    }
  };

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
      (editor) => pluginStorageLocal(editor, notify),
      (editor) => pluginUiEditorPlus(editor, notify),
    ],
  });

  organizeDefaultBlocks(editor);

  //  (window as any).editor = editor;

  editor.on("load", () => {
    const canvasDoc = editor.Canvas.getDocument();
    const head = canvasDoc.head;
    if (!head.querySelector('link[href*="bootstrap.min.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
      head.appendChild(link);
    }
  });
}
