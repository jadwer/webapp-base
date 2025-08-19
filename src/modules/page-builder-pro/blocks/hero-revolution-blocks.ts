/**
 * HERO REVOLUTION SLIDER BLOCKS FOR GRAPEJS
 * Advanced hero banners with sliders, animations, and dynamic backgrounds
 */

import type { Editor } from 'grapesjs'

export interface HeroRevolutionBlock {
  id: string
  label: string
  category: string
  media: string
  content: string
  attributes?: { [key: string]: unknown }
}

/**
 * Classic Hero Slider Block
 * Multi-slide hero with navigation and autoplay
 */
export const heroSliderBlock: HeroRevolutionBlock = {
  id: 'hero-slider',
  label: 'Hero Slider',
  category: 'Hero Revolution',
  media: '<i class="bi bi-collection-play"></i>',
  attributes: {
    'data-gjs-type': 'hero-slider-custom'
  },
  content: `
    <section class="hero-slider-container" style="position: relative; overflow: hidden;">
      
      <!-- 📝 MODO EDITOR: Slides visibles para edición -->
      <div class="hero-slides-editor" style="display: block;">
        
        <!-- Slide 1 Editor -->
        <div class="hero-slide-editor" style="
          width: 100%;
          min-height: 100vh;
          margin-bottom: 20px;
          border: 3px dashed #28a745;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(30,60,114,0.8), rgba(42,82,152,0.8)), linear-gradient(45deg, #667eea, #764ba2);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <div style="
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: bold;
            text-align: center;
            z-index: 100;
          ">✏️ SLIDE 1 - Haz click para editar</div>
          <div class="container" style="margin-top: 50px;">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <div class="hero-content" style="animation: slideInLeft 1s ease-out;">
                  <h1 style="font-size: 4rem; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    INNOVACIÓN
                    <br><span style="color: #4CAF50;">CIENTÍFICA</span>
                  </h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95;">
                    Equipos de laboratorio de última generación para impulsar la investigación y el desarrollo científico.
                  </p>
                  <div class="hero-actions" style="animation: slideInUp 1s ease-out 0.3s both;">
                    <button class="btn btn-success btn-lg me-3" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-microscope"></i> Explorar Equipos
                    </button>
                    <button class="btn btn-outline-light btn-lg" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-play-circle"></i> Ver Demo
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hero-visual" style="animation: slideInRight 1s ease-out 0.2s both;">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 80px; text-align: center; backdrop-filter: blur(10px);">
                    <i class="bi bi-microscope" style="font-size: 150px; color: #4CAF50;"></i>
                    <p style="margin-top: 30px; font-size: 1.2rem; font-weight: 500;">Tecnología Avanzada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 2 Editor -->
        <div class="hero-slide-editor" style="
          width: 100%;
          min-height: 100vh;
          margin-bottom: 20px;
          border: 3px dashed #28a745;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(102,126,234,0.8), rgba(118,75,162,0.8)), linear-gradient(45deg, #f093fb, #f5576c);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <div style="
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: bold;
            text-align: center;
            z-index: 100;
          ">✏️ SLIDE 2 - Haz click para editar</div>
          <div class="container" style="margin-top: 50px;">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <div class="hero-content">
                  <h1 style="font-size: 4rem; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    PRECISIÓN
                    <br><span style="color: #FF6B6B;">GARANTIZADA</span>
                  </h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95;">
                    Reactivos certificados con los más altos estándares de calidad para resultados confiables.
                  </p>
                  <div class="hero-actions">
                    <button class="btn btn-danger btn-lg me-3" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-award"></i> Certificaciones
                    </button>
                    <button class="btn btn-outline-light btn-lg" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-download"></i> Catálogo
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hero-visual">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 80px; text-align: center; backdrop-filter: blur(10px);">
                    <i class="bi bi-award" style="font-size: 150px; color: #FF6B6B;"></i>
                    <p style="margin-top: 30px; font-size: 1.2rem; font-weight: 500;">Calidad Certificada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 3 Editor -->
        <div class="hero-slide-editor" style="
          width: 100%;
          min-height: 100vh;
          margin-bottom: 20px;
          border: 3px dashed #28a745;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(67,206,162,0.8), rgba(24,90,157,0.8)), linear-gradient(45deg, #43cea2, #185a9d);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <div style="
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: bold;
            text-align: center;
            z-index: 100;
          ">✏️ SLIDE 3 - Haz click para editar</div>
          <div class="container" style="margin-top: 50px;">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <div class="hero-content">
                  <h1 style="font-size: 4rem; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    SOPORTE
                    <br><span style="color: #43CEA2;">24/7</span>
                  </h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95;">
                    Acompañamiento técnico especializado en cada etapa de tu proyecto científico.
                  </p>
                  <div class="hero-actions">
                    <button class="btn btn-info btn-lg me-3" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-headset"></i> Contactar Soporte
                    </button>
                    <button class="btn btn-outline-light btn-lg" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-whatsapp"></i> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hero-visual">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 80px; text-align: center; backdrop-filter: blur(10px);">
                    <i class="bi bi-headset" style="font-size: 150px; color: #43CEA2;"></i>
                    <p style="margin-top: 30px; font-size: 1.2rem; font-weight: 500;">Soporte Especializado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <!-- 🎬 MODO PRODUCCIÓN: Slider normal -->
      <div class="hero-slides-production" style="height: 100vh; position: relative; display: none;">
        
        <!-- Slide 1 -->
        <div class="hero-slide active" data-slide-number="1" style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(30,60,114,0.8), rgba(42,82,152,0.8)), linear-gradient(45deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 1;
          transition: opacity 1s ease-in-out;
        ">
          <div class="container">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <div class="hero-content" style="animation: slideInLeft 1s ease-out;">
                  <h1 style="font-size: 4rem; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    INNOVACIÓN
                    <br><span style="color: #4CAF50;">CIENTÍFICA</span>
                  </h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95;">
                    Equipos de laboratorio de última generación para impulsar la investigación y el desarrollo científico.
                  </p>
                  <div class="hero-actions" style="animation: slideInUp 1s ease-out 0.3s both;">
                    <button class="btn btn-success btn-lg me-3" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-microscope"></i> Explorar Equipos
                    </button>
                    <button class="btn btn-outline-light btn-lg" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-play-circle"></i> Ver Demo
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hero-visual" style="animation: slideInRight 1s ease-out 0.2s both;">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 80px; text-align: center; backdrop-filter: blur(10px);">
                    <i class="bi bi-microscope" style="font-size: 150px; color: #4CAF50;"></i>
                    <p style="margin-top: 30px; font-size: 1.2rem; font-weight: 500;">Tecnología Avanzada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="hero-slide" data-slide-number="2" style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(102,126,234,0.8), rgba(118,75,162,0.8)), linear-gradient(45deg, #f093fb, #f5576c);
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
                  <h1 style="font-size: 4rem; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    PRECISIÓN
                    <br><span style="color: #FF6B6B;">GARANTIZADA</span>
                  </h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95;">
                    Reactivos certificados con los más altos estándares de calidad para resultados confiables.
                  </p>
                  <div class="hero-actions">
                    <button class="btn btn-danger btn-lg me-3" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-award"></i> Certificaciones
                    </button>
                    <button class="btn btn-outline-light btn-lg" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-download"></i> Catálogo
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hero-visual">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 80px; text-align: center; backdrop-filter: blur(10px);">
                    <i class="bi bi-award" style="font-size: 150px; color: #FF6B6B;"></i>
                    <p style="margin-top: 30px; font-size: 1.2rem; font-weight: 500;">Calidad Certificada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 3 -->
        <div class="hero-slide" data-slide-number="3" style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(67,206,162,0.8), rgba(24,90,157,0.8)), linear-gradient(45deg, #43cea2, #185a9d);
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
                  <h1 style="font-size: 4rem; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    SOPORTE
                    <br><span style="color: #43CEA2;">24/7</span>
                  </h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95;">
                    Acompañamiento técnico especializado en cada etapa de tu proyecto científico.
                  </p>
                  <div class="hero-actions">
                    <button class="btn btn-info btn-lg me-3" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-headset"></i> Contactar Soporte
                    </button>
                    <button class="btn btn-outline-light btn-lg" style="padding: 15px 30px; font-size: 1.1rem;">
                      <i class="bi bi-whatsapp"></i> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hero-visual">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 80px; text-align: center; backdrop-filter: blur(10px);">
                    <i class="bi bi-headset" style="font-size: 150px; color: #43CEA2;"></i>
                    <p style="margin-top: 30px; font-size: 1.2rem; font-weight: 500;">Soporte Especializado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button class="hero-nav hero-prev" onclick="heroSliderPrev(this)" style="
        position: absolute;
        left: 30px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 24px;
        padding: 15px 20px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        z-index: 10;
      ">
        <i class="bi bi-chevron-left"></i>
      </button>
      
      <button class="hero-nav hero-next" onclick="heroSliderNext(this)" style="
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 24px;
        padding: 15px 20px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        z-index: 10;
      ">
        <i class="bi bi-chevron-right"></i>
      </button>

      <!-- Dots Indicator -->
      <div class="hero-dots" style="
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 15px;
        z-index: 10;
      ">
        <button class="hero-dot active" onclick="heroSliderGoTo(this, 0)" style="
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid white;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
        "></button>
        <button class="hero-dot" onclick="heroSliderGoTo(this, 1)" style="
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
        "></button>
        <button class="hero-dot" onclick="heroSliderGoTo(this, 2)" style="
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
        "></button>
      </div>

      <!-- 🎮 SLIDER FUNCTIONALITY & EDITING SUPPORT -->
      <script>
        (function() {
          let currentSlide = 0;
          let autoPlayInterval;
          
          function initHeroSlider(container) {
            // 🎨 DETECCIÓN DE MODO EDICIÓN
            function isEditingMode() {
              return container.classList.contains('gjs-selected') || 
                     container.hasAttribute('data-editing') ||
                     window.location.pathname.includes('/page-builder/');
            }
            
            const slides = container.querySelectorAll('.hero-slide');
            const dots = container.querySelectorAll('.hero-dot');
            
            // 📝 EN MODO EDICIÓN: Hacer todos los slides visibles
            if (isEditingMode()) {
              console.log('🎨 Slider en modo edición - todos los slides visibles');
              container.setAttribute('data-editing', 'true');
              
              // Agregar indicadores visuales de edición
              slides.forEach((slide, index) => {
                slide.style.position = 'static';
                slide.style.opacity = '1';
                slide.style.marginBottom = '30px';
                slide.style.border = '3px dashed #28a745';
                slide.style.borderRadius = '10px';
                
                // Agregar título de slide
                const existingTitle = slide.querySelector('.slide-edit-title');
                if (!existingTitle) {
                  const title = document.createElement('div');
                  title.className = 'slide-edit-title';
                  title.innerHTML = \`✏️ SLIDE \${index + 1} - Click para editar contenido\`;
                  title.style.cssText = \`
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    right: 15px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: bold;
                    z-index: 1000;
                    text-align: center;
                    box-shadow: 0 3px 10px rgba(40, 167, 69, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  \`;
                  slide.style.position = 'relative';
                  slide.insertBefore(title, slide.firstChild);
                }
              });
              
              return; // No ejecutar funcionalidad de slider en modo edición
            }
            
            // 🎬 MODO PRODUCCIÓN: Funcionalidad normal del slider
            function showSlide(index) {
              slides.forEach((slide, i) => {
                slide.style.opacity = i === index ? '1' : '0';
              });
              
              dots.forEach((dot, i) => {
                dot.style.background = i === index ? 'white' : 'transparent';
                dot.classList.toggle('active', i === index);
              });
              
              currentSlide = index;
            }
            
            function nextSlide() {
              showSlide((currentSlide + 1) % slides.length);
            }
            
            function prevSlide() {
              showSlide((currentSlide - 1 + slides.length) % slides.length);
            }
            
            // Auto-play functions
            function startAutoPlay() {
              if (!isEditingMode()) {
                autoPlayInterval = setInterval(nextSlide, 5000);
              }
            }
            
            function stopAutoPlay() {
              clearInterval(autoPlayInterval);
            }
            
            // Global functions for navigation
            window.heroSliderNext = (btn) => {
              if (!isEditingMode()) {
                stopAutoPlay();
                nextSlide();
                setTimeout(startAutoPlay, 10000);
              }
            };
            
            window.heroSliderPrev = (btn) => {
              if (!isEditingMode()) {
                stopAutoPlay();
                prevSlide();
                setTimeout(startAutoPlay, 10000);
              }
            };
            
            window.heroSliderGoTo = (btn, index) => {
              if (!isEditingMode()) {
                stopAutoPlay();
                showSlide(index);
                setTimeout(startAutoPlay, 10000);
              }
            };
            
            // Start auto-play only in production mode
            if (!isEditingMode()) {
              startAutoPlay();
              
              // Pause on hover
              container.addEventListener('mouseenter', stopAutoPlay);
              container.addEventListener('mouseleave', startAutoPlay);
            }
          }
          
          // Initialize sliders
          function initAllSliders() {
            document.querySelectorAll('.hero-slider-container').forEach(initHeroSlider);
          }
          
          // Initialize when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAllSliders);
          } else {
            initAllSliders();
          }
          
          // Re-initialize when content changes (useful for GrapeJS)
          if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
              let shouldReinit = false;
              mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && 
                    mutation.target.classList && 
                    mutation.target.classList.contains('hero-slider-container')) {
                  shouldReinit = true;
                }
              });
              if (shouldReinit) {
                setTimeout(initAllSliders, 100);
              }
            });
            observer.observe(document.body, { childList: true, subtree: true });
          }
        })();
      </script>

      <!-- Animations CSS -->
      <style>
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hero-nav:hover {
          background: rgba(255,255,255,0.4) !important;
          transform: translateY(-50%) scale(1.1);
        }
        
        .hero-dot:hover {
          transform: scale(1.2);
        }
      </style>
    </section>
  `
}

