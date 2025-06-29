# Proyecto Base Frontend – `webapp-base`

Plantilla oficial de Atomo Soluciones para proyectos frontend modulares y escalables.

Este proyecto está construido con Next.js App Router y está diseñado para servir como base para nuevos ERPs, sistemas internos o plataformas web reutilizando módulos desacoplados.

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

- `inventory` (ejemplo funcional con componentes, hooks y servicios)
- `page-builder` (estructura inicial vacía)

---

## Estructura destacada

- `src/modules`: módulos independientes y portables
- `src/ui`: Design System base (atm-ui)
- `src/lib`: funciones y clientes API reutilizables

---

## Recomendación

Este proyecto está diseñado para integrarse con `api-base`, el backend modular de Atomo Soluciones.
