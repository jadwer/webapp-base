import type { Editor } from 'grapesjs';

export default function plugin(editor: Editor) {
  const categoryUi = '🎨 UI';

  // ALERT
  editor.BlockManager.add('alert', {
    label: '<i class="bi bi-exclamation-triangle-fill me-2" style="font-size:2rem;"></i> Alert',
    category: categoryUi,
    content: `
      <div class="alert alert-warning" role="alert">
        ¡Atención! Este es un mensaje de alerta.
      </div>
    `.trim(),
  });

  // BADGE
  editor.BlockManager.add('badge', {
    label: '<i class="bi bi-award-fill me-2" style="font-size:2rem;"></i> Badge',
    category: categoryUi,
    content: `<span class="badge bg-success">Nuevo</span>`.trim(),
  });

  // CARD
  editor.BlockManager.add('card', {
    label: '<i class="bi bi-card-text me-2" style="font-size:2rem;"></i> Card',
    category: categoryUi,
    content: `
      <div class="card" style="width: 18rem;">
        <img src="https://via.placeholder.com/286x180" class="card-img-top" alt="Imagen" />
        <div class="card-body">
          <h5 class="card-title">Título de la tarjeta</h5>
          <p class="card-text">Texto de ejemplo dentro de la tarjeta.</p>
          <a href="#" class="btn btn-primary">Acción</a>
        </div>
      </div>
    `.trim(),
  });

  // SPINNER
  editor.BlockManager.add('spinner', {
    label: '<i class="bi bi-arrow-repeat me-2" style="font-size:2rem;"></i> Spinner',
    category: categoryUi,
    content: `
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    `.trim(),
  });

  // PROGRESS
  editor.BlockManager.add('progress-bar', {
    label: '<i class="bi bi-bar-chart-steps me-2" style="font-size:2rem;"></i> Progress',
    category: categoryUi,
    content: `
      <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: 60%;" aria-valuenow="60"
          aria-valuemin="0" aria-valuemax="100">60%</div>
      </div>
    `.trim(),
  });

  // ACCORDION (HTML moderno)
  editor.BlockManager.add('accordion', {
    label: '<i class="bi bi-list-columns-reverse me-2" style="font-size:2rem;"></i> Accordion',
    category: categoryUi,
    content: `
      <details open>
        <summary><strong>Sección desplegable</strong></summary>
        <div class="mt-2">Contenido interno de la sección.</div>
      </details>
    `.trim(),
  });

  // MODAL (HTML moderno)
  editor.BlockManager.add('modal', {
    label: '<i class="bi bi-window-fullscreen me-2" style="font-size:2rem;"></i> Modal',
    category: categoryUi,
    content: `
      <button onclick="document.getElementById('myModal').showModal()" class="btn btn-primary">Abrir modal</button>
      <dialog id="myModal">
        <h3>Este es un diálogo modal</h3>
        <p>Contenido del modal</p>
        <button onclick="document.getElementById('myModal').close()" class="btn btn-secondary">Cerrar</button>
      </dialog>
    `.trim(),
  });

  // TOAST (HTML moderno / simple)
  editor.BlockManager.add('toast', {
    label: '<i class="bi bi-chat-left-text-fill me-2" style="font-size:2rem;"></i> Toast',
    category: categoryUi,
    content: `
      <aside role="alert" class="position-fixed bottom-0 end-0 m-4 bg-primary text-white p-3 rounded shadow">
        <strong>¡Hola!</strong> Este es un toast de ejemplo.
      </aside>
    `.trim(),
  });

  // TABS (HTML moderno con details)
  editor.BlockManager.add('tabs', {
    label: '<i class="bi bi-segmented-nav me-2" style="font-size:2rem;"></i> Tabs',
    category: categoryUi,
    content: `
      <details open>
        <summary><strong>Tab 1</strong></summary>
        <p>Contenido del tab 1</p>
      </details>
      <details>
        <summary><strong>Tab 2</strong></summary>
        <p>Contenido del tab 2</p>
      </details>
    `.trim(),
  });

  // NAVBAR (HTML moderno, responsivo simple)
  editor.BlockManager.add('navbar', {
    label: '<i class="bi bi-menu-button-wide-fill me-2" style="font-size:2rem;"></i> Navbar',
    category: categoryUi,
    content: `
      <nav class="navbar navbar-expand-lg navbar-light bg-light px-3">
        <a class="navbar-brand" href="#">Mi Sitio</a>
        <details class="ms-auto d-lg-none">
          <summary class="btn btn-outline-secondary">☰</summary>
          <ul class="navbar-nav">
            <li><a class="nav-link" href="#">Inicio</a></li>
            <li><a class="nav-link" href="#">Acerca de</a></li>
          </ul>
        </details>
        <ul class="navbar-nav d-none d-lg-flex ms-auto">
          <li><a class="nav-link" href="#">Inicio</a></li>
          <li><a class="nav-link" href="#">Acerca de</a></li>
        </ul>
      </nav>
    `.trim(),
  });
}
