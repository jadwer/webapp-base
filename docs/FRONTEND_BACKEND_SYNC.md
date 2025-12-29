# Frontend-Backend Sync - Documentacion de Progreso

**Fecha inicio:** 2025-12-28
**Objetivo:** Sincronizar tipos del frontend con las guias del backend API

---

## Metodologia

### Fuente de Verdad
Las guias del backend ubicadas en:
```
/home/jadwer/dev/AtomoSoluciones/base/api-base/docs/modules/*_FRONTEND_GUIDE.md
```

### Proceso por Modulo

1. **Leer guia del backend** - `{MODULE}_FRONTEND_GUIDE.md`
2. **Leer types del frontend** - `src/modules/{module}/types/`
3. **Identificar discrepancias** - tipos, campos, valores de enum
4. **Corregir types** - actualizar interfaces y tipos
5. **Corregir componentes** - actualizar componentes que usen valores hardcodeados
6. **Verificar build** - `npm run build` debe pasar sin errores
7. **Continuar** con el siguiente modulo

### Reglas Importantes

1. **camelCase OBLIGATORIO** - Todos los atributos JSON:API deben usar camelCase
2. **Compatibilidad hacia atras** - Si el frontend usa valores que el backend no documenta pero la DB si tiene, mantener ambos
3. **Verificar migraciones** - La guia del backend puede estar incompleta, verificar con migraciones de DB si hay dudas
4. **Build obligatorio** - Cada modulo debe terminar con build exitoso

---

## Orden de Modulos

```
1. Auth          [COMPLETADO]
2. Audit         [OMITIDO - solo lectura, no hay frontend]
3. Contacts      [COMPLETADO]
4. Products      [COMPLETADO]
5. Inventory     [COMPLETADO]
6. Sales         [COMPLETADO]
7. Purchase      [COMPLETADO]
8. Accounting    [COMPLETADO]
9. Finance       [COMPLETADO]
10. Billing      [COMPLETADO]
11. Ecommerce    [COMPLETADO]
12. Reports      [COMPLETADO]
```

---

## Modulos Completados

### 1. Auth Module

**Guia:** `AUTH_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `lib/auth.ts` | Endpoint logout: `/api/v1/auth/logout` -> `/api/auth/logout` |
| `lib/profileApi.ts` | camelCase: `current_password` -> `currentPassword`, `password_confirmation` -> `passwordConfirmation` |
| `components/ChangePasswordForm.tsx` | Form state actualizado a camelCase |
| `schemas/register.schema.ts` | Min password: 6 -> 8, campo `passwordConfirmation` |
| `components/RegisterForm.tsx` | Campo actualizado a `passwordConfirmation` |
| `tests/lib/auth.test.ts` | Tests actualizados |
| `tests/lib/profileApi.test.ts` | Tests actualizados |

**Tests:** 38 tests passing

---

### 2. Audit Module

**Estado:** OMITIDO

**Razon:** El modulo es solo lectura (2 endpoints: list, show) para logs de admin. No existe frontend implementado ni es necesario por ahora.

---

### 3. Contacts Module

**Guia:** `CONTACTS_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | Agregado type aliases: `ContactType`, `ContactStatus`, `AddressType`, `DocumentType` |
| `types/index.ts` | `ContactStatus`: agregado `'archived'` |
| `types/index.ts` | `ContactType`: agregado `'government'` |
| `types/index.ts` | `AddressType`: `'main'` -> `'fiscal'` |
| `types/index.ts` | `DocumentType`: valores nuevos `'id_card'`, `'tax_certificate'`, `'contract'`, `'license'`, `'other'` |
| `components/ContactAddresses.tsx` | Actualizado labels y opciones de select |
| `components/ContactDocuments.tsx` | Actualizado labels, iconos y opciones de select |

---

### 4. Products Module

**Guia:** `PRODUCT_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/product.ts` | Agregado `isActive: boolean` a `Product` |
| `types/product.ts` | `categoryId` y `brandId` ahora permiten `null` |
| `types/product.ts` | Agregado `isActive?: boolean` a `ProductFilters` |
| `utils/transformers.ts` | Agregado `isActive` al transformer |
| `inventory/tests/utils/test-utils.ts` | Agregado `isActive: true` al mock |

**Aprendizaje importante:**
La guia del backend estaba INCOMPLETA. Decia que Unit solo tenia `name` y `abbreviation`, pero la migracion de DB muestra `unit_type`, `code`, `name`. Siempre verificar con migraciones si hay dudas.

