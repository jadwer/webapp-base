# 📊 Backend Analysis Summary - Frontend Perspective

**Fecha:** 2025-10-31
**Autor:** Claude (Frontend AI Assistant)
**Propósito:** Documentar mi comprensión completa del backend para integración efectiva
**Última Actualización Backend:** 2025-10-31 (Phase 4.4 - HR Module Complete)

---

## ⚠️ IMPORTANTE - DISCLAIMER

**🔴 ESTE DOCUMENTO ES PRE-ANÁLISIS DEL FRONTEND REAL**

Este análisis fue hecho **ÚNICAMENTE** basándome en la documentación del backend, **SIN** revisar el código real del frontend.

**Descubrimiento posterior:** El frontend tiene **17 módulos implementados con 400+ archivos**, muchos más de los que este documento asume.

**Estado:**
- ✅ **Backend Analysis:** Correcto y completo
- ⚠️ **Frontend Status:** DESACTUALIZADO - Necesita análisis módulo por módulo
- 📋 **Próximo paso:** Documentación exhaustiva de cada módulo frontend real

**Para documentación actualizada del frontend, ver:**
- `docs/modules/PRODUCTS_MODULE_COMPLETE.md` (en progreso)
- `docs/modules/INVENTORY_MODULE_COMPLETE.md` (pendiente)
- `docs/modules/FINANCE_MODULE_COMPLETE.md` (pendiente - PRIORIDAD)
- `docs/modules/ACCOUNTING_MODULE_COMPLETE.md` (pendiente - PRIORIDAD)

**Fecha de este disclaimer:** 2025-10-31

---

## 🎯 Executive Summary

He completado un análisis exhaustivo de la documentación del backend `api-base`. Este documento resume mi comprensión del sistema, las capacidades disponibles, y cómo debo integrarme con el backend desde el frontend Next.js.

### Estado Actual del Backend

| Métrica | Valor |
|---------|-------|
| **Módulos Completos** | 9 (Product, Inventory, Purchase, Sales, Ecommerce, Finance, Accounting, Reports, HR) |
| **Tablas en BD** | 54+ |
| **Endpoints API** | 204+ |
| **Tests Passing** | 1,400+ |
| **Business Rules** | 150+ implementadas |
| **Nivel de Automatización** | 70-75% (Finance/Accounting integration) |
| **Coverage** | 85% |

---

## 📋 Módulos Disponibles

### 1. Product Module ✅ COMPLETO
**Entidades:** 4 (Product, Unit, Category, Brand)

#### Products
- **Tabla:** `products`
- **Campos Clave:**
  - `name`, `sku` (UNIQUE), `description`
  - `price` (precio de venta) ⚠️ NO `unit_price`
  - `cost` (costo de adquisición)
  - `iva` (boolean, 16% VAT)
  - `category_id`, `brand_id`, `unit_id`
  - `is_active`

**⚠️ IMPORTANTE:** El campo `unit_price` NO EXISTE en products. Usar `price` o `cost`.

#### Units (Unidades de Medida)
- **Tabla:** `units`
- **Campos:** `name`, `code`, `unit_type`
- **Ejemplos:** piezas, kg, litros, cajas

#### Categories
- **Tabla:** `categories`
- **Campos:** `name`, `description`, `slug` (UNIQUE), `parent_id` (jerarquía)
- **Soporta:** Categorías anidadas

