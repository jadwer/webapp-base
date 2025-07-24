/**
 * Componente de prueba para verificar que Bootstrap Icons funciona correctamente
 * Puedes usar este componente para probar diferentes iconos
 */

export default function IconTest() {
  return (
    <div className="p-4">
      <h2 className="mb-3">🎯 Prueba de Bootstrap Icons</h2>
      
      <div className="row g-3">
        <div className="col-auto">
          <i className="bi bi-house-door fs-1 text-primary"></i>
          <div className="small">bi-house-door</div>
        </div>
        
        <div className="col-auto">
          <i className="bi bi-person-circle fs-1 text-success"></i>
          <div className="small">bi-person-circle</div>
        </div>
        
        <div className="col-auto">
          <i className="bi bi-gear fs-1 text-warning"></i>
          <div className="small">bi-gear</div>
        </div>
        
        <div className="col-auto">
          <i className="bi bi-heart-fill fs-1 text-danger"></i>
          <div className="small">bi-heart-fill</div>
        </div>
        
        <div className="col-auto">
          <i className="bi bi-star-fill fs-1 text-info"></i>
          <div className="small">bi-star-fill</div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3>✅ Configuración Mejorada</h3>
        <ul className="list-unstyled">
          <li>• Bootstrap Icons importado desde SASS</li>
          <li>• Fuentes servidas desde <code>/public/fonts/</code></li>
          <li>• Script automático para actualizar fuentes</li>
          <li>• Sin duplicación de archivos</li>
          <li>• Configuración estándar y mantenible</li>
        </ul>
      </div>
    </div>
  );
}
