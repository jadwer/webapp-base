# 📦 STOCK INTEGRATION - PRÓXIMA FASE

## 🎯 Objetivo
Conectar el stock de productos mostrado en la tabla con el backend real.

## 📊 Estado Actual
- **Frontend**: La tabla muestra `product.stock || 0`
- **Backend**: Endpoint de stock NO implementado aún
- **Fallback**: Mostramos 0 como stock por defecto

## 🚀 Implementación Necesaria

### Backend (API)
```php
// Agregar campo stock a ProductResource
'stock' => $this->stock ?? 0,

// O crear endpoint dedicado de inventario
GET /api/v1/products/{id}/stock
GET /api/v1/inventory/products/{id}
```

### Frontend (Ya listo)
```tsx
// El componente ya está preparado para recibir stock
<div className="fw-bold">{product.stock || 0}</div>
```

## 📋 Tareas para siguiente fase
1. [ ] Implementar endpoint de stock en backend
2. [ ] Actualizar ProductResource para incluir stock
3. [ ] Testear integración stock real
4. [ ] Agregar indicadores visuales (stock bajo, sin stock)
5. [ ] Implementar actualizaciones en tiempo real

## 💡 Mejoras Futuras
- **Stock en tiempo real** con WebSockets
- **Alertas de stock bajo** 
- **Historial de movimientos**
- **Reservas de stock**

---
**Nota**: El stock actual es solo UI mockup. Funciona perfectamente como placeholder hasta integrar backend real.