#### Brands
- **Tabla:** `brands`
- **Campos:** `name`, `description`, `slug` (UNIQUE)

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/products
GET/POST/PATCH/DELETE  /api/v1/units
GET/POST/PATCH/DELETE  /api/v1/categories
GET/POST/PATCH/DELETE  /api/v1/brands
```

---

### 2. Contacts Module ✅ COMPLETO
**Entidades:** 4 (Contact, ContactAddress, ContactDocument, ContactPerson)

#### 🔑 Party Pattern (CRÍTICO ENTENDER)
- **Una sola tabla:** `contacts` con flags de rol
- **Flags:** `is_customer`, `is_supplier` (puede ser ambos)
- **Foreign Key Unificado:** `contact_id` en TODO el sistema

**NO HAY:**
- ❌ Tabla `customers` separada
- ❌ Tabla `suppliers` separada
- ❌ Campo `customer_id` o `supplier_id` como FK

**SÍ HAY:**
- ✅ Tabla `contacts` con roles
- ✅ Campo `contact_id` apuntando a `contacts.id`
- ✅ Validación en Request para verificar `is_customer` o `is_supplier`

#### Contacts
- **Tabla:** `contacts`
- **Campos Clave:**
  - `contact_type` (company | person)
  - `name`, `legal_name`, `tax_id`
  - `email`, `phone`, `website`
  - `is_customer`, `is_supplier` (boolean flags)
  - `credit_limit` (decimal, para clientes)
  - `payment_terms` (integer, días, default 30)
  - `classification` (A, B, C)
  - `status` (active | inactive)

#### Contact Addresses
- **Tabla:** `contact_addresses`
- **Campos:** `contact_id`, `address_type` (billing, shipping, office), `is_default`
- **Relación:** 1:N (un contacto puede tener múltiples direcciones)

#### Contact Documents
- **Tabla:** `contact_documents`
- **Tipos soportados:** RFC, INE, constancia_sat, opinion_sat, certificado_sello, contratos, facturas, etc.
- **Formatos:** PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (max 10MB)
- **Endpoints especiales:**
  - `POST /api/v1/contact-documents/upload` (multipart/form-data)
  - `GET /api/v1/contact-documents/{id}/view` (preview)
  - `GET /api/v1/contact-documents/{id}/download`
  - `PATCH /api/v1/contact-documents/{id}/verify`
  - `PATCH /api/v1/contact-documents/{id}/unverify`

#### Contact People
- **Tabla:** `contact_people`
- **Campos:** `contact_id`, `name`, `position`, `department`, `email`, `phone`, `is_primary`
- **Uso:** Personas de contacto en empresas

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/contacts
GET/POST/PATCH/DELETE  /api/v1/contact-addresses
GET/POST/PATCH/DELETE  /api/v1/contact-people
GET/POST/PATCH/DELETE  /api/v1/contact-documents
POST                   /api/v1/contact-documents/upload
GET                    /api/v1/contact-documents/{id}/view
GET                    /api/v1/contact-documents/{id}/download
PATCH                  /api/v1/contact-documents/{id}/verify
PATCH                  /api/v1/contact-documents/{id}/unverify
```

---

### 3. Inventory Module ✅ COMPLETO
**Entidades:** 5 (Warehouse, WarehouseLocation, Stock, ProductBatch, InventoryMovement)

#### Warehouses
- **Tabla:** `warehouses`
- **Campos:** `name`, `code`, `address`, `capacity`, `is_active`

#### Stock
- **Tabla:** `stock`
- **Campos Clave:**
  - `product_id`, `warehouse_id`
  - `quantity` (disponible)
  - `reserved_quantity` (reservado para órdenes)
  - **`available_quantity`** (CALCULATED: quantity - reserved_quantity)
  - `reorder_point`, `reorder_quantity`

