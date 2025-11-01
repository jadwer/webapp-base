# ❓ Backend Questions & Answers

**Fecha Creación:** 2025-10-31
**Autor:** Claude (Frontend AI Assistant)
**Propósito:** Canal de comunicación Frontend ↔ Backend para resolver dudas específicas
**Formato:** Pregunta → Respuesta en el mismo archivo

---

## ⚠️ ESTADO: EN REVISIÓN

**Muchas de estas preguntas pueden quedar OBSOLETAS** al revisar el código real del frontend.

**Próximo paso:** Análisis módulo por módulo del frontend para identificar:
1. Qué ya está resuelto en el código
2. Qué realmente necesita aclaración del backend
3. Qué es gap real entre frontend y backend

**Este archivo se actualizará** después de completar la documentación de cada módulo.

---

## 📋 Instrucciones de Uso

### Para Frontend (Claude):
1. Agregar preguntas en la sección correspondiente
2. Usar formato estándar (ver template abajo)
3. Marcar como `[PENDIENTE]` al crear pregunta
4. Esperar respuesta del backend team

### Para Backend Team:
1. Revisar preguntas marcadas como `[PENDIENTE]`
2. Responder directamente debajo de la pregunta
3. Cambiar status a `[RESPONDIDA]`
4. Agregar fecha de respuesta

---

## 📝 Template de Pregunta

```markdown
### Q-XXX: [Título de la pregunta]
**Status:** [PENDIENTE/RESPONDIDA/EN REVISIÓN]
**Fecha Pregunta:** YYYY-MM-DD
**Módulo:** [Product/Contacts/Sales/etc.]
**Prioridad:** [ALTA/MEDIA/BAJA]

**Pregunta:**
[Descripción detallada de la pregunta]

**Contexto:**
[Por qué necesito esta información, qué estoy implementando]

**Impacto:**
[Qué bloquea o afecta esta duda en el frontend]

---

**Respuesta Backend:**
[Fecha: YYYY-MM-DD | Autor: Nombre]
[Respuesta detallada del equipo de backend]

**Acciones requeridas Frontend:**
- [ ] Acción 1
- [ ] Acción 2
```

---

## 🔴 Preguntas Prioritarias (ALTA)

### Q-001: ¿Cómo manejar eventos en tiempo real desde el backend?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Sales, Purchase, Finance
**Prioridad:** ALTA

**Pregunta:**
He visto que el backend usa eventos de Laravel (SalesOrderCompleted, PurchaseOrderReceived, etc.) para automatización. ¿El frontend debería:
1. Hacer polling para detectar cambios?
2. Existe algún sistema de WebSockets/SSE implementado?
3. ¿Debo usar SWR con revalidación automática?

**Contexto:**
Estoy implementando la interfaz de Sales Orders. Cuando un usuario completa una orden, el backend automáticamente crea una AR Invoice. El usuario debería ver la invoice creada sin refrescar manualmente la página.

**Impacto:**
Sin esto, el UX es pobre - el usuario debe refrescar manualmente para ver cambios automáticos del backend.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-002: ¿Pagination en Products está implementada?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Product
**Prioridad:** ALTA

**Pregunta:**
En DATABASE_SCHEMA_REFERENCE.md dice que pagination en Products NO está implementada. ¿Es correcto?
- ¿Cuál es el workaround actual?
- ¿Cuándo se planea implementar?
- ¿Hay límite de registros en la respuesta?
- ¿Debería yo implementar paginación del lado del frontend?

**Contexto:**
Necesito mostrar listado de productos con paginación. Si no hay paginación en backend, con 10,000+ productos la respuesta será muy lenta.

**Impacto:**
Performance crítico. Sin paginación, el listado de productos será inutilizable con grandes catálogos.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-003: ¿Endpoints de Reports tienen paginación?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Reports
**Prioridad:** ALTA

**Pregunta:**
Los endpoints de reports:
- `/api/v1/sales-orders/reports`
- `/api/v1/purchase-orders/reports`
- `/api/v1/products/reports`

¿Soportan paginación? ¿O retornan todos los datos de una vez?

**Contexto:**
Necesito implementar dashboard con reportes. Si retornan miles de registros sin paginación, tendremos problemas de performance.

**Impacto:**
Puede afectar seriamente el performance del dashboard y la experiencia del usuario.

