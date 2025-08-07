# Page Builder Pro - ROADMAP

## 📋 Estado Actual
**Módulo**: `src/modules/page-builder-pro/`  
**Fecha**: 2025-01-07  
**Estado**: ✅ **FUNCIONAL Y OPERATIVO**

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
- [x] **FUNCIONALIDAD COMPLETA DE ADMINISTRACIÓN** ✨
  - [x] Listar páginas con tabla avanzada (filtros, búsqueda, paginación)
  - [x] Crear páginas con editor visual integrado
  - [x] Editar páginas con carga de contenido existente
  - [x] Eliminar páginas con confirmación
  - [x] Duplicar páginas funcionando
  - [x] Estados visuales con badges (draft/published)
  - [x] Validación en tiempo real de slugs
  - [x] Sistema de navegación con progress indicators
- [x] **RENDERIZADO PÚBLICO FUNCIONANDO** 🌐
  - [x] Páginas públicas en `/p/[slug]` operativas
  - [x] CSS injection sin conflictos de hidratación
  - [x] Bootstrap integrado globalmente
  - [x] Contenido GrapeJS renderizado correctamente

### 🎉 **COMPLETAMENTE FUNCIONAL**
- ✅ **Administración**: http://localhost:3000/dashboard/pages
- ✅ **Editor**: http://localhost:3000/dashboard/page-builder/[id]  
- ✅ **Páginas públicas**: http://localhost:3000/p/[slug]

---

## 🎯 **Tareas Pendientes**

### **1. ✅ Administración de Páginas** 📝
**Estado**: ✅ **COMPLETADO**  
**Prioridad**: ~~Alta~~ → **TERMINADO**

#### Funcionalidades:
- [x] **Listar páginas**: Tabla con paginación ✅
- [x] **Crear página**: Formulario + integración GrapeJS ✅
- [x] **Editar página**: Cargar contenido existente en editor ✅
- [x] **Eliminar página**: Confirmación + eliminación ✅
- [x] **Filtros**: Por título, slug, status, fecha ✅
- [x] **Estados**: draft, published ✅

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

### **2. ✅ Design System Integration** 🎨
**Estado**: ✅ **COMPLETADO**  
**Prioridad**: ~~Alta~~ → **TERMINADO**

#### Tareas Completadas:
- [x] ✅ Componentes UI migrados en `src/ui/`
- [x] ✅ ToastNotifier migrado a Design System
- [x] ✅ Componentes CRUD reutilizables creados:
  - [x] ✅ DataTable con paginación y TypeScript generics
  - [x] ✅ ConfirmModal con portal rendering
  - [x] ✅ Modal base component
  - [x] ✅ StatusBadge con variants
  - [x] ✅ Badge component con icons
  - [x] ✅ Toast system completo
- [x] ✅ Estilos actualizados para consistencia visual
- [x] ✅ User relationship tracking implementado (JSON:API)
- [x] ✅ HTML cleaning utilities para exports
- [x] ✅ Navigation progress con SSG compatibility

---

### **3. Soft Delete & Slug Management System** 🗑️
**Estado**: Pendiente  
**Prioridad**: **Alta** (Siguiente tarea)

#### Funcionalidades Acordadas:
- [ ] **Estado 'deleted'**: Agregar a PageStatus type
- [ ] **Soft Delete**: Cambiar status + transformar slug
- [ ] **Slug Transformation**: `original-slug-deleted-{timestamp}`
- [ ] **Unique Slug Generation**: Auto-increment para duplicados
- [ ] **Slug Validation**: Tiempo real + sugerencias
- [ ] **Admin Panel**: Gestión de páginas eliminadas
- [ ] **Recovery System**: Restaurar páginas eliminadas

#### Implementación Técnica:
```typescript
// Nuevo type
type PageStatus = 'draft' | 'published' | 'archived' | 'deleted'

// Servicios a crear
- softDeletePage(id: string): Promise<Page>
- generateUniqueSlug(baseSlug: string): Promise<string>
- restorePage(id: string): Promise<Page>
- getDeletedPages(): Promise<Page[]>
```

---

### **4. Hero Banner / Revolution Slider** 🖼️
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

### **5. Página Template/Test** ✨
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

1. ✅ ~~**Confirmar campos API**~~: COMPLETADO
2. ✅ ~~**Implementar CRUD básico**~~: COMPLETADO  
3. ✅ ~~**Integrar con GrapeJS**~~: COMPLETADO
4. ✅ ~~**Aplicar Design System**~~: COMPLETADO
5. 🎯 **SIGUIENTE: Soft Delete & Slug Management**: Sistema completo de eliminación y manejo de slugs
6. 🎨 **Después: Hero Banner Creator**: Plugin visual para sliders/banners
7. ✨ **Finalmente: Página Template**: Showcase profesional

---

## 📌 **Notas**
- Usar JSON:API format para todas las requests
- Mantener compatibilidad con arquitectura modular
- Soft delete con transformación de slugs para evitar conflictos
- Implementar validación en tiempo real de slugs
- Priorizar UX/UI profesional para demo
- Documentar patrones reutilizables

**Actualizado**: 2025-01-07