#### Inventory Movements
- **Tipos:** entry, exit, transfer, adjustment
- **Auditabilidad:** `previous_stock`, `new_stock`, `notes`
- **GL Integration:** Movimientos crean journal entries automáticamente

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/warehouses
GET/POST/PATCH/DELETE  /api/v1/warehouse-locations
GET/POST/PATCH/DELETE  /api/v1/stock
GET/POST/PATCH/DELETE  /api/v1/product-batches
GET/POST/PATCH/DELETE  /api/v1/inventory-movements
```

---

### 4. Sales Module ✅ COMPLETO
**Entidades:** 2 (SalesOrder, SalesOrderItem)

#### Sales Orders
- **Tabla:** `sales_orders`
- **Campos Clave:**
  - `order_number`, `order_date`
  - **`contact_id`** (FK a contacts con is_customer=true)
  - **`ar_invoice_id`** (FK a ar_invoices, NULL hasta invoicing)
  - `status` (pending, approved, completed, cancelled)
  - `financial_status` (not_invoiced, invoiced, paid)
  - `invoicing_status` (not_invoiced, partially_invoiced, fully_invoiced)
  - `subtotal`, `tax_amount`, `total_amount`

#### Sales Order Items
- **Tabla:** `sales_order_items`
- **Campos:** `sales_order_id`, `product_id`, `quantity`, **`unit_price`**, `line_total`
- **Nota:** Los items SÍ tienen `unit_price` (precio acordado en esa transacción)

#### 🎯 Event-Driven Flow (CRÍTICO)
**Evento:** `SalesOrderCompleted`
**Trigger:** Cuando `status` cambia a `completed`
**Listener:** `SalesOrderCompletedListener`
**Acciones automáticas:**
1. Crea AR Invoice automáticamente
2. Crea Journal Entry en GL
3. Actualiza `ar_invoice_id` y `financial_status`
4. Protección de idempotencia (no duplica)

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/sales-orders
GET/POST/PATCH/DELETE  /api/v1/sales-order-items
GET                    /api/v1/sales-orders/reports
GET                    /api/v1/sales-orders/customers
```

---

### 5. Purchase Module ✅ COMPLETO
**Entidades:** 2 (PurchaseOrder, PurchaseOrderItem)

#### Purchase Orders
- **Tabla:** `purchase_orders`
- **Campos Clave:**
  - `order_number`, `order_date`
  - **`contact_id`** (FK a contacts con is_supplier=true)
  - **`ap_invoice_id`** (FK a ap_invoices, NULL hasta invoicing)
  - `status` (pending, approved, received, completed, cancelled)
  - `financial_status` (not_invoiced, invoiced, paid)
  - `total_amount`

#### 🎯 Event-Driven Flow (CRÍTICO)
**Evento:** `PurchaseOrderReceived`
**Trigger:** Cuando `status` cambia a `received`
**Listener:** `PurchaseOrderReceivedListener`
**Acciones automáticas:**
1. Crea AP Invoice automáticamente
2. Incrementa Stock en Inventory
3. Crea Journal Entry en GL
4. Actualiza `ap_invoice_id` y `financial_status`

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/purchase-orders
GET/POST/PATCH/DELETE  /api/v1/purchase-order-items
GET                    /api/v1/purchase-orders/reports
GET                    /api/v1/purchase-orders/suppliers
```

---

### 6. Finance Module ✅ COMPLETO
**Entidades:** 6 (ARInvoice, APInvoice, Payment, PaymentApplication, BankAccount, PaymentMethod)

#### 🔴 BREAKING CHANGES (2025-10-25)
**URLs cambiadas:**
- ❌ `/api/v1/a-p-invoices` → ✅ `/api/v1/ap-invoices`
- ❌ `/api/v1/a-r-invoices` → ✅ `/api/v1/ar-invoices`

**Resource types cambiados:**
- ❌ `"a-p-invoices"` → ✅ `"ap-invoices"`
- ❌ `"a-r-invoices"` → ✅ `"ar-invoices"`

#### AR Invoices (Accounts Receivable)
- **Tabla:** `ar_invoices`
- **Campos Clave:**
  - `invoice_number`, `invoice_date`, `due_date`
  - **`contact_id`** (FK a contacts con is_customer=true)
  - **`sales_order_id`** (FK a sales_orders, opcional)
  - `currency` (default MXN)
  - `subtotal`, `tax_amount`, `total_amount`
  - **`paid_amount`** (CALCULATED: suma de payment_applications)
  - **`remaining_balance`** (CALCULATED: total_amount - paid_amount)
  - `status` (draft, posted, partially_paid, paid, overdue, cancelled)
  - `journal_entry_id` (FK a journal_entries)

#### AP Invoices (Accounts Payable)
- **Tabla:** `ap_invoices`
- **Similar a AR pero con:**
  - **`contact_id`** (FK a contacts con is_supplier=true)
  - **`purchase_order_id`** (FK a purchase_orders, opcional)

#### Payments (Unificado)
- **Tabla:** `payments`
- **Tipos:** received (AR) o paid (AP)
- **Campos:**
  - `payment_number`, `payment_date`
  - **`contact_id`** (customer para AR, supplier para AP)
  - `amount`, `applied_amount`, `unapplied_amount`
  - `status` (unapplied, partial, applied)

#### Payment Applications
- **Tabla:** `payment_applications`
- **Une:** `payment_id` con `ar_invoice_id`
- **Campos:** `amount`, `application_date`

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/ar-invoices
GET/POST/PATCH/DELETE  /api/v1/ap-invoices
GET/POST/PATCH/DELETE  /api/v1/payments
GET/POST/PATCH/DELETE  /api/v1/payment-applications
GET/POST/PATCH/DELETE  /api/v1/bank-accounts
GET/POST/PATCH/DELETE  /api/v1/payment-methods
```

