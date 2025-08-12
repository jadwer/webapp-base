# 🚀 Proyecto Base Frontend – `webapp-base`

**Plantilla oficial de Atomo Soluciones** para proyectos frontend modulares y escalables con **arquitectura enterprise**.

Este proyecto está construido con **Next.js App Router** y está diseñado para servir como base para nuevos ERPs, sistemas internos o plataformas web reutilizando módulos desacoplados y **componentes de nivel enterprise**.

---

## 🚀 Build de Producción

El proyecto está completamente listo para producción. Para generar el build:

```bash
npm run build
npm start
```

📖 **Guía completa de despliegue:** [`PRODUCTION_DEPLOYMENT.md`](./PRODUCTION_DEPLOYMENT.md)

---

## Documentación Completa

Consulta la documentación técnica completa en:

[`docs/README.PROYECTO_BASE_LWM_WEBAPP.md`](./docs/README.PROYECTO_BASE_LWM_WEBAPP.md)

---

## Inicio rápido

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

---

## ✨ Módulos Enterprise Incluidos

- **`auth`** - Sistema de autenticación completo con Laravel Sanctum
- **`roles`** - Gestión de roles y permisos (Permission Manager)
- **`page-builder-pro`** - Constructor visual de páginas con GrapeJS (CRUD completo)
- **`products`** ⭐ **ENTERPRISE MODULE** - Sistema completo de gestión con:
  - **🏆 4 entidades completas** (Products, Categories, Brands, Units)
  - **🚀 5 vistas virtualizadas** en cada entidad (Table, Grid, List, Compact, Showcase)
  - **⚡ Performance excepcional** con TanStack Virtual + React.memo + Zustand
  - **🎯 Zero re-renders** con UI state separation 
  - **🛡️ Error handling enterprise** con FK constraint detection
  - **📱 UX profesional** con filtros debounced y focus preservation
  - **🔗 JSON:API completo** con relationship handling
  - **✨ Toast notifications** con DOM directo y animaciones CSS
- **`inventory`** ⭐ **ENTERPRISE MODULE** - Sistema de gestión de inventario con:
  - **🏆 Warehouses completo** (Iteración 1 + 1.5 completadas)
  - **🚀 5 vistas virtualizadas** (Table, Grid, List, Compact, Showcase)  
  - **⚡ Performance optimization** para 500K+ registros con TanStack Virtual
  - **🎨 Professional UI/UX** con hero cards, animations y responsive design
  - **🛡️ Enterprise error handling** y toast notifications
  - **🔗 JSON:API integration** con business rules validation

### 🎊 **Nuevo: Sistema de Error Handling Enterprise**
- **FK Constraint Detection** automática para eliminaciones
- **User-friendly messages** específicos por entidad
- **Beautiful toast notifications** con animaciones profesionales
- **Graceful error handling** sin crashes del sistema
- **Professional UX** con modales de confirmación elegantes

---

## Estructura destacada

- `src/modules`: módulos independientes y portables
- `src/ui`: Design System base (atm-ui)
- `src/lib`: funciones y clientes API reutilizables

---

## Recomendación

Este proyecto está diseñado para integrarse con `api-base`, el backend modular de Atomo Soluciones.