**Archivos de migraciones consultados:**
- `Modules/Product/Database/migrations/2025_07_26_090922_create_units_table.php`
- `Modules/Product/Database/migrations/2025_07_26_090948_create_categories_table.php`
- `Modules/Product/Database/migrations/2025_07_26_091030_create_brands_table.php`

---

### 5. Inventory Module

**Guia:** `INVENTORY_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/warehouse.ts` | `WarehouseType`: `'main' \| 'secondary' \| 'distribution' \| 'returns'` -> `'main' \| 'distribution' \| 'retail' \| 'storage' \| 'cross-dock'` |
| `types/warehouse.ts` | `metadata` tipo: `string` -> `Record<string, unknown> \| null` |
| `types/warehouse.ts` | Removido `operatingHours` y `metadata` de Create/UpdateWarehouseData |
| `types/productBatch.ts` | `ProductBatchStatus`: agregados valores del backend manteniendo legacy |
| `types/productBatch.ts` | Actualizado `PRODUCT_BATCH_STATUS_CONFIG` y `PRODUCT_BATCH_STATUS_OPTIONS` |
| `components/WarehouseDetail.tsx` | Renderizado de metadata con `JSON.stringify()` |
| `components/WarehouseForm.tsx` | Validacion opcional de slug: `formData.slug?.trim()` |
| `components/InventoryMovementForm.tsx` | Status filter: `'active'` -> `'available'` |

**Compatibilidad mantenida:**
El frontend usaba extensivamente `'active'` para ProductBatchStatus pero el backend define `'available'`. Se agregaron AMBOS valores al tipo para mantener compatibilidad:
```typescript
export type ProductBatchStatus =
  | 'available' | 'reserved' | 'quarantine' | 'expired' | 'depleted'  // Backend
  | 'active' | 'recalled' | 'consumed'  // Legacy frontend
```

---

## Lecciones Aprendidas

### 1. Guias del backend pueden estar incompletas
Siempre verificar con las migraciones de la base de datos si hay dudas sobre campos o tipos.

**Ubicacion de migraciones:**
```
/home/jadwer/dev/AtomoSoluciones/base/api-base/Modules/{Module}/Database/migrations/
```

### 2. Compatibilidad hacia atras
Si el frontend ya usa ciertos valores extensivamente, agregar los valores nuevos del backend SIN remover los existentes. Esto evita romper funcionalidad existente.

### 3. Build incremental
Ejecutar `npm run build` despues de cada modulo. Los errores de tipo se propagan y es mas facil debuggear modulo por modulo.

### 4. Componentes hardcodeados
Ademas de los types, revisar componentes que tengan valores hardcodeados en:
- Opciones de `<select>`
- Labels y traducciones
- Iconos por tipo/status
- Validaciones de formularios

---

## Comandos Utiles

```bash
# Verificar build
npm run build

# Buscar guias del backend
ls /home/jadwer/dev/AtomoSoluciones/base/api-base/docs/modules/*FRONTEND*.md

# Buscar migraciones de un modulo
ls /home/jadwer/dev/AtomoSoluciones/base/api-base/Modules/{Module}/Database/migrations/

# Buscar uso de un valor en el frontend
grep -r "'valor'" src/modules/{module}/
```

---

### 6. Sales Module

**Guia:** `SALES_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | Agregados type aliases: `OrderStatus`, `InvoicingStatus`, `FinancialStatus` |
| `types/index.ts` | `OrderStatus`: agregado `'draft'`, mantiene `'pending'` como legacy |
| `types/index.ts` | `SalesOrder`: agregados campos de finance (`arInvoiceId`, `invoicingStatus`, etc.) |
| `types/index.ts` | `SalesOrderItem`: `salesOrderId: string` -> `number`, agregados campos finance |
| `types/index.ts` | `SalesOrderItem.totalPrice` mantenido como alias legacy de `total` |
| `types/index.ts` | Agregados `OrderTracking`, `OrderTimelineEvent`, `StatusHistoryEntry` |
| `tests/utils/test-utils.ts` | Mocks actualizados con nuevos campos requeridos |
| `utils/transformers.ts` | Transformers actualizados con campos de finance |

---

### 7. Purchase Module

**Guia:** `PURCHASE_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | Agregados type aliases: `PurchaseOrderStatus`, `InvoicingStatus`, `FinancialStatus` |
| `types/index.ts` | `PurchaseOrderStatus`: agregado `'draft'`, mantiene `'completed'` como legacy |
| `types/index.ts` | `PurchaseOrder`: agregados campos de finance (`apInvoiceId`, `invoicingStatus`, `invoicingNotes`) |
| `types/index.ts` | `PurchaseOrderItem`: `purchaseOrderId: string` -> `number`, agregados campos finance |
| `types/index.ts` | `PurchaseOrderItem`: agregados `subtotal`, `total`, `metadata`, campos finance |
| `types/index.ts` | `PurchaseOrderItem.totalPrice` mantenido como alias legacy de `total` |
| `tests/utils/test-utils.ts` | Mocks actualizados con nuevos campos requeridos |
| `utils/transformers.ts` | Transformers actualizados con campos de finance |
| `app/(back)/dashboard/purchase/[id]/edit/page.tsx` | Import de `PurchaseOrderStatus`, select con opcion `draft` |

