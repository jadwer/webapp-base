---
"@lwm/ecommerce": patch
---

Evita el carrito vacio al proceder al pago cuando falla la sincronizacion. syncLocalCartToAPI ahora agrega los items al carrito de servidor antes de limpiar los obsoletos, con rollback si falla, y distingue fallos de sesion expirada (CartSyncAuthError) del resto (CartSyncError). El checkout ofrece reintentar cuando el carrito de servidor queda vacio pero el localStorage aun tiene items.
