import type { Editor } from 'grapesjs';

export default function blocksFormsExtended(editor: Editor) {
  const bm = editor.BlockManager;

  // Inyectar Bootstrap Icons si no existen
  editor.on('load', () => {
    const head = document.head;
    const existingLink = head.querySelector('link[href*="bootstrap-icons"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
      head.appendChild(link);
    }
  });

  const formCategory = '📰 Formulario';

  bm.add('form', {
    label: '<i class="bi bi-ui-checks-grid me-2" style="font-size:2rem;"></i> Formulario',
    category: formCategory,
    content: `
      <div class="p-3 border rounded">
        <form class="form">
          <div class="mb-3">
            <label for="name" class="form-label">Nombre</label>
            <input type="text" class="form-control" id="name" name="name" placeholder="Tu nombre" />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Correo</label>
            <input type="email" class="form-control" id="email" name="email" placeholder="ejemplo@correo.com" />
          </div>
          <div class="mb-3">
            <button type="submit" class="btn btn-primary">Enviar</button>
          </div>
        </form>
      </div>`,
  });

  bm.add('input', {
    label: '<i class="bi bi-input-cursor-text me-2" style="font-size:2rem;"></i> Campo Texto',
    category: formCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Texto</label>
        <input type="text" class="form-control" placeholder="Texto..." />
      </div>`,
  });

  bm.add('password', {
    label: '<i class="bi bi-shield-lock me-2" style="font-size:2rem;"></i> Contraseña',
    category: formCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Contraseña</label>
        <input type="password" class="form-control" placeholder="Contraseña" />
      </div>`,
  });

  bm.add('email', {
    label: '<i class="bi bi-envelope-at me-2" style="font-size:2rem;"></i> Correo',
    category: formCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Correo</label>
        <input type="email" class="form-control" placeholder="ejemplo@correo.com" />
      </div>`,
  });

  bm.add('textarea', {
    label: '<i class="bi bi-stickies me-2" style="font-size:2rem;"></i> Área Texto',
    category: formCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Mensaje</label>
        <textarea class="form-control" rows="4" placeholder="Escribe aquí..."></textarea>
      </div>`,
  });

  bm.add('label', {
    label: '<i class="bi bi-tag me-2" style="font-size:2rem;"></i> Etiqueta',
    category: formCategory,
    content: '<label class="form-label">Campo</label>',
  });

  bm.add('select', {
    label: '<i class="bi bi-list-columns me-2" style="font-size:2rem;"></i> Select',
    category: formCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Seleccione una opción</label>
        <select class="form-select">
          <option>Opción 1</option>
          <option>Opción 2</option>
        </select>
      </div>`,
  });

  bm.add('checkbox', {
    label: '<i class="bi bi-check-square me-2" style="font-size:2rem;"></i> Checkbox',
    category: formCategory,
    content: `
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="check1" />
        <label class="form-check-label" for="check1">Acepto términos</label>
      </div>`,
  });

  bm.add('radio', {
    label: '<i class="bi bi-record-circle me-2" style="font-size:2rem;"></i> Radio',
    category: formCategory,
    content: `
      <div class="form-check mb-2">
        <input class="form-check-input" type="radio" name="radio" id="radio1" />
        <label class="form-check-label" for="radio1">Opción A</label>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="radio" name="radio" id="radio2" />
        <label class="form-check-label" for="radio2">Opción B</label>
      </div>`,
  });

  bm.add('submit', {
    label: '<i class="bi bi-send-plus me-2" style="font-size:2rem;"></i> Botón Enviar',
    category: formCategory,
    content: '<button type="submit" class="btn btn-primary">Enviar</button>',
  });

  bm.add('fieldset', {
    label: '<i class="bi bi-box me-2" style="font-size:2rem;"></i> Fieldset',
    category: formCategory,
    content: `
      <fieldset class="border p-3 mb-3">
        <legend class="w-auto px-2">Información</legend>
        <input class="form-control" placeholder="..." />
      </fieldset>`,
  });

  bm.add('legend', {
    label: '<i class="bi bi-text-paragraph me-2" style="font-size:2rem;"></i> Leyenda',
    category: formCategory,
    content: '<legend class="w-auto px-2">Título del grupo</legend>',
  });

  bm.add('hidden', {
    label: '<i class="bi bi-eye-slash me-2" style="font-size:2rem;"></i> Campo Oculto',
    category: formCategory,
    content: '<input type="hidden" name="token" value="12345" />',
  });

  const advancedCategory = '⚙️ Avanzado';

  bm.add('date', {
    label: '<i class="bi bi-calendar-date me-2" style="font-size:2rem;"></i> Fecha',
    category: advancedCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Fecha</label>
        <input type="date" class="form-control" />
      </div>`,
  });

  bm.add('range', {
    label: '<i class="bi bi-sliders me-2" style="font-size:2rem;"></i> Rango',
    category: advancedCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Seleccionar rango</label>
        <input type="range" class="form-range" />
      </div>`,
  });

  bm.add('color', {
    label: '<i class="bi bi-palette2 me-2" style="font-size:2rem;"></i> Color',
    category: advancedCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Color</label>
        <input type="color" class="form-control form-control-color" />
      </div>`,
  });

  bm.add('number', {
    label: '<i class="bi bi-123 me-2" style="font-size:2rem;"></i> Número',
    category: advancedCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Número</label>
        <input type="number" class="form-control" placeholder="0" />
      </div>`,
  });

  bm.add('file', {
    label: '<i class="bi bi-paperclip me-2" style="font-size:2rem;"></i> Archivo',
    category: advancedCategory,
    content: `
      <div class="mb-3">
        <label class="form-label">Archivo</label>
        <input type="file" class="form-control" />
      </div>`,
  });
}
