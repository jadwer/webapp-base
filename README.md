# Proyecto Base Frontend – `webapp-base`

Plantilla oficial de Atomo Soluciones para proyectos frontend modulares y escalables.

Este proyecto está construido con Next.js App Router y está diseñado para servir como base para nuevos ERPs, sistemas internos o plataformas web reutilizando módulos desacoplados.

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

## Módulos incluidos

- **`auth`** (sistema de autenticación completo con Sanctum)
- **`roles`** (gestión de roles y permisos - Permission Manager)
- **`page-builder`** (constructor de páginas con GrapeJS)
- **`inventory`** (ejemplo funcional con componentes, hooks y servicios)

---

## Estructura destacada

- `src/modules`: módulos independientes y portables
- `src/ui`: Design System base (atm-ui)
- `src/lib`: funciones y clientes API reutilizables

---

## Recomendación

Este proyecto está diseñado para integrarse con `api-base`, el backend modular de Atomo Soluciones.
