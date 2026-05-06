/**
 * SLIDER EDITOR COMPONENT FOR GRAPEJS
 * Componente personalizado que permite editar sliders fácilmente
 */

import type { Editor } from 'grapesjs'
import { toast } from '@/lib/toast'

export function registerSliderEditorComponent(editor: Editor) {
  const domComponents = editor.DomComponents

  // Registrar componente Hero Slider personalizado
  domComponents.addType('hero-slider-custom', {
    model: {
      defaults: {
        tagName: 'section',
        classes: ['hero-slider-container'],
        attributes: {
          'data-gjs-type': 'hero-slider-custom'
        },
        traits: [
          {
            type: 'checkbox',
            name: 'autoplay',
            label: 'Auto-play',
            value: true
          },
          {
            type: 'number',
            name: 'interval',
            label: 'Intervalo (ms)',
            value: 5000,
            min: 1000,
            max: 30000
          },
          {
            type: 'select',
            name: 'animation',
            label: 'Animación',
            options: [
              { id: 'fade', name: 'Fade' },
              { id: 'slide', name: 'Slide' },
              { id: 'zoom', name: 'Zoom' }
            ],
            value: 'fade'
          }
        ],
        // CSS de edición dinámico
        style: {
          'position': 'relative',
          'overflow': 'hidden',
          'min-height': '100vh'
        }
      },

      init() {
        // Escuchar cambios de selección para mostrar/ocultar slides
        this.on('active', () => {
          this.addEditingClass()
        })
        
        this.on('inactive', () => {
          this.removeEditingClass()
        })

        // Agregar botón para añadir slides
        this.addSlideControls()
      },

      addEditingClass() {
        const view = this.getView()
        if (view && view.el) {
          view.el.classList.add('gjs-editing-slider')
        }
      },

      removeEditingClass() {
        const view = this.getView()
        if (view && view.el) {
          view.el.classList.remove('gjs-editing-slider')
        }
      },

      addSlideControls() {
        // Agregar toolbar personalizada para el slider
        this.set('toolbar', [
          {
            attributes: { class: 'fa fa-plus' },
            command: 'add-slide',
            label: 'Agregar Slide'
          },
          {
            attributes: { class: 'fa fa-trash' },
            command: 'remove-slide',
            label: 'Eliminar Slide'
          },
          {
            attributes: { class: 'fa fa-arrows' },
            command: 'reorder-slides',
            label: 'Reordenar'
          }
        ])
      }
    },

    view: {
      init() {
        // Aplicar estilos de edición cuando se monta el componente
        this.updateEditingStyles()
      },

      updateEditingStyles() {
        const el = this.el
        if (!el) return

        // Inyectar CSS para modo edición
        const styleId = 'slider-editing-styles'
        let existingStyle = document.getElementById(styleId)
        
        if (!existingStyle) {
          existingStyle = document.createElement('style')
          existingStyle.id = styleId
          document.head.appendChild(existingStyle)
        }

        existingStyle.textContent = `
          /* 🎨 MODO EDICIÓN: Slides visibles verticalmente */
          .gjs-editing-slider .hero-slides,
          .hero-slider-container.gjs-selected .hero-slides {
            position: static !important;
            height: auto !important;
            display: block !important;
          }
          
          .gjs-editing-slider .hero-slide,
          .hero-slider-container.gjs-selected .hero-slide {
            position: static !important;
            width: 100% !important;
            height: 100vh !important;
            opacity: 1 !important;
            display: block !important;
            margin-bottom: 20px !important;
            border: 3px dashed #007bff !important;
            border-radius: 8px !important;
          }
          
          .gjs-editing-slider .hero-slide::before,
          .hero-slider-container.gjs-selected .hero-slide::before {
            content: "📝 Slide " attr(data-slide-number) " - Click para editar contenido";
            position: absolute;
            top: 10px;
            left: 10px;
            background: #007bff;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,123,255,0.3);
          }
          
          .gjs-editing-slider .hero-slide:hover::before,
          .hero-slider-container.gjs-selected .hero-slide:hover::before {
            background: #0056b3;
            transform: scale(1.05);
            transition: all 0.2s ease;
          }
          
          /* 🎬 MODO PRODUCCIÓN: Slider normal */
          .hero-slider-container:not(.gjs-selected):not(.gjs-editing-slider) .hero-slides {
            height: 100vh;
            position: relative;
          }
          
          .hero-slider-container:not(.gjs-selected):not(.gjs-editing-slider) .hero-slide {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 1s ease-in-out;
          }
          
          .hero-slider-container:not(.gjs-selected):not(.gjs-editing-slider) .hero-slide.active {
            opacity: 1;
          }
          
          /* Controles de navegación ocultos en edición */
          .gjs-editing-slider .hero-nav,
          .hero-slider-container.gjs-selected .hero-nav,
          .gjs-editing-slider .hero-dots,
          .hero-slider-container.gjs-selected .hero-dots {
            display: none !important;
          }
        `
      }
    }
  })

  // Registrar comandos para gestionar slides
  editor.Commands.add('add-slide', {
    run(editor) {
      const selected = editor.getSelected()
      if (!selected || selected.get('type') !== 'hero-slider-custom') return

      const slidesContainer = selected.find('.hero-slides')[0]
      if (!slidesContainer) return

      const currentSlides = slidesContainer.components().length
      const newSlideNumber = currentSlides + 1

      // Template para nuevo slide
      const newSlideHTML = `
        <div class="hero-slide" data-slide-number="${newSlideNumber}" style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        ">
          <div class="container">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <div class="hero-content">
                  <h1 style="font-size: 3.5rem; font-weight: bold; margin-bottom: 20px;">
                    NUEVO SLIDE
                  </h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95;">
                    Contenido del slide ${newSlideNumber}. Edita este texto para personalizar tu mensaje.
                  </p>
                  <div class="hero-actions">
                    <button class="btn btn-primary btn-lg me-3">
                      Acción Principal
                    </button>
                    <button class="btn btn-outline-light btn-lg">
                      Acción Secundaria
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hero-visual">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 60px; text-align: center;">
                    <i class="bi bi-star" style="font-size: 120px; color: #FFD700;"></i>
                    <p style="margin-top: 20px; font-size: 1.1rem;">Elemento Visual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

      slidesContainer.components(newSlideHTML)

      // Actualizar dots indicator
      const dotsContainer = selected.find('.hero-dots')[0]
      if (dotsContainer) {
        const newDot = `
          <button class="hero-dot" onclick="heroSliderGoTo(this, ${newSlideNumber - 1})" style="
            width: 15px;
            height: 15px;
            border-radius: 50%;
            border: 2px solid white;
            background: transparent;
            cursor: pointer;
            transition: all 0.3s;
          "></button>
        `
        dotsContainer.components(newDot)
      }

      // Slide added successfully
    }
  })

  editor.Commands.add('remove-slide', {
    run(editor) {
      const selected = editor.getSelected()
      if (!selected || selected.get('type') !== 'hero-slider-custom') return

      const slidesContainer = selected.find('.hero-slides')[0]
      if (!slidesContainer) return

      const slides = slidesContainer.components()
      if (slides.length <= 1) {
        toast.warning('No puedes eliminar el ultimo slide')
        return
      }

      // Eliminar el último slide
      slides.at(slides.length - 1)?.remove()

      // Actualizar dots
      const dotsContainer = selected.find('.hero-dots')[0]
      if (dotsContainer) {
        const dots = dotsContainer.components()
        if (dots.length > 0) {
          dots.at(dots.length - 1)?.remove()
        }
      }

      // Slide removed successfully
    }
  })

}