---

### 7. Accounting Module ✅ COMPLETO
**Entidades:** 11 (Chart of Accounts completo)

#### Accounts (Plan Contable)
- **Tabla:** `accounts`
- **Estructura:** `code` (4 dígitos: 1100, 2100, etc.)
- **Tipos:** asset, liability, equity, revenue, expense
- **Jerarquía:** `parent_id` (cuentas principales y subcuentas)

#### Journal Entries
- **Tabla:** `journal_entries`
- **Campos:** `entry_number`, `entry_date`, `status` (draft, posted)
- **Relación:** 1:N con `journal_lines`

#### Journal Lines
- **Tabla:** `journal_lines`
- **Campos:** `account_id`, `debit`, `credit`, `description`
- **Regla:** SUM(debit) = SUM(credit) (balanced entry)

#### Fiscal Periods
- **Tabla:** `fiscal_periods`
- **Campos:** `name`, `start_date`, `end_date`, `status` (open, closed)
- **Uso:** Control de cierre de períodos contables

#### 🎯 Automatic GL Posting
**Servicios que crean Journal Entries automáticamente:**
1. `ARInvoiceService::createInvoice()` → JE (DR AR, CR Revenue, CR VAT)
2. `APInvoiceService::createInvoice()` → JE (DR Expense, DR VAT, CR AP)
3. `PaymentService::applyPayment()` → JE (DR Bank, CR AR o DR AP, CR Bank)
4. `PayrollService::postToGeneralLedger()` → JE (DR Salary Expense, CR AP, CR Tax Payable)

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/accounts
GET/POST/PATCH/DELETE  /api/v1/account-balances
GET/POST/PATCH/DELETE  /api/v1/fiscal-periods
GET/POST/PATCH/DELETE  /api/v1/journals
GET/POST/PATCH/DELETE  /api/v1/journal-entries
GET/POST/PATCH/DELETE  /api/v1/journal-lines
GET/POST/PATCH/DELETE  /api/v1/exchange-rates
GET/POST/PATCH/DELETE  /api/v1/audit-logs
```

---

### 8. Ecommerce Module ✅ COMPLETO
**Entidades:** 11 (Phases 4.1 + 4.3)

#### Shopping Carts
- **Tabla:** `shopping_carts`
- **Campos:** `user_id`, `session_id`, `status`, `coupon_id`, `total_amount`

#### Cart Items
- **Tabla:** `cart_items`
- **Campos:** `shopping_cart_id`, `product_id`, `quantity`, `price`

#### Coupons
- **Tabla:** `coupons`
- **Tipos:** percentage, fixed_amount, free_shipping
- **Validaciones:** `valid_from`, `valid_until`, `usage_limit`, `times_used`

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/shopping-carts
GET/POST/PATCH/DELETE  /api/v1/cart-items
GET/POST/PATCH/DELETE  /api/v1/coupons
```

---

### 9. HR Module ✅ COMPLETO (Phase 4.4)
**Entidades:** 9 (Departments, Positions, Employees, Attendances, LeaveTypes, Leaves, PayrollPeriods, PayrollItems, PerformanceReviews)

#### Employees
- **Tabla:** `employees`
- **Campos:** `employee_number`, `first_name`, `last_name`, `email`, `department_id`, `position_id`, `salary`

