---
"@lwm/app-config": minor
---

Fase 3 landing.*: el grupo landing (textos y cantidades del home) viaja en
publicSettings y queda tipado en usePublicSettings/getPublic. El tenant lo
consume en Hero, OfertasDelMes y UltimosProductos con fallback a los valores
historicos.
