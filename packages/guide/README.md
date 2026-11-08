# @lwm/guide

Flujo guiado (atomo/guide v1) para el panel de LWM: `GuidePanel` muestra la
siguiente accion de un documento y su expediente leyendo
`GET /api/v1/guide/{type}/{id}`.

Reglas (docs/flujo-guiado/PLAN_LWM.md, D10):

- La barra no inventa formularios. Toda accion con `asks` se entrega a la pagina
  por `onAction(action)`; la pagina abre su modal (convertir, enviar, rechazar,
  remisionar) y devuelve `true`.
- Las acciones sin `asks` (aceptar, confirmar, imprimir, cancelar) las ejecuta
  el panel con `runGuideAction` tras una confirmacion; si `requiresReason`, el
  motivo es obligatorio y viaja en el cuerpo y en `X-Change-Reason`.
- `revision` (el `updatedAt` o el estado del documento) hace que la guia se
  vuelva a pedir cuando la pagina recarga el documento.

```tsx
<GuidePanel
  type="quotes"
  id={quote.id}
  revision={`${quote.status}:${quote.updatedAt}`}
  onAction={(action) => {
    if (action.key === 'sales::guide.quote.convert') { setConvertModalType('order'); return true }
  }}
  onDone={() => refetch()}
/>
```