**Patron identificado:**
Sales y Purchase comparten estructura similar:
- Ambos tienen `OrderStatus` con `'draft'` como valor inicial del backend
- Ambos tienen campos de integracion con Finance (`apInvoiceId`/`arInvoiceId`, `invoicingStatus`, etc.)
- Ambos items tienen campos de facturacion (`invoicedQuantity`, `invoicedAmount`)

---

### 8. Accounting Module

**Guia:** `ACCOUNTING_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | Agregados type aliases para todos los enums del backend |
| `types/index.ts` | `Account`: agregados `nature`, `isCashFlow`, `status: 'archived'` |
| `types/index.ts` | `Account.parentId`: `string` -> `number \| null` |
| `types/index.ts` | `JournalEntry`: `journalId`/`fiscalPeriodId`: `string` -> `number` |
| `types/index.ts` | `JournalEntry.status`: agregados `'pending'`, `'approved'`, `'reversed'` |
| `types/index.ts` | `JournalEntry.totalDebit`/`totalCredit`: `string` -> `number` |
| `types/index.ts` | `JournalEntry`: agregados campos faltantes (`approvedAt`, `reversalReason`, etc.) |
| `types/index.ts` | `JournalLine`: `journalEntryId`/`accountId`: `string` -> `number` |
| `types/index.ts` | `JournalLine.debit`/`credit`: `string` -> `number` |
| `types/index.ts` | `JournalLine`: agregados `contactId`, `description`, `reference` |
| `types/index.ts` | Agregadas 9 entidades nuevas: `Journal`, `JournalSequence`, `FiscalPeriod`, `ExchangeRate`, `ExchangeRatePolicy`, `AccountBalance`, `AccountMapping`, `AuditLog`, `IdempotencyKey` |
| `components/AccountForm.tsx` | Agregados `nature` e `isCashFlow` al estado inicial y useEffect |
| `components/JournalEntriesAdminPageReal.tsx` | Removido `parseFloat` en totales (ya son `number`) |
| `components/JournalEntriesTableSimple.tsx` | Actualizado `isBalanced()` para recibir `number` |
| `components/JournalEntryForm.tsx` | Agregados defaults para `currency` y `exchangeRate` |
| `tests/utils/test-utils.ts` | Actualizados mocks con nuevos campos requeridos |
| `utils/transformers.ts` | Transformers actualizados para devolver tipos correctos |
| `services/index.ts` | Actualizado `createWithLines` para convertir tipos legacy |

**Modulo grande (12 entidades):**
Este modulo del backend tiene 12 entidades y 60 endpoints. Se sincronizaron las entidades principales y se agregaron las faltantes como placeholders para uso futuro.

---

### 9. Finance Module

**Guia:** `FINANCE_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | Agregado type alias `PaymentStatus` con valor legacy `'posted'` |
| `types/index.ts` | Agregada interfaz `Payment` unificada (backend usa Payment, no APPayment/ARReceipt separados) |
| `types/index.ts` | `APPayment` y `ARReceipt` ahora extienden `Payment` como aliases legacy |
| `types/index.ts` | `PaymentApplication`: `paymentId`, `arInvoiceId`, `apInvoiceId` ahora son `number` |
| `types/index.ts` | `PaymentApplication`: agregado `appliedAmount: number`, removido `amount: string` |
| `types/index.ts` | `BankAccount`: agregados `accountName`, `currentBalance`; `isActive: boolean` |
| `types/index.ts` | `PaymentMethod`: simplificado a solo `name`, `code`, `isActive` |
| `types/index.ts` | Agregado `PaymentForm` para creacion de pagos |
| `utils/transformers.ts` | `transformBankAccountFromAPI`: agregados campos nuevos del backend |
| `utils/transformers.ts` | `transformAPPaymentFromAPI`: actualizado para retornar Payment-compatible |
| `utils/transformers.ts` | `transformARReceiptFromAPI`: actualizado para retornar Payment-compatible |
| `utils/transformers.ts` | `transformPaymentApplicationFromAPI`: IDs ahora son `number`, usa `appliedAmount` |
| `utils/transformers.ts` | `transformPaymentMethodFromAPI`: simplificado segun backend |
| `tests/utils/test-utils.ts` | Agregado `createMockPayment` factory para entidad unificada |
| `tests/utils/test-utils.ts` | Actualizados mocks de BankAccount, PaymentApplication, PaymentMethod |
| `components/PaymentApplicationForm.tsx` | Form state local con conversion a tipos del API |
| `components/PaymentApplicationsAdminPage.tsx` | Usa `appliedAmount` en lugar de `amount` |