/**
 * Video Background Hero Block
 * Hero banner with background video
 */
export const heroVideoBlock: HeroRevolutionBlock = {
  id: 'hero-video',
  label: 'Hero con Video',
  category: 'Hero Revolution',
  media: '<i class="bi bi-camera-video"></i>',
  content: `
    <section class="hero-video-container" style="position: relative; height: 100vh; overflow: hidden;">
      <!-- Video Background -->
      <video 
        autoplay 
        muted 
        loop 
        playsinline
        style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translate(-50%, -50%);
          z-index: 1;
        "
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-laboratory-research-with-microscope-5321-large.mp4" type="video/mp4">
        <!-- Fallback background -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        "></div>
      </video>
      
      <!-- Overlay -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        z-index: 2;
      "></div>
      
      <!-- Content -->
      <div style="
        position: relative;
        z-index: 3;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto text-center">
              <h1 style="
                font-size: 5rem;
                font-weight: bold;
                margin-bottom: 30px;
                text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
                animation: fadeInUp 1s ease-out;
              ">
                LABORATORIO
                <br><span style="color: #4CAF50;">DEL FUTURO</span>
              </h1>
              <p style="
                font-size: 1.5rem;
                margin-bottom: 40px;
                opacity: 0.95;
                text-shadow: 1px 1px 4px rgba(0,0,0,0.7);
                animation: fadeInUp 1s ease-out 0.3s both;
              ">
                Descubre las tecnologías más avanzadas en investigación científica
                <br>Equipamiento de última generación para resultados excepcionales
              </p>
              <div style="animation: fadeInUp 1s ease-out 0.6s both;">
                <button class="btn btn-success btn-lg me-3" style="
                  padding: 20px 40px;
                  font-size: 1.2rem;
                  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
                ">
                  <i class="bi bi-play-circle"></i> Ver Tecnologías
                </button>
                <button class="btn btn-outline-light btn-lg" style="
                  padding: 20px 40px;
                  font-size: 1.2rem;
                  backdrop-filter: blur(10px);
                  background: rgba(255,255,255,0.1);
                  border: 2px solid rgba(255,255,255,0.5);
                ">
                  <i class="bi bi-arrow-down-circle"></i> Explorar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div style="
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        color: white;
        text-align: center;
        animation: bounce 2s infinite;
      ">
        <div style="margin-bottom: 10px; font-size: 0.9rem; opacity: 0.8;">Desliza para explorar</div>
        <i class="bi bi-chevron-down" style="font-size: 24px;"></i>
      </div>
      
      <!-- Video Controls -->
      <div style="
        position: absolute;
        bottom: 30px;
        right: 30px;
        z-index: 3;
      ">
        <button onclick="toggleVideo(this)" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 12px 15px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        ">
          <i class="bi bi-pause" data-play="bi-play" data-pause="bi-pause"></i>
        </button>
      </div>

      <script>
        function toggleVideo(btn) {
          const video = btn.closest('.hero-video-container').querySelector('video');
          const icon = btn.querySelector('i');
          
          if (video.paused) {
            video.play();
            icon.className = icon.getAttribute('data-pause');
          } else {
            video.pause();
            icon.className = icon.getAttribute('data-play');
          }
        }
      </script>

      <style>
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }
      </style>
    </section>
  `
}

