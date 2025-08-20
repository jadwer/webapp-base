# 🗺️ ENTERPRISE MODULES ROADMAP
## Plan Maestro de Desarrollo - Módulos Inventory, Ecommerce, Finance y Accounting

**Fecha:** Agosto 20, 2025  
**Versión:** 2.0.0  
**Metodología:** Simplified-First Blueprint (Validado)  
**Estado General:** 70% Completado → 100% Planeado

---

## 📊 **ESTADO ACTUAL ANALIZADO**

### **✅ MÓDULOS COMPLETADOS (ENTERPRISE READY)**
1. **Products** - Sistema enterprise completo (4 entidades, 5 vistas virtualizadas)
2. **Contacts** - Sistema complejo con document management 
3. **Purchase/Sales** - Órdenes de compra y venta con workflows
4. **Auth/Users/Roles** - Sistema de autenticación completo
5. **Page Builder Pro** - Constructor visual GrapeJS

### **🔧 MÓDULOS ANALIZADOS**
6. **Inventory** - **85% COMPLETO** - Solo falta integración ProductBatch

### **🎯 MÓDULOS NUEVOS POR DESARROLLAR**
7. **Ecommerce** - Carrito, cupones, checkout (3 entidades)
8. **Finance** - Facturas, pagos, banking (11 entidades) 
9. **Accounting** - Contabilidad, asientos, periodos (6 entidades)

---

## 🔍 **ANÁLISIS TÉCNICO DETALLADO**

### **📦 MÓDULO INVENTORY - COMPLETAR**

**✅ YA COMPLETADO:**
- ✅ Warehouses - CRUD completo con AdminPageReal
- ✅ Locations - Gestión jerárquica A-1-2-3
- ✅ Stock - Tracking cantidades con costs
- ✅ Inventory Movements - Audit trail completo
- ✅ Testing Infrastructure - 70%+ coverage validado
- ✅ Professional UX - Forms, navigation, error handling

**🔄 PENDIENTE (2-3 horas):**
- ❌ **ProductBatch Integration** - Backend disponible, frontend faltante
- ❌ **Batch Expiration Tracking** - Hook implementado pero no integrado
- ❌ **Batch-Stock Relationship** - UI para gestión de lotes

**Backend API Ya Disponible:**
```bash
GET    /api/v1/product-batches
POST   /api/v1/product-batches  
PATCH  /api/v1/product-batches/{id}
DELETE /api/v1/product-batches/{id}

# Campos clave: batchNumber, lotNumber, expirationDate,
# currentQuantity, unitCost, supplierName, status
```

---

### **🛒 MÓDULO ECOMMERCE - NUEVO**

**📋 Backend Entities Disponibles:**
1. **ShoppingCart** - Carritos con session management
2. **CartItem** - Items con pricing y discounts
3. **Coupon** - Sistema cupones con validations

**🎯 Complejidad:** **SIMPLE** (AdminPageReal pattern)

**Key Features a Implementar:**
```typescript
// ShoppingCart Management
- Session-based carts (guests)
- User-based carts (logged)
- Cart expiration handling
- Total calculation engine

// CartItem Management  
- Product addition/removal
- Quantity updates
- Price calculations
- Discount applications

// Coupon System
- Code validation
- Discount calculations
- Usage tracking
- Expiration handling
```

**🔗 Integrations Required:**
- Ecommerce → Products (cart items)
- Ecommerce → Contacts (customers)
- Ecommerce → Sales (cart → order conversion)

**⏱️ Tiempo estimado:** 3-4 horas

---

### **💰 MÓDULO FINANCE - NUEVO**

**📋 Backend Entities (11 total):**

**Accounts Payable (AP):**
- APInvoice - Facturas proveedores
- APInvoiceLine - Líneas facturas
- APPayment - Pagos a proveedores  
- APInvoicePayment - Aplicación pagos

**Accounts Receivable (AR):**
- ARInvoice - Facturas clientes
- ARInvoiceLine - Líneas facturas
- ARReceipt - Cobros clientes
- ARInvoiceReceipt - Aplicación cobros

**Banking:**
- BankAccount - Cuentas bancarias
- BankStatement - Estados cuenta
- BankStatementLine - Movimientos bancarios

**🎯 Complejidad:** **COMPLEJA** (AdminPagePro + FormWrapper patterns)

