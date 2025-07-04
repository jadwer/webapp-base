import type { Editor } from 'grapesjs';

export default function organizeDefaultBlocks(editor: Editor) {
  const categoryMap: Record<string, string> = {
    structure: '📐 Estructura',
    content: '✏️ Contenido',
    media: '🖼️ Multimedia',
    elements: '🧩 Elementos',
  };

  const blockGroups: Record<string, string[]> = {
    structure: ['sect100', 'sect50', 'sect30', 'sect37', 'column1', 'column2', 'column3', 'column3-7'],
    content: ['text-basic', 'text', 'quote', 'link-block', 'text-sect'],
    media: ['image', 'video', 'map'],
    elements: ['button', 'divider', 'list-items', 'grid-items', 'link'],
  };

  editor.BlockManager.getAll().forEach((block: { id: string; set: (arg0: string, arg1: { id: string; label: string; }) => void; }) => {
    for (const [group, ids] of Object.entries(blockGroups)) {
      if (ids.includes(block.id)) {
        block.set('category', {
          id: group,
          label: categoryMap[group], // ← SIN HTML AQUÍ
        });
        break;
      }
    }
  });
}