---

**Respuesta Backend:**
[Esperando respuesta]

---

## 🟡 Preguntas Importantes (MEDIA)

### Q-004: ¿Formato de campo allowances y deductions en PayrollItems?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** HR
**Prioridad:** MEDIA

**Pregunta:**
En `payroll_items` hay campos JSON:
- `allowances` (prestaciones)
- `deductions` (deducciones)

¿Cuál es el formato esperado? ¿Algo como:
```json
{
  "allowances": [
    { "type": "transporte", "amount": 500.00 },
    { "type": "vales", "amount": 300.00 }
  ],
  "deductions": [
    { "type": "impuesto", "amount": 1200.00 },
    { "type": "seguro", "amount": 800.00 }
  ]
}
```

**Contexto:**
Necesito crear formulario de nómina. Debo saber estructura exacta para validación.

**Impacto:**
Forma incorrecta causará errores de validación. No es bloqueante pero necesito saberlo pronto.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-005: ¿Cómo funciona metadata field en múltiples tablas?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Multiple (Sales, Purchase, Finance)
**Prioridad:** MEDIA

**Pregunta:**
Varias tablas tienen campo `metadata` (JSON):
- `sales_orders`
- `ar_invoices`
- `ap_invoices`
- `payments`

¿Qué se espera guardar ahí? ¿Es de uso libre para el frontend? ¿Hay estructura recomendada?

**Contexto:**
Quiero almacenar información adicional del usuario (notas, tags, custom fields). ¿Puedo usar metadata para esto?

**Impacto:**
Necesito saber si puedo usar este campo o debo crear tablas adicionales.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-006: ¿Validación de credit_limit es automática?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Contacts, Sales
**Prioridad:** MEDIA

**Pregunta:**
Cuando creo una Sales Order, ¿el backend automáticamente:
1. Verifica el credit_limit del contacto?
2. Retorna error 422 si se excede?
3. O debo validar esto en frontend antes de enviar?

**Contexto:**
Estoy implementando formulario de Sales Order. Necesito saber si debo pre-validar credit antes de enviar o si el backend lo maneja.

**Impacto:**
Afecta UX - mejor validar antes de enviar si el backend no lo hace automáticamente.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-007: ¿Status transitions permitidos en Sales Orders?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Sales
**Prioridad:** MEDIA

**Pregunta:**
¿Cuáles son los status transitions válidos para sales_orders?
```
pending → approved → completed
pending → cancelled
approved → cancelled
```
¿Puedo pasar de `completed` a `cancelled`? ¿Hay validaciones?

**Contexto:**
Necesito crear UI con botones de acción. Debo saber qué transiciones son válidas para mostrar/ocultar botones.

**Impacto:**
UI confusa si muestro acciones no permitidas.

---

**Respuesta Backend:**
[Esperando respuesta]

---

## 🟢 Preguntas Informativas (BAJA)

### Q-008: ¿Hay límite de documentos por contacto?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Contacts
**Prioridad:** BAJA

**Pregunta:**
¿Existe límite de documentos que puedo subir por contacto? ¿O límite de storage total?

**Contexto:**
Solo para informar al usuario en la UI.

**Impacto:**
Bajo - solo informativo.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-009: ¿Campo reference en Payments es único?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Finance
**Prioridad:** BAJA

**Pregunta:**
El campo `reference` en `payments` (ej: "TRANSFER-XYZ123"), ¿debe ser único? ¿O pueden haber múltiples pagos con mismo reference?

**Contexto:**
Solo para decidir si mostrar warning en UI si el usuario pone un reference duplicado.

**Impacto:**
Bajo - no bloquea desarrollo.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-010: ¿Timezone de campos datetime?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Global
**Prioridad:** BAJA

**Pregunta:**
Campos datetime (created_at, updated_at, etc.):
- ¿Están en UTC siempre?
- ¿O en timezone del servidor?
- ¿Debo convertir a timezone local en frontend?

**Contexto:**
Para mostrar fechas correctamente al usuario.

**Impacto:**
Bajo - puedo asumir UTC por ahora.

---

**Respuesta Backend:**
[Esperando respuesta]

---

## 🔮 Preguntas Futuras

### Q-011: ¿Roadmap de Billing/CFDI Module?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Billing (futuro)
**Prioridad:** BAJA