**Business Logic Critical:**
```typescript
// Invoice-Payment Matching
- Partial payments tracking
- Currency conversion
- Payment allocation
- Outstanding balances

// Multi-currency Support
- Exchange rate handling
- Currency conversion
- Reporting in base currency

// Bank Reconciliation
- Statement import
- Transaction matching
- Variance reporting
```

**🔗 Complex Relationships:**
- Finance → Contacts (customers/suppliers)
- Finance → Products (invoice lines)
- Finance → Purchase/Sales (auto invoice generation)

**⏱️ Tiempo estimado:** 6-8 horas

---

### **📊 MÓDULO ACCOUNTING - NUEVO**

**📋 Backend Entities (6 total):**
1. **Account** - Plan cuentas jerárquico
2. **Journal** - Diarios contables
3. **JournalEntry** - Asientos contables
4. **JournalLine** - Líneas asientos
5. **FiscalPeriod** - Periodos fiscales
6. **ExchangeRate** - Tipos cambio

**🎯 Complejidad:** **MUY COMPLEJA** (Enterprise Business Logic)

**Critical Business Rules:**
```typescript
// Chart of Accounts Hierarchy
- Multi-level account structure (1000, 1100, 1110, etc)
- Account types (Asset, Liability, Equity, Revenue, Expense)
- Postable vs Summary accounts
- Account currency handling

// Journal Entry Balancing
- Debit = Credit validation
- Multi-currency entries
- Automatic exchange rates
- Period validation

// Fiscal Period Controls
- Open/Closed period validation
- Backposting permissions
- Period-end processes
- Audit trail maintenance
```

**Enterprise Features Required:**
- Account hierarchy tree view
- Journal entry forms con balancing
- Period management con controls
- Multi-currency con conversion
- Professional error validation
- Audit trail completo

**⏱️ Tiempo estimado:** 8-12 horas

---

## 📅 **CRONOGRAMA OPTIMIZADO**

### **🎯 PRIORIDADES ESTABLECIDAS**

**Prioridad 1:** Completar Inventory (ProductBatch)
**Prioridad 2:** Implementar Ecommerce (critical for business)
**Prioridad 3:** Implementar Finance (AP/AR management)
**Prioridad 4:** Implementar Accounting (enterprise compliance)

### **📋 SPRINT PLAN DETALLADO**

#### **SEMANA 1: COMPLETAR INVENTORY**
**Objetivo:** ProductBatch integration 100%

**Día 1 (2 horas):**
- [ ] ProductBatch CRUD (AdminPageReal pattern)
- [ ] ProductBatch form con validations
- [ ] Integration con Stock entity

**Día 2 (1 hora):**
- [ ] Expiration tracking integration
- [ ] Testing ProductBatch features
- [ ] Documentation updates

**✅ Entregables:**
- Inventory module 100% completo
- ProductBatch fully integrated
- All tests passing 70%+

---

#### **SEMANA 2: ECOMMERCE MODULE**
**Objetivo:** Sistema e-commerce completo

**Día 1 (2 horas):**
- [ ] Module structure + ShoppingCart CRUD
- [ ] Cart session management
- [ ] Basic cart operations

**Día 2 (2 horas):**
- [ ] CartItem management
- [ ] Coupon system implementation
- [ ] Cart → Sales order conversion

**✅ Entregables:**
- Ecommerce module funcional
- 3 entidades operativas
- Integration con Products/Contacts/Sales
- Basic testing implemented

---

#### **SEMANA 3-4: FINANCE MODULE**
**Objetivo:** Sistema financiero enterprise

**Día 1-2 (4 horas) - Accounts Payable:**
- [ ] APInvoice + APInvoiceLine (FormWrapper)
- [ ] APPayment + APInvoicePayment
- [ ] Supplier integration

**Día 3-4 (4 horas) - Accounts Receivable:**
- [ ] ARInvoice + ARInvoiceLine
- [ ] ARReceipt + ARInvoiceReceipt
- [ ] Customer integration

**Día 5 (2 horas) - Banking:**
- [ ] BankAccount management
- [ ] BankStatement processing
- [ ] Integration testing

**✅ Entregables:**
- Finance module completo
- 11 entidades funcionando
- Multi-currency support
- Professional invoice-payment matching

---

#### **SEMANA 5-6: ACCOUNTING MODULE**
**Objetivo:** Sistema contable profesional