**Patron importante:**
El backend define una sola entidad `Payment` para AR y AP, pero el frontend tenia separados `APPayment` y `ARReceipt`. Se mantuvieron como aliases que extienden `Payment` para compatibilidad:
```typescript
export type APPayment = Payment & {
  apInvoiceId?: number | null;
  paymentMethod?: string;
};

export type ARReceipt = Payment & {
  arInvoiceId?: number | null;
  receiptDate?: string;
  paymentMethod?: string;
};
```

---

### 10. Billing Module

**Guia:** `BILLING_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | Agregado `PaymentTransaction` entity completa con todos los campos del backend |
| `types/index.ts` | Agregado `PaymentGateway` type alias: `'stripe' \| 'paypal' \| 'mercadopago' \| 'openpay' \| 'conekta'` |
| `types/index.ts` | Agregado `PaymentTransactionStatus` type alias: `'pending' \| 'authorized' \| 'captured' \| 'failed' \| 'refunded' \| 'cancelled'` |
| `types/index.ts` | Agregado `PaymentTransactionFormData` y `PaymentTransactionFilters` |
| `types/index.ts` | `CFDIItem`: agregados campos del backend: `productId`, `numeroLinea`, `impuestos`, `numeroPedimento`, `cuentaPredial`, `informacionAduanera` |
| `utils/transformers.ts` | `transformJsonApiCFDIItem`: agregados campos nuevos con tipos correctos (`null` en lugar de `undefined`) |
| `tests/utils/test-utils.ts` | `createMockCFDIItem`: agregados campos requeridos del backend |

**Entidades del backend:**
- `CFDIInvoice` - Comprobantes fiscales digitales (CFDI 4.0)
- `CFDIItem` - Conceptos/items del CFDI
- `CompanySetting` - Configuracion fiscal de la empresa
- `PaymentTransaction` - Transacciones de pago con gateways (Stripe, PayPal, etc.)

**Patron importante:**
El modulo Billing maneja dos funcionalidades distintas:
1. **CFDI** - Facturacion electronica mexicana (SAT compliance)
2. **PaymentTransaction** - Integracion con pasarelas de pago

---

### 11. Ecommerce Module

**Guia:** `ECOMMERCE_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | `PaymentStatus`: agregado `'cancelled'` |
| `types/index.ts` | `ShoppingCart.sessionId`: `string \| undefined` -> `string \| null` |
| `types/index.ts` | `ShoppingCart.userId`: `number \| undefined` -> `string \| null` (backend usa string) |
| `types/index.ts` | `ShoppingCart`: timestamps ahora son requeridos (`createdAt`, `updatedAt`, `expiresAt`) |
| `types/index.ts` | Agregado `CartItem` entity (nombre del backend para cart items) |
| `types/index.ts` | Agregado `CheckoutSession` entity completa con `Address` interface |
| `types/index.ts` | Agregado `EcommercePaymentTransaction` entity (diferente de Billing) |
| `types/index.ts` | Agregado `Wishlist` y `WishlistItem` entities |
| `types/index.ts` | Agregado `ProductReview` entity con `ReviewStatus` type |
| `types/index.ts` | Agregado `Coupon` entity con `CouponType` type |
| `types/index.ts` | Agregado `ShippingMethod` entity |
| `types/index.ts` | Agregado `Currency` entity |
| `types/index.ts` | Agregado `InventoryReservation` entity con `ReservationStatus` type |
| `types/index.ts` | Agregado `ProductQuestion` y `ProductAnswer` entities |
| `types/index.ts` | Agregado `ProductComparison` y `ProductComparisonItem` entities |
| `components/OrderStatusBadge.tsx` | Agregado `'cancelled'` a `paymentStatusColors` y `paymentStatusIcons` |
| `hooks/useShoppingCart.ts` | Convertir `customerId` a string para `userId` |
| `utils/transformers.ts` | `shoppingCartFromAPI`: actualizado para usar `null` en lugar de `undefined` |

