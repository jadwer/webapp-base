import type { Editor } from 'grapesjs';

export default function organizeDefaultBlocks(editor: Editor) {
  const categoryMap: Record<string, { label: string; icon: string }> = {
    structure: { label: 'Estructura', icon: 'bi-columns' },
    content: { label: 'Contenido', icon: 'bi-fonts' },
    media: { label: 'Multimedia', icon: 'bi-camera-video' },
    elements: { label: 'Elementos', icon: 'bi-ui-checks-grid' },
  };

  const blockGroups: Record<string, string[]> = {
    structure: ['sect100', 'sect50', 'sect30', 'sect37', 'column1', 'column2', 'column3', 'column3-7'],
    content: ['text-basic', 'text', 'quote', 'link-block', 'text-sect'],
    media: ['image', 'video', 'map'],
    elements: ['button', 'divider', 'list-items', 'grid-items', 'link'],
  };

  editor.BlockManager.getAll().forEach(block => {
    for (const [group, ids] of Object.entries(blockGroups)) {
      if (ids.includes(block.id)) {
        const category = categoryMap[group];
        block.set('category', {
          id: group,
          label: `<i class="bi ${category.icon} me-2"></i> ${category.label}`,
        });
        break;
      }
    }
  });
}