**Día 1-2 (4 horas) - Chart of Accounts:**
- [ ] Account hierarchy management
- [ ] Account types y validations
- [ ] Professional tree navigation

**Día 3-4 (4 horas) - Journal System:**
- [ ] Journal configuration
- [ ] JournalEntry creation con balancing
- [ ] JournalLine management

**Día 5-6 (4 horas) - Advanced Features:**
- [ ] FiscalPeriod controls
- [ ] ExchangeRate management
- [ ] Period validation logic

**✅ Entregables:**
- Accounting module enterprise-ready
- Chart of accounts jerárquico
- Journal entry balancing system
- Professional fiscal controls

---

## 🛠️ **ESPECIFICACIONES TÉCNICAS**

### **🎨 PATRONES POR MÓDULO**

#### **Inventory (Completar):**
- **Pattern:** AdminPageReal (mantener simplicity)
- **Scope:** Solo ProductBatch integration
- **Testing:** Extend existing coverage
- **Time:** 2-3 horas

#### **Ecommerce:**
- **Pattern:** AdminPageReal 
- **Features:** Cart management, coupon validation
- **Integration:** Products, Contacts, Sales
- **Time:** 3-4 horas

#### **Finance:**
- **Pattern:** AdminPagePro + FormWrapper
- **Features:** Invoice-payment matching, multi-currency
- **Business Logic:** Payment allocation, balance tracking
- **Time:** 6-8 horas

#### **Accounting:**
- **Pattern:** AdminPagePro + Custom Logic
- **Features:** Account hierarchy, journal balancing
- **Business Logic:** Period controls, debit=credit validation
- **Time:** 8-12 horas

### **🔧 TECHNICAL STACK**

**Validated Frontend Stack:**
- Next.js 15 App Router ✅
- TypeScript strict mode ✅
- SWR + useState (no Zustand unless complex UI) ✅
- Bootstrap + Custom SASS ✅ 
- Vitest testing (70% minimum) ✅

**Backend Integration:**
- JSON:API v1.1 compliance ✅
- Laravel Sanctum authentication ✅
- Relationship includes strategy ✅

---

## 🚨 **RIESGOS Y MITIGATION**

### **⚠️ IDENTIFIED RISKS**

#### **Complexity Risks:**
1. **Accounting Business Logic** 
   - *Risk:* Over-complex implementation
   - *Mitigation:* Start simple, progressive enhancement
   - *Fallback:* AdminPageReal if exceeds time

2. **Finance Multi-currency**
   - *Risk:* Exchange rate complexity
   - *Mitigation:* Basic implementation first
   - *Enhancement:* Advanced features later

3. **Testing Coverage Pressure**
   - *Risk:* Time pressure to skip tests
   - *Mitigation:* Testing during development
   - *Policy:* No deployment < 70% coverage

#### **Time Risks:**
1. **Scope Creep**
   - *Mitigation:* Strict MVP definition
   - *Timeboxing:* Maximum hours per module
   - *Progressive:* Enhancement after core completion

### **🛡️ MITIGATION STRATEGIES**

#### **Simplicity-First Enforcement:**
- Start AdminPageReal para todos
- Upgrade only after business validation
- Document complexity decisions

#### **Testing Integration:**
- Tests concurrent con development
- CI/CD enforcement
- Mock factories consistency

---

## 📈 **SUCCESS METRICS**

### **📊 COMPLETION CRITERIA**

**Per Module:**
- [ ] CRUD completo todas entidades
- [ ] Test coverage ≥ 70%
- [ ] TypeScript strict compliance
- [ ] Professional UX con error handling
- [ ] API integration validated
- [ ] Documentation updated

**Integration Requirements:**
- [ ] Backend APIs tested con curl
- [ ] JSON:API compliance verified
- [ ] Relationships loading correctly
- [ ] Error handling robust

### **🎯 QUALITY GATES**

**Code Quality:**
- ESLint: 0 errors
- TypeScript: 0 any types
- Build: Successful sin warnings
- Performance: <500ms loads

**Business Quality:**
- All entities operational
- Critical workflows functioning
- User experience professional
- Error scenarios handled

---

## 🔄 **POST-IMPLEMENTATION**

### **📅 EVOLUTION ROADMAP**