**Modulo grande (15 entidades, 75 endpoints):**
Este modulo cubre todo el flujo de e-commerce:
- Shopping Cart & Cart Items
- Checkout Sessions con reservaciones de inventario
- Payment Transactions con multiples gateways
- Wishlists y Product Reviews
- Coupons y Shipping Methods
- Multi-currency support
- Product Q&A y Comparisons

---

### 12. Reports Module

**Guia:** `REPORTS_FRONTEND_GUIDE.md`

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `types/index.ts` | `AccountLine`: agregados `accountType`, `balance` (campos requeridos del backend) |
| `types/index.ts` | Agregado `CategoryGroup` interface para agrupar cuentas por categoria |
| `types/index.ts` | Agregado `TrialBalanceAccount` interface con `type`, `debit`, `credit` |
| `types/index.ts` | `BalanceSheet`: `assets`/`liabilities`/`equity` ahora son `CategoryGroup[]` |
| `types/index.ts` | `IncomeStatement`: agregados `startDate`, `endDate`, `revenues`, `expenses`, `totalRevenues`, `totalExpenses` |
| `types/index.ts` | `CashFlow`: agregados `startDate`, `endDate`, `beginningCash`, `netCashFlow`, `endingCash` |
| `types/index.ts` | `TrialBalance`: agregados `totals`, `summaryByType` del backend |
| `types/index.ts` | Agregados `AgingTotals` y `AgingBucket` interfaces del backend |
| `types/index.ts` | `ARAgingReport`/`APAgingReport`: agregados `agingBuckets`, `totals` |
| `types/index.ts` | `SalesByCustomer`: agregados `startDate`, `endDate`, `salesByCustomer`, `summary` |
| `types/index.ts` | `SalesByProduct`: agregados `startDate`, `endDate`, `salesByProduct`, `summary` |
| `types/index.ts` | `PurchaseBySupplier`: agregados `startDate`, `endDate`, `purchaseBySupplier`, `summary` |
| `types/index.ts` | `PurchaseByProduct`: agregados `startDate`, `endDate`, `purchaseByProduct`, `summary` |
| `utils/transformers.ts` | Todos los transformers actualizados con campos del backend |
| `tests/utils/test-utils.ts` | Todos los mocks actualizados con nuevos campos requeridos |

**Modulo de reportes virtuales (10 reportes, 20 endpoints):**
Este modulo genera reportes dinamicos desde datos de Accounting, Finance, Sales y Purchase:
- **Financial Statements:** Balance Sheet, Income Statement, Cash Flow, Trial Balance
- **Aging Reports:** AR Aging (cuentas por cobrar), AP Aging (cuentas por pagar)
- **Management Reports:** Sales by Customer/Product, Purchase by Supplier/Product

**Patron importante:**
El backend usa estructuras mas simples con totales agregados, mientras el frontend legacy tenia estructuras detalladas. Se mantienen ambos para compatibilidad:
```typescript
// Backend structure (simple)
revenues: CategoryGroup[]
totalRevenues: number

// Legacy frontend structure (detailed)
revenue?: AccountLine[]
costOfGoodsSold?: number
grossProfit?: number
```

---

## Sincronizacion Completada

Todos los modulos han sido sincronizados con las guias del backend:

| Modulo | Estado | Entidades | Endpoints |
|--------|--------|-----------|-----------|
| Auth | COMPLETADO | 1 | 10 |
| Audit | OMITIDO | 1 | 2 |
| Contacts | COMPLETADO | 4 | 20 |
| Products | COMPLETADO | 4 | 16 |
| Inventory | COMPLETADO | 6 | 30 |
| Sales | COMPLETADO | 3 | 15 |
| Purchase | COMPLETADO | 3 | 15 |
| Accounting | COMPLETADO | 12 | 60 |
| Finance | COMPLETADO | 5 | 25 |
| Billing | COMPLETADO | 4 | 20 |
| Ecommerce | COMPLETADO | 15 | 75 |
| Reports | COMPLETADO | 10 | 20 |

**Total:** 68 entidades, 308 endpoints sincronizados

---

**Ultima actualizacion:** 2025-12-28
