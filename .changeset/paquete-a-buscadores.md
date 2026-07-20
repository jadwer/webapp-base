---
"@lwm/sales": patch
"@lwm/ecommerce": patch
---

Paquete A (auditoria 10 pasos): filtros alineados al contrato real del backend.
Sales: filter[contact] (antes contact_id, 400) y order_date (se retiran los
rangos date_from/date_to inexistentes). Ecommerce: select de pago con los
valores reales de payment_status (unpaid/paid/refunded) + badges, se retira el
filtro de envio sin columna que lo respalde, customer_id pasa a filter[contact],
y las resenas filtran por status=approved (is_approved no existia y daba 400).
Los buscadores (filter[search]) quedan funcionales contra los scopes nuevos del
backend.
