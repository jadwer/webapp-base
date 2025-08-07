# Page Builder Pro - ROADMAP

## 📋 Estado Actual
**Módulo**: `src/modules/page-builder-pro/`  
**Fecha**: 2025-01-06  
**Estado**: En desarrollo activo

### ✅ **Completado**
- [x] Editor GrapeJS configurado con plugins personalizados
- [x] Bloques Bootstrap UI (Alert, Card, Modal, etc.)
- [x] Formularios extensos (Input, Select, Date, etc.)
- [x] Sistema de almacenamiento local (localStorage)
- [x] Exportación HTML y React TSX
- [x] Sistema de notificaciones (ToastNotifier)
- [x] Integración Bootstrap Icons
- [x] Análisis de endpoints API para páginas
- [x] **ADMINISTRACIÓN DE PÁGINAS (CRUD)** ✨
  - [x] Servicios API con JSON:API
  - [x] Hooks con SWR para cache inteligente
  - [x] Tabla con filtros y paginación
  - [x] Formularios crear/editar con validaciones
  - [x] Editor GrapeJS integrado
  - [x] Estados y badges visuales
  - [x] Confirmación de eliminaciones
  - [x] Duplicación de páginas
  - [x] Rutas Next.js 15 configuradas
  - [x] Build sin errores ✅

### 🚧 **En Progreso**
- [ ] **LISTO PARA PROBAR** 🧪 Funcionalidad en http://localhost:3000/dashboard/pages

---

## 🎯 **Tareas Pendientes**

### **1. Administración de Páginas** 📝
**Estado**: Pendiente  
**Prioridad**: Alta

#### Funcionalidades:
- [ ] **Listar páginas**: Tabla con paginación
- [ ] **Crear página**: Formulario + integración GrapeJS  
- [ ] **Editar página**: Cargar contenido existente en editor
- [ ] **Eliminar página**: Confirmación + eliminación
- [ ] **Filtros**: Por título, slug, status, fecha
- [ ] **Estados**: draft, published, archived

#### API Schema Confirmado:
```typescript
interface Page {
  id: string
  title: string        // required
  slug: string         // required  
  html: string         // required
  css: string          // ✅ CONFIRMADO en API
  json: object         // ✅ CONFIRMADO en API (GrapeJS data)
  status: string       // required
  created_at: datetime // ✅ CONFIRMADO
  updated_at: datetime // ✅ CONFIRMADO
  // user_id: NO aparece en documentación
}
```

#### Endpoints Disponibles:
- `GET /api/v1/pages` - Listar
- `POST /api/v1/pages` - Crear
- `GET /api/v1/pages/{id}` - Obtener
- `PATCH /api/v1/pages/{id}` - Actualizar  
- `DELETE /api/v1/pages/{id}` - Eliminar

---

### **2. Actualizar Design System** 🎨
**Estado**: Pendiente  
**Prioridad**: Media

#### Tareas:
- [ ] Revisar componentes UI existentes en `src/ui/`
- [ ] Migrar ToastNotifier a usar Design System
- [ ] Crear componentes CRUD reutilizables:
  - [ ] DataTable con paginación
  - [ ] ConfirmDialog
  - [ ] FormModal
  - [ ] StatusBadge
- [ ] Actualizar estilos para consistencia visual

---

### **3. Hero Banner / Revolution Slider** 🖼️
**Estado**: Pendiente  
**Prioridad**: Media

#### Funcionalidades:
- [ ] Plugin GrapeJS para hero sections
- [ ] Slider/Carousel components
- [ ] Backgrounds dinámicos (imagen, video, gradient)
- [ ] Animaciones y transiciones
- [ ] Responsive design automático
- [ ] Biblioteca de templates prediseñados

---

### **4. Página Template/Test** ✨
**Estado**: Pendiente  
**Prioridad**: Baja

#### Contenido:
- [ ] Landing page profesional de demostración
- [ ] Showcase de todos los componentes disponibles
- [ ] Ejemplos de uso del page builder
- [ ] Documentación visual integrada

---

## 🔧 **Consideraciones Técnicas**

### **Campos API Adicionales Detectados**
- ✅ `css` (string) - Para estilos del editor
- ✅ `json` (object) - Para datos GrapeJS 
- ✅ `created_at`, `updated_at` - Timestamps
- ❌ `user_id` - NO aparece en documentación API

### **Integración con Módulos Existentes**
- **Auth**: Bearer token automático via axios interceptor
- **Design System**: Componentes en `src/ui/`
- **JSON:API**: Headers y formato estándar

---

## 📅 **Próximos Pasos Inmediatos**

1. ✅ **Confirmar campos API**: `css`, `json` encontrados
2. 🎯 **Implementar CRUD básico**: Servicios + Componentes  
3. 🔄 **Integrar con GrapeJS**: Cargar/guardar contenido
4. 🎨 **Aplicar Design System**: Consistencia visual
5. 🧪 **Testing**: Verificar funcionalidades

---

## 📌 **Notas**
- Usar JSON:API format para todas las requests
- Mantener compatibilidad con arquitectura modular
- Priorizar UX/UI profesional para demo
- Documentar patrones reutilizables

**Actualizado**: 2025-01-06