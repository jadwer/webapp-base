---
"@lwm/sales": minor
"@lwm/ecommerce": minor
---

DESIGN_ECOMMERCE_PAGO_STOCK: paymentStatus/paidAt en SalesOrder (tipos y
transformer) y CTA de cotizacion en el checkout cuando el backend responde
stock insuficiente (insufficient_items + quote_cta). El disponible ahora
descuenta lo comprometido en ordenes pagadas, asi que el 422 es el camino
esperado cuando otro comprador ya pago el stock.