#### **Q1 2025 - Stabilization:**
- User feedback integration
- Performance optimization
- Additional test coverage
- Bug fixes

#### **Q2 2025 - Enhancement:**
- Advanced features
- Mobile optimization
- Real-time capabilities
- Advanced reporting

#### **Q3 2025 - Integration:**
- Third-party APIs
- Import/Export tools
- Advanced security
- Backup systems

---

## 📚 **REFERENCIAS**

### **🔗 Key Documents**
- **Blueprint:** `MODULE_ARCHITECTURE_BLUEPRINT.md`
- **Guidelines:** `CLAUDE.md`
- **API Docs:** `/api-base/docs/api/`
- **Testing:** `vitest.config.ts`

### **🏆 Success Patterns**
- **Simple Pattern:** Inventory (4 hours success)
- **Enterprise Pattern:** Products (complex but robust)
- **Error Handling:** Contacts (professional UX)
- **JSON:API:** All modules (consistent integration)

---

**🎊 ROADMAP STATUS: COMPREHENSIVE ANALYSIS COMPLETE**  
**🚀 READY FOR: Systematic Implementation**  
**⏱️ TOTAL TIME ESTIMATED: 18-25 horas across 4 modules**  
**🎯 TARGET: Complete Enterprise ERP System**

---

*Análisis completo realizado: Agosto 20, 2025*  
*Metodología: Simplified-First Blueprint + Enterprise Patterns*  
*Estado: Production-Ready Architecture Validated*

### ✅ 1. **Products Module** (Enterprise Level)
**Estado:** ✅ COMPLETADO | **Complejidad:** ⭐⭐⭐⭐⭐ | **Tiempo:** 25+ horas

**Entidades (4):**
- Products (principal)
- Categories
- Brands  
- Units

**Características Enterprise:**
- 🚀 5 vistas virtualizadas (Table/Grid/List/Compact/Showcase)
- 🎯 Zero re-renders con Zustand UI state
- 📊 TanStack Virtual para 1000+ items
- 🔍 Filtros con debounce 300ms
- ✨ CRUD completo todas las entidades
- 🔧 Error handling con FK constraints
- 📱 Professional ConfirmModal
- 📈 Paginación profesional

**Rutas:**
- `/dashboard/products` - Listado principal
- `/dashboard/products/create` - Crear producto
- `/dashboard/products/[id]` - Ver producto
- `/dashboard/products/[id]/edit` - Editar producto
- `/dashboard/products/units/*` - CRUD Units
- `/dashboard/products/categories/*` - CRUD Categories
- `/dashboard/products/brands/*` - CRUD Brands

---

### ✅ 2. **Contacts Module** (Full-CRUD)
**Estado:** ✅ COMPLETADO | **Complejidad:** ⭐⭐⭐⭐ | **Tiempo:** 8 horas

**Entidades (4):**
- Contacts (individuals/companies)
- ContactAddresses
- ContactDocuments
- ContactPeople

**Características:**
- 📄 Document management system
- 🔍 Verificación de documentos
- 📊 Tabbed interface
- 🎯 JSON:API includes strategy
- ✨ Professional modals
- 📱 Error handling avanzado

**Rutas:**
- `/dashboard/contacts` - Listado
- `/dashboard/contacts/create` - Crear
- `/dashboard/contacts/[id]` - Ver
- `/dashboard/contacts/[id]/edit` - Editar

---

### ✅ 3. **Inventory Module** (Simple Pattern)
**Estado:** ✅ COMPLETADO | **Complejidad:** ⭐⭐⭐ | **Tiempo:** 4 horas

**Entidades (5):**
- Warehouses
- Locations
- Stock
- ProductBatch
- InventoryMovements

**Características:**
- 📊 AdminPageReal pattern (exitoso)
- ✅ Testing 70%+ coverage
- 🎯 Patrón simple funcional
- 📱 Forms con validación
- 🔄 Integration con Products

**Rutas:**
- `/dashboard/inventory/*` - Dashboard principal
- `/dashboard/inventory/warehouses/*` - CRUD
- `/dashboard/inventory/locations/*` - CRUD
- `/dashboard/inventory/stock/*` - CRUD
- `/dashboard/inventory/product-batch/*` - CRUD
- `/dashboard/inventory/movements/*` - CRUD

---

### ✅ 4. **Auth Module**
**Estado:** ✅ COMPLETADO | **Complejidad:** ⭐⭐⭐ | **Tiempo:** 3 horas

**Características:**
- 🔐 Laravel Sanctum integration
- 🎯 Bearer token management
- 📱 Login/Register/Logout
- 👤 Profile management
- 🔄 Auto token injection

---

### ✅ 5. **Roles & Permissions**
**Estado:** ✅ COMPLETADO | **Complejidad:** ⭐⭐⭐ | **Tiempo:** 4 horas

**Características:**
- 🔑 Complete permission system
- 👥 Role management
- 🎯 Permission matrix
- 🔐 Role guards
- 📊 Dynamic permissions

---

### ✅ 6. **Users Module**
**Estado:** ✅ COMPLETADO | **Complejidad:** ⭐⭐ | **Tiempo:** 2 horas

**Características:**
- 👤 User CRUD
- 🔑 Role assignment
- 📊 User table
- ✨ Form validation

---

### ✅ 7. **Page Builder Pro**
**Estado:** ✅ COMPLETADO | **Complejidad:** ⭐⭐⭐⭐⭐ | **Tiempo:** 12 horas

**Características:**
- 🎨 GrapeJS integration
- 📄 Visual page editor
- 🔧 Custom blocks
- 📱 Public page rendering
- 🎯 Template system

---

## 🔄 MÓDULOS EN DESARROLLO (2/10)

### 🟡 8. **Sales Module**
**Estado:** 🔄 INICIADO (30%) | **Complejidad:** ⭐⭐⭐ | **Tiempo estimado:** 4-6 horas

**Archivos creados:**
- ✅ Estructura básica (components, hooks, services, types)
- ✅ Templates skeleton
- ✅ Tests básicos
- ⏳ Falta implementación real

**Pendiente:**
```typescript
// Próximos pasos:
1. Validar API endpoints con curl
2. Implementar SalesOrdersAdminPageReal
3. Crear SalesOrderForm con items
4. Hooks: useSalesOrders, useSalesOrderMutations
5. Testing 70%+ coverage
```

**Rutas planeadas:**
- `/dashboard/sales` - Listado órdenes
- `/dashboard/sales/create` - Nueva orden
- `/dashboard/sales/[id]` - Ver orden
- `/dashboard/sales/[id]/edit` - Editar orden

---

### 🟡 9. **Purchase Module**
**Estado:** 🔄 INICIADO (30%) | **Complejidad:** ⭐⭐⭐ | **Tiempo estimado:** 4-5 horas

**Archivos creados:**
- ✅ Estructura básica similar a Sales
- ✅ Templates skeleton
- ⏳ Falta implementación

**Pendiente:**
```typescript
// Reutilizar 80% del código de Sales:
1. Copy & adapt Sales patterns
2. Suppliers = Contacts (ya existe)
3. Integration con Inventory
4. Testing completo
```

**Rutas planeadas:**
- `/dashboard/purchase` - Listado
- `/dashboard/purchase/create` - Nueva orden
- `/dashboard/purchase/[id]` - Ver
- `/dashboard/purchase/[id]/edit` - Editar

---

## 📅 MÓDULOS PENDIENTES (1/10)

### ⏳ 10. **Ecommerce Module**
**Estado:** ❌ NO INICIADO | **Complejidad:** ⭐⭐⭐⭐ | **Tiempo estimado:** 6-8 horas

**Scope planeado:**
```typescript
// Entidades principales:
- ShoppingCart
- CartItems
- Coupons
- Checkout process

// Features:
- Cart management (add/remove/update)
- Cart → SalesOrder conversion
- Coupon validation system
- Guest checkout
- Customer checkout
```

**Dependencias:**
- ✅ Products (completado)
- ⏳ Sales (necesario para orders)
- ✅ Contacts (para customers)

---

## 📈 PATRONES DE ÉXITO VALIDADOS

### ✅ **AdminPageReal Pattern** (4-6 horas)
```typescript
// Patrón exitoso del módulo Inventory
const AdminPageReal = () => {
  // 1. Un hook principal
  const { data, isLoading, mutate } = useMainEntity()
  
  // 2. Estado local simple
  const [filters, setFilters] = useState({})
  
  // 3. Tabla simple con acciones
  return <TableSimple data={data} />
}
```