#### Attendances
- **Tabla:** `attendances`
- **Campos:** `employee_id`, `date`, `check_in`, `check_out`
- **Auto-calculated:** `hours_worked`, `overtime_hours` (si > 8 horas)

#### Payroll Items
- **Tabla:** `payroll_items`
- **Campos:** `payroll_period_id`, `employee_id`, `basic_salary`, `allowances` (JSON), `deductions` (JSON)
- **Auto-calculated:** `gross_amount`, `deductions_total`, `net_amount`

#### 🎯 PayrollService Integration
**Método:** `PayrollService::postToGeneralLedger()`
**Crea:** Journal Entry automático en Accounting module
- **DR:** Salary Expense Account
- **CR:** Accounts Payable (net pay), Tax Payable (deductions)

**Endpoints:**
```
GET/POST/PATCH/DELETE  /api/v1/departments
GET/POST/PATCH/DELETE  /api/v1/positions
GET/POST/PATCH/DELETE  /api/v1/employees
GET/POST/PATCH/DELETE  /api/v1/attendances
GET/POST/PATCH/DELETE  /api/v1/leave-types
GET/POST/PATCH/DELETE  /api/v1/leaves
GET/POST/PATCH/DELETE  /api/v1/payroll-periods
GET/POST/PATCH/DELETE  /api/v1/payroll-items
GET/POST/PATCH/DELETE  /api/v1/performance-reviews
```

---

### 10. Reports Module ✅ COMPLETO (Phase 4.2)
**Sin tablas propias - Service Layer**

**Endpoints de reportes disponibles:**
```
GET /api/v1/sales-orders/reports
GET /api/v1/sales-orders/customers
GET /api/v1/purchase-orders/reports
GET /api/v1/purchase-orders/suppliers
GET /api/v1/products/reports
GET /api/v1/inventory/reports
```

---

## 🔑 JSON:API Conventions

### Naming Conventions (CRÍTICO)

| Contexto | Formato | Ejemplo |
|----------|---------|---------|
| **URLs** | kebab-case | `/api/v1/ar-invoices` |
| **Resource Types** | kebab-case | `"ar-invoices"` |
| **Attributes** | camelCase | `invoiceNumber`, `totalAmount` |
| **Relationships** | camelCase | `customer`, `journalEntry` |
| **Database Columns** | snake_case | `invoice_number`, `total_amount` |

### Request Format

```typescript
{
  "data": {
    "type": "products",         // kebab-case, plural
    "attributes": {
      "name": "Laptop Gaming",  // camelCase
      "price": 1500.00,
      "cost": 900.00,
      "iva": true
    },
    "relationships": {
      "category": {             // camelCase
        "data": {
          "type": "categories", // kebab-case
          "id": "2"             // ⚠️ STRING, not number
        }
      },
      "brand": {
        "data": { "type": "brands", "id": "1" }
      },
      "unit": {
        "data": { "type": "units", "id": "1" }
      }
    }
  }
}
```

### Include Pattern

```bash
# Incluir relaciones en response
GET /api/v1/products/1?include=category,brand,unit

# Múltiples niveles
GET /api/v1/sales-orders/1?include=customer,salesOrderItems.product
```

### Filter Pattern

```bash
# Filtro simple
GET /api/v1/contacts?filter[isCustomer]=true

# Filtro por relación
GET /api/v1/sales-orders?filter[contactId]=27

# Búsqueda de texto
GET /api/v1/products?filter[name]=laptop

# Combinar filtros
GET /api/v1/products?filter[name]=laptop&filter[isActive]=true
```

### Sort Pattern

```bash
# Ascendente
GET /api/v1/products?sort=name

# Descendente
GET /api/v1/products?sort=-price

# Múltiples campos
GET /api/v1/products?sort=-price,name
```

### Pagination Pattern

```bash
# Página específica
GET /api/v1/products?page[number]=2&page[size]=25

# Response incluye meta
{
  "meta": {
    "page": {
      "currentPage": 2,
      "total": 100,
      "perPage": 25
    }
  },
  "links": {
    "first": "/api/v1/products?page[number]=1",
    "prev": "/api/v1/products?page[number]=1",
    "next": "/api/v1/products?page[number]=3",
    "last": "/api/v1/products?page[number]=4"
  }
}
```