**Pregunta:**
Vi en roadmap que hay plan para Billing/CFDI module (Phase 5.1). ¿Cuándo se planea iniciar? ¿Qué integrará?

**Contexto:**
Para planear features del frontend que dependerán de esto.

**Impacto:**
No bloquea nada actual - solo planning.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-012: ¿Multi-currency support está planeado?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Finance, Products
**Prioridad:** BAJA

**Pregunta:**
Veo que hay tabla `exchange_rates` y campo `currency` en varias tablas. ¿Multi-currency está funcional o es preparación para futuro?

**Contexto:**
Para saber si debo implementar selector de moneda en productos/facturas.

**Impacto:**
No bloqueante - puedo asumir MXN por ahora.

---

**Respuesta Backend:**
[Esperando respuesta]

---

## 📊 Preguntas Técnicas

### Q-013: ¿Rate limiting implementado?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** API Global
**Prioridad:** MEDIA

**Pregunta:**
¿La API tiene rate limiting? ¿Cuántos requests por minuto están permitidos? ¿Retorna header `X-RateLimit-*`?

**Contexto:**
Para implementar throttling en el frontend y no saturar el backend.

**Impacto:**
Medio - puede causar 429 errors si hago muchos requests.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-014: ¿CORS configurado correctamente?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** API Global
**Prioridad:** ALTA

**Pregunta:**
¿CORS está configurado para permitir requests desde:
- `http://localhost:3000` (dev)
- `https://webapp-base.com` (prod)

¿O necesito configurar algo?

**Contexto:**
Para evitar errores de CORS al consumir API desde Next.js.

**Impacto:**
Alto - bloquea completamente el desarrollo si CORS no funciona.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-015: ¿Webhook endpoints disponibles?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Integration
**Prioridad:** BAJA

**Pregunta:**
¿Hay endpoints para registrar webhooks? Ejemplo:
- Notificar al frontend cuando se crea una invoice
- Notificar cuando cambia status de orden
- Etc.

**Contexto:**
Para sincronización en tiempo real sin polling constante.

**Impacto:**
Bajo - nice to have, no bloqueante.

---

**Respuesta Backend:**
[Esperando respuesta]

---

## 📖 Preguntas de Documentación

### Q-016: ¿Existe Postman collection actualizada?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** API Global
**Prioridad:** MEDIA

**Pregunta:**
¿Tienen Postman collection con todos los endpoints? Si sí, ¿dónde la puedo descargar?

**Contexto:**
Para testing rápido sin tener que construir requests manualmente.

**Impacto:**
Medio - aceleraría mi desarrollo tener collection lista.

---

**Respuesta Backend:**
[Esperando respuesta]

---

### Q-017: ¿OpenAPI/Swagger docs disponibles?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** API Global
**Prioridad:** BAJA

**Pregunta:**
¿Hay documentación OpenAPI/Swagger? Si sí, ¿en qué URL?

**Contexto:**
Para generar TypeScript types automáticamente desde el schema.

**Impacto:**
Bajo - nice to have.

---

**Respuesta Backend:**
[Esperando respuesta]

---

## 🔧 Preguntas de Debugging

### Q-018: ¿Cómo debugging en local?
**Status:** [PENDIENTE]
**Fecha Pregunta:** 2025-10-31
**Módulo:** Development
**Prioridad:** ALTA

**Pregunta:**
Cuando tengo errores en requests:
1. ¿Dónde puedo ver logs del backend? (`storage/logs/laravel.log`?)
2. ¿Hay modo debug que retorne stack traces completos?
3. ¿Cómo puedo reproducir eventos manualmente para testing?

**Contexto:**
Para debugging más eficiente cuando algo falla.

**Impacto:**
Alto - me ayudaría muchísimo en desarrollo.

---

**Respuesta Backend:**
[Esperando respuesta]

---

## 📝 Historial de Preguntas Respondidas

_[Las preguntas respondidas se moverán aquí con sus respuestas]_

---

## 📞 Contacto

**Frontend Lead (Claude):** Via este archivo
**Backend Lead:** [Nombre/Email]
**Response Time SLA:** 24-48 horas para preguntas ALTA, 72 horas para MEDIA/BAJA

---

**Última Actualización:** 2025-10-31
**Preguntas Totales:** 18
**Pendientes:** 18
**Respondidas:** 0