/**
 * Parallax Hero Block
 * Hero banner with parallax scrolling effect
 */
export const heroParallaxBlock: HeroRevolutionBlock = {
  id: 'hero-parallax',
  label: 'Hero Parallax',
  category: 'Hero Revolution',
  media: '<i class="bi bi-layers"></i>',
  content: `
    <section class="hero-parallax-container" style="position: relative; height: 100vh; overflow: hidden;">
      <!-- Parallax Layers -->
      <div class="parallax-layer parallax-back" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 120%;
        height: 120%;
        background: repeating-linear-gradient(45deg, #667eea 0px, #667eea 20px, #764ba2 20px, #764ba2 40px);
        transform: translateZ(0);
      "></div>
      
      <div class="parallax-layer parallax-mid" style="
        position: absolute;
        top: -10%;
        left: -10%;
        width: 120%;
        height: 120%;
        background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 100px, transparent 100px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.05) 150px, transparent 150px);
        transform: translateZ(0);
      "></div>
      
      <!-- Gradient Overlay -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.8) 100%);
        z-index: 1;
      "></div>
      
      <!-- Main Content -->
      <div style="
        position: relative;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <div class="hero-content" style="animation: slideInLeft 1.2s ease-out;">
                <div style="
                  display: inline-block;
                  background: rgba(255,255,255,0.1);
                  padding: 8px 20px;
                  border-radius: 30px;
                  margin-bottom: 20px;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255,255,255,0.2);
                ">
                  <i class="bi bi-star"></i> Tecnología Premiada
                </div>
                <h1 style="
                  font-size: 4.5rem;
                  font-weight: 800;
                  margin-bottom: 25px;
                  text-shadow: 2px 2px 10px rgba(0,0,0,0.3);
                  line-height: 1.1;
                ">
                  REVOLUCIÓN
                  <br><span style="color: #FFD700;">CIENTÍFICA</span>
                </h1>
                <p style="
                  font-size: 1.4rem;
                  margin-bottom: 35px;
                  opacity: 0.95;
                  line-height: 1.6;
                ">
                  Impulsa tu investigación con tecnología de vanguardia.
                  <br>Resultados precisos, procesos optimizados, futuro asegurado.
                </p>
                <div class="hero-stats" style="
                  display: flex;
                  gap: 40px;
                  margin-bottom: 35px;
                  animation: fadeInUp 1s ease-out 0.8s both;
                ">
                  <div style="text-align: center;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: #FFD700;">500+</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Laboratorios</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: #4CAF50;">99.9%</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Precisión</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: #FF6B6B;">24/7</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Soporte</div>
                  </div>
                </div>
                <div style="animation: slideInUp 1s ease-out 1s both;">
                  <button class="btn btn-warning btn-lg me-3" style="
                    padding: 18px 35px;
                    font-size: 1.1rem;
                    color: #333;
                    font-weight: 600;
                    box-shadow: 0 8px 25px rgba(255,215,0,0.3);
                    border: none;
                  ">
                    <i class="bi bi-rocket-takeoff"></i> Comenzar Ahora
                  </button>
                  <button class="btn btn-outline-light btn-lg" style="
                    padding: 18px 35px;
                    font-size: 1.1rem;
                    backdrop-filter: blur(10px);
                    background: rgba(255,255,255,0.1);
                    border: 2px solid rgba(255,255,255,0.3);
                  ">
                    <i class="bi bi-info-circle"></i> Más Información
                  </button>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="hero-visual" style="animation: slideInRight 1.2s ease-out 0.4s both;">
                <div style="
                  position: relative;
                  text-align: center;
                  transform: perspective(1000px) rotateY(-15deg);
                ">
                  <!-- Floating Elements -->
                  <div style="
                    position: absolute;
                    top: 20%;
                    left: 10%;
                    width: 80px;
                    height: 80px;
                    background: rgba(255,215,0,0.2);
                    border-radius: 50%;
                    animation: float 3s ease-in-out infinite;
                  "></div>
                  <div style="
                    position: absolute;
                    top: 60%;
                    right: 15%;
                    width: 60px;
                    height: 60px;
                    background: rgba(76,175,80,0.2);
                    border-radius: 50%;
                    animation: float 3s ease-in-out infinite 1s;
                  "></div>
                  
                  <!-- Main Visual -->
                  <div style="
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                    border-radius: 30px;
                    padding: 60px;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.2);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                  ">
                    <i class="bi bi-cpu" style="
                      font-size: 180px;
                      color: #FFD700;
                      display: block;
                      margin-bottom: 20px;
                      animation: pulse 2s ease-in-out infinite;
                    "></i>
                    <h4 style="font-weight: 600; margin-bottom: 15px;">IA Integrada</h4>
                    <p style="opacity: 0.8; font-size: 1rem;">
                      Análisis automatizado con inteligencia artificial
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Parallax Script -->
      <script>
        function initParallax() {
          const container = document.querySelector('.hero-parallax-container');
          if (!container) return;
          
          function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            const rateMiddle = scrolled * -0.3;
            
            const backLayer = container.querySelector('.parallax-back');
            const midLayer = container.querySelector('.parallax-mid');
            
            if (backLayer) {
              backLayer.style.transform = 'translate3d(0, ' + rate + 'px, 0)';
            }
            if (midLayer) {
              midLayer.style.transform = 'translate3d(0, ' + rateMiddle + 'px, 0)';
            }
          }
          
          window.addEventListener('scroll', updateParallax);
        }
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initParallax);
        } else {
          initParallax();
        }
      </script>

      <style>
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </section>
  `
}

/**
 * Complete collection of Hero Revolution blocks
 */
export const heroRevolutionBlocks: HeroRevolutionBlock[] = [
  heroSliderBlock,
  heroVideoBlock,
  heroParallaxBlock
]

/**
 * Register all Hero Revolution blocks in GrapeJS
 */
export function registerHeroRevolutionBlocks(editor: Editor) {
  const blockManager = editor.BlockManager
  
  // Register each hero block
  heroRevolutionBlocks.forEach(block => {
    blockManager.add(block.id, {
      label: block.label,
      category: block.category,
      media: block.media,
      content: block.content,
      attributes: block.attributes || {}
    })
  })
}