### ❌ **EVITAR: Over-engineering inicial**
```typescript
// NO hacer esto desde el inicio:
- Multiple stores Zustand
- 5+ hooks especializados  
- Controllers separados
- Business logic dispersa
- AdminPagePro sin validar necesidad
```

---

## 🎯 PRIORIDADES INMEDIATAS

### **Sprint 1: Completar Sales & Purchase** (1 semana)
```bash
Prioridad 1: Sales Module (4-6h)
├── Validar API con curl
├── AdminPageReal pattern
├── Forms con items management
└── Testing 70%+

Prioridad 2: Purchase Module (4-5h)
├── Copy Sales patterns
├── Adapt para proveedores
├── Integration Inventory
└── Testing completo
```

### **Sprint 2: Ecommerce Module** (1 semana)
```bash
Prioridad 3: Ecommerce (6-8h)
├── Shopping cart base
├── Cart → Order conversion
├── Coupon system básico
└── Checkout flow
```

---

## 📊 MÉTRICAS DEL PROYECTO

### **Estadísticas de Desarrollo**
| Métrica | Valor | Tendencia |
|---------|-------|-----------|
| Módulos Completados | 7/10 (70%) | ↗️ |
| Coverage Testing Promedio | 70%+ | ✅ |
| Tiempo Promedio/Módulo (Simple) | 4-6 horas | ⚡ |
| Tiempo Promedio/Módulo (Enterprise) | 15-25 horas | ⚠️ |
| Líneas de Código | ~50,000 | 📈 |
| Componentes Reutilizables | 85+ | ♻️ |

### **Módulos por Complejidad**
- ⭐⭐ Simple: Users (2h)
- ⭐⭐⭐ Medio: Auth, Roles, Inventory, Sales, Purchase (4-6h)
- ⭐⭐⭐⭐ Complejo: Contacts, Ecommerce (8h)
- ⭐⭐⭐⭐⭐ Enterprise: Products, Page Builder (15-25h)

### **Stack Tecnológico Confirmado**
```json
{
  "framework": "Next.js 15 con App Router",
  "language": "TypeScript (strict mode)",
  "styling": "SASS Modules + Bootstrap Icons",
  "state": "SWR (server) + useState (UI)",
  "performance": "TanStack Virtual + React.memo",
  "testing": "Vitest + Testing Library (70%+)",
  "auth": "Laravel Sanctum",
  "api": "JSON:API specification",
  "backend": "Laravel 11 con JSON:API"
}
```

---

## 🚀 RECOMENDACIONES ESTRATÉGICAS

### **1. Mantener Simplicidad**
- ✅ AdminPageReal primero (4-6h)
- ✅ Upgrade a Pro solo si necesario
- ✅ Un hook principal por entidad
- ✅ Testing desde día 1

### **2. Reutilización Máxima**
- ✅ Sales → Purchase (80% código)
- ✅ Contacts → Suppliers/Customers
- ✅ Products → Catalog/Inventory

### **3. Validación Temprana**
```bash
# Siempre antes de codear:
curl -H "Authorization: Bearer TOKEN" \
     -H "Accept: application/vnd.api+json" \
     "http://127.0.0.1:8000/api/v1/sales-orders"
```

### **4. Testing Obligatorio**
```bash
# Mínimo 70% coverage
npm run test:coverage

# CI/CD bloqueará si < 70%
```

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### **Lecciones Aprendidas**
1. **Inventory Success Story:** Patrón simple en 4 horas funcionando perfectamente
2. **Products Over-engineering:** 25+ horas pero resultado enterprise robusto
3. **Testing Crítico:** 2 módulos perdidos por no tener tests desde inicio
4. **API First:** Validar endpoints ahorra 50% tiempo debugging

### **Decisiones Arquitectónicas**
- **NO Controllers:** Logic en hooks/services
- **NO Redux:** SWR + useState suficiente
- **SI Modular:** 100% independencia entre módulos
- **SI Testing:** Obligatorio desde día 1

---

## 🏁 CONCLUSIÓN

El proyecto está en excelente estado con 70% completitud y arquitectura sólida probada. Los patrones están validados, el testing es obligatorio, y la ruta está clara: completar Sales/Purchase con patrón simple, luego Ecommerce para tener el ERP completo funcional.

**Tiempo estimado para 100%:** 2-3 semanas con desarrollo focused.

---

*Documento generado tras análisis completo del codebase - 2025-08-20*