---

## 🔒 Authentication

### Laravel Sanctum
- **Método:** Bearer Token
- **Storage:** localStorage (frontend)
- **Header:** `Authorization: Bearer {token}`
- **Login:** `POST /api/auth/login`

### Login Flow

```typescript
// 1. Login
const response = await axios.post('/api/auth/login', {
  email: 'admin@example.com',
  password: 'password'
});

const token = response.data.token;
localStorage.setItem('api_token', token);

// 2. Set default header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 3. All subsequent requests authenticated
```

---

## ⚡ Business Flows (Event-Driven Architecture)

### 1. Order-to-Cash Flow
**Duración:** 2-5 días promedio
**Automatización:** 70%

```
1. Create Sales Order (manual)
   ↓
2. Approval Check (CreditManagementService)
   - Valida credit_limit
   - Detecta overdue invoices
   - Calcula payment_score
   ↓
3. Process Order (manual)
   - Reserva inventory
   - status = 'completed'
   ↓
4. 🎯 EVENT: SalesOrderCompleted (automático)
   ↓
5. Create AR Invoice (automático)
   ↓
6. Post to GL (automático)
   - DR Accounts Receivable
   - CR Sales Revenue
   - CR VAT Payable
   ↓
7. Record Payment (manual)
   ↓
8. Apply Payment (automático)
   - Actualiza paid_amount
   - Actualiza remaining_balance
   ↓
9. Post Payment to GL (automático)
   - DR Bank Account
   - CR Accounts Receivable
```

### 2. Procure-to-Pay Flow
**Duración:** 7-14 días promedio
**Automatización:** 75%

```
1. Create Purchase Order (manual)
   ↓
2. Approval Check (ApprovalWorkflowService)
   ↓
3. Receive Goods (manual)
   - status = 'received'
   ↓
4. 🎯 EVENT: PurchaseOrderReceived (automático)
   ↓
5. Create AP Invoice (automático)
   ↓
6. Update Stock (automático)
   - stock.quantity += received_quantity
   ↓
7. Post to GL (automático)
   - DR Inventory Asset
   - DR VAT Recoverable
   - CR Accounts Payable
   ↓
8. Record Payment (manual)
   ↓
9. Post Payment to GL (automático)
   - DR Accounts Payable
   - CR Bank Account
```

---

## 🎯 Business Rules Implementadas

### Credit Management
- **BR-SA-001:** Validar credit_limit antes de crear orden
- **BR-SA-002:** Calcular payment_score = (on_time / total_paid) × 100
- **BR-SA-003:** Bloquear nuevas órdenes si hay facturas vencidas

### Approval Workflow
- **BR-SA-004:** Amount > $100,000 → CFO approval
- **BR-SA-005:** Amount > $50,000 → Finance Manager approval
- **BR-SA-006:** Amount > $10,000 OR first-time customer → Sales Manager approval

### Inventory Management
- **BR-IV-001:** available_quantity = quantity - reserved_quantity
- **BR-IV-002:** FEFO strategy (First Expired, First Out)
- **BR-IV-003:** Prevenir stock negativo (salvo override)

### Financial Integration
- **BR-FI-001:** Invoice creation automática al completar orden
- **BR-FI-002:** GL posting automático en todas las transacciones
- **BR-FI-003:** Protección de idempotencia (no duplicar invoices)

---

## 📊 Performance Expectations

### API Response Times
- **Simple CRUD:** 50-150ms
- **Con includes:** 100-300ms
- **Event processing:** 2-5 segundos (async queue)
- **GL posting:** 100-200ms
- **Reports:** 500ms - 2s (dependiendo de data volume)

### Throughput Capacity
- **Concurrent users:** 100+ simultaneous
- **Orders per day:** 1,000+ (tested)
- **API requests/sec:** 50-100 (depending on complexity)

---

## ⚠️ Limitaciones y Consideraciones

### 1. Products Pagination
**Estado:** Backend NO implementa paginación estándar para products
**Workaround:** No usar `page[number]` y `page[size]` en /api/v1/products
**Razón:** Performance optimization pending

### 2. Campo unit_price en Products
**Error común:** Intentar acceder a `product.unit_price`
**Correcto:** Usar `product.price` (venta) o `product.cost` (costo)
**Nota:** `unit_price` SÍ existe en sales_order_items y purchase_order_items

### 3. Breaking Changes (2025-10-25)
**URLs actualizadas:**
- ~~`/api/v1/a-p-invoices`~~ → `/api/v1/ap-invoices`
- ~~`/api/v1/a-r-invoices`~~ → `/api/v1/ar-invoices`

**Resource types actualizados:**
- ~~`"a-p-invoices"`~~ → `"ap-invoices"`
- ~~`"a-r-invoices"`~~ → `"ar-invoices"`

### 4. Party Pattern en Finance
**CRÍTICO:** Finance module usa `contact_id`, NO `customer_id` o `supplier_id`
**Validación:** Request valida `is_customer` o `is_supplier` del contacto
**Impacto:** Frontend debe usar `contact_id` en todos los payloads

---

## 🔍 Testing Strategy

### Backend Testing
- **Total tests:** 1,400+
- **Coverage:** 94.5% overall
- **Framework:** PHPUnit + Pest
- **Factories:** Disponibles para todos los modelos

### Testing Approach para Frontend
1. **Use factories:** Seeders crean data consistente
2. **Test users disponibles:**
   - `admin@example.com` / `password` (full access)
   - `tech@example.com` / `password` (read-only)
   - `customer@example.com` / `password` (limited)
3. **Ambientes:**
   - Dev: `http://localhost:8000`
   - Testing: DB separada con `APP_ENV=testing`

---

## 🎯 Lo que NECESITO del Backend

### 1. Endpoints Críticos para Sincronizar Frontend
✅ **Disponibles:**
- `/api/v1/products` - OK, actualizar frontend a nueva estructura
- `/api/v1/contacts` - OK, migrar de customers/suppliers a contacts
- `/api/v1/sales-orders` - OK
- `/api/v1/purchase-orders` - OK
- `/api/v1/ar-invoices` - ⚠️ BREAKING CHANGE aplicado
- `/api/v1/ap-invoices` - ⚠️ BREAKING CHANGE aplicado
- `/api/v1/employees` - ✅ NUEVO (Phase 4.4)

### 2. Documentación de Módulos Faltantes en Frontend
- ❌ **Inventory Module:** Frontend NO tiene UI
- ❌ **Finance Module:** Frontend NO tiene UI completa
- ❌ **Accounting Module:** Frontend NO tiene UI
- ❌ **HR Module:** Frontend NO tiene UI (recién implementado)
- ❌ **Reports Module:** Frontend NO consume endpoints de reports

### 3. Clarificaciones Necesarias
Ver archivo `BACKEND_QUESTIONS.md` para preguntas específicas.

---

## 📝 Próximos Pasos

### Para Sincronizar Frontend con Backend:
1. ✅ Actualizar módulo Products para eliminar referencias a `unit_price`
2. ✅ Actualizar módulo Contacts para usar Party Pattern
3. ✅ Migrar Finance module a nuevos endpoints (`ap-invoices`, `ar-invoices`)
4. ⬜ Implementar Inventory Module UI
5. ⬜ Implementar Finance Module UI completa
6. ⬜ Implementar HR Module UI
7. ⬜ Implementar Reports visualization

### Para Mejorar Integración:
1. ⬜ Documentar todos los eventos disponibles
2. ⬜ Crear TypeScript types basados en schemas del backend
3. ⬜ Implementar error handling consistente
4. ⬜ Agregar loading states para operaciones async
5. ⬜ Implementar retry logic para eventos fallidos

---

**Última Actualización:** 2025-10-31
**Versión Backend:** v1 (Post-Phase 4.4)
**Estado:** ✅ Análisis Completo
