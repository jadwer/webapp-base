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
- **`products`** ⭐ **ENTERPRISE MODULE** - Sistema avanzado de gestión con:
  - **5 vistas virtualizadas** (Table, Grid, List, Compact, Showcase)
  - **Performance excepcional** con TanStack Virtual + React.memo + Zustand
  - **UX profesional** con filtros inteligentes y zero re-renders
  - **4 entidades completas** (Product, Unit, Category, Brand)
  - **CRUD completo** con integración JSON:API
- **`inventory`** - Ejemplo funcional con componentes, hooks y servicios

---

## Estructura destacada

- `src/modules`: módulos independientes y portables
- `src/ui`: Design System base (atm-ui)
- `src/lib`: funciones y clientes API reutilizables

---

## Recomendación

Este proyecto está diseñado para integrarse con `api-base`, el backend modular de Atomo Soluciones.
