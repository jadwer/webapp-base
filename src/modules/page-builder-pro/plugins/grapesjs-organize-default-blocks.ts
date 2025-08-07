import type { Editor } from 'grapesjs';

export default function organizeDefaultBlocks(editor: Editor) {
  try {
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

    const blockManager = editor.BlockManager;
    if (!blockManager) {
      console.warn('BlockManager not available');
      return;
    }

    const allBlocks = blockManager.getAll();
    if (!allBlocks || !allBlocks.forEach) {
      console.warn('No blocks available');
      return;
    }

    allBlocks.forEach((block: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      try {
        if (!block || typeof block.set !== 'function') return;

        for (const [group, ids] of Object.entries(blockGroups)) {
          if (ids.includes(block.id)) {
            block.set('category', {
              id: group,
              label: categoryMap[group],
            });
            break;
          }
        }
      } catch (blockError) {
        console.warn('Error organizing block:', block?.id, blockError);
      }
    });
  } catch (error) {
    console.warn('Error organizing default blocks:', error);
  }
}
