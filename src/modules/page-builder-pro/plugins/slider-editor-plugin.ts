/**
 * SLIDER EDITOR PLUGIN
 * Plugin para GrapeJS que permite editar sliders fácilmente
 */

import type { Editor } from 'grapesjs'

export default function sliderEditorPlugin(editor: Editor) {
  
  // Registrar comando para alternar modo edición
  editor.Commands.add('toggle-slider-edit-mode', {
    run(editor) {
      const selected = editor.getSelected()
      if (!selected) return

      const sliderContainer = selected.getEl()
      if (!sliderContainer || !sliderContainer.classList.contains('hero-slider-container')) return

      const editorSection = sliderContainer.querySelector('.hero-slides-editor') as HTMLElement
      const productionSection = sliderContainer.querySelector('.hero-slides-production') as HTMLElement

      if (!editorSection || !productionSection) return

      // Alternar visibilidad
      const isEditorVisible = editorSection.style.display !== 'none'
      
      if (isEditorVisible) {
        // Cambiar a modo producción
        editorSection.style.display = 'none'
        productionSection.style.display = 'block'
        // Slider changed to production mode
      } else {
        // Cambiar a modo edición
        editorSection.style.display = 'block'
        productionSection.style.display = 'none'
        // Slider changed to edit mode
      }

      // Refrescar el editor
      editor.refresh()
    }
  })

  // Agregar botón en el panel de comandos
  editor.Panels.addButton('views', {
    id: 'toggle-slider-mode',
    className: 'fa fa-sliders',
    command: 'toggle-slider-edit-mode',
    attributes: {
      title: '🎨 Alternar modo edición/producción de slider'
    },
    active: false
  })

  // Auto-activar modo edición cuando se selecciona el slider
  editor.on('component:selected', (model) => {
    const el = model.getEl()
    if (el && el.classList.contains('hero-slider-container')) {
      setTimeout(() => {
        const editorSection = el.querySelector('.hero-slides-editor') as HTMLElement
        const productionSection = el.querySelector('.hero-slides-production') as HTMLElement
        
        if (editorSection && productionSection) {
          // Activar modo edición automáticamente
          editorSection.style.display = 'block'
          productionSection.style.display = 'none'
          // Auto-activating edit mode for slider
        }
      }, 100)
    }
  })

  // Desactivar modo edición cuando se deselecciona
  editor.on('component:deselected', (model) => {
    const el = model.getEl()
    if (el && el.classList.contains('hero-slider-container')) {
      setTimeout(() => {
        const editorSection = el.querySelector('.hero-slides-editor') as HTMLElement
        const productionSection = el.querySelector('.hero-slides-production') as HTMLElement
        
        if (editorSection && productionSection) {
          // Volver a modo producción
          editorSection.style.display = 'none'
          productionSection.style.display = 'block'
          // Auto-activating production mode for slider
        }
      }, 100)
    }
  })

}