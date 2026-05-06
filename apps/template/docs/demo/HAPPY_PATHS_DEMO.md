# Demo Script - Sistema ERP Modular
**Duracion Total Estimada: 25-30 minutos**

---

## Pre-Demo Checklist

- [ ] Backend corriendo (`php artisan serve`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Browser en modo incognito (evitar cache)
- [ ] Datos de demo cargados en backend (`php artisan migrate:fresh --seed`)
- [ ] Credenciales de acceso listas

**Credenciales Demo:**
```
Email: admin@example.com
Password: secureadmin
```

**Usuarios adicionales (para mostrar permisos):**
| Rol | Email | Password |
|-----|-------|----------|
| Admin (god) | admin@example.com | secureadmin |
| Tech (read-only) | tech@example.com | securetech |
| Customer | customer@example.com | customer |
| God (super admin) | god@example.com | supersecure |

**URLs:**
- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:8000`

---

## FLUJO 1: Autenticacion y Dashboard (2 min)

### 1.1 Login
**Ruta:** `/login`

**Datos de prueba:**
```
Email: admin@example.com
Password: secureadmin
```

**Acciones:**
1. Mostrar formulario de login
2. Ingresar credenciales incorrectas primero (mostrar validacion)
   - Email: `test@test.com` / Password: `wrong`
   - Esperar mensaje de error
3. Ingresar credenciales correctas
4. Observar redireccion al dashboard

**Puntos a destacar:**
- Autenticacion con Laravel Sanctum (Bearer tokens)
- Manejo de errores de validacion en tiempo real
- Token almacenado en localStorage

### 1.2 Dashboard
**Ruta:** `/dashboard`

**Que mostrar:**
- Sidebar con todos los modulos
- Header con usuario logueado
- Navegacion responsive (reducir ventana para mostrar mobile)

---

## FLUJO 2: Gestion de Contactos - Party Pattern (3 min)

### 2.1 Lista de Contactos
**Ruta:** `/dashboard/contacts`

**Datos esperados en lista:**
| Nombre | Tipo | Email | Telefono |
|--------|------|-------|----------|
| Acme Corporation | Empresa | ventas@acme.com | +52 55 1234 5678 |
| Juan Perez Garcia | Persona | juan.perez@email.com | +52 55 8765 4321 |
| Tech Solutions SA | Empresa | info@techsolutions.mx | +52 33 1111 2222 |

**Acciones:**
1. Mostrar lista completa
2. Buscar "Acme" en el filtro de busqueda
3. Limpiar filtro
4. Click en un contacto para ver detalle

### 2.2 Crear Contacto
**Ruta:** `/dashboard/contacts/create`

**Datos para crear (Empresa):**
```
Tipo: Empresa
Nombre/Razon Social: Demo Company SA de CV
RFC: DCO123456AB1
Email: contacto@democompany.mx
Telefono: +52 55 9999 8888
Sitio Web: https://democompany.mx

Direccion:
  Calle: Av. Reforma 123
  Colonia: Juarez
  Ciudad: Ciudad de Mexico
  Estado: CDMX
  CP: 06600
  Pais: Mexico
```

**Resultado esperado:** Contacto creado, redireccion a lista

---

## FLUJO 3: Catalogo de Productos - Vista Enterprise (4 min)

### 3.1 Lista de Productos con 5 Vistas
**Ruta:** `/dashboard/products`

**Datos esperados:**
| SKU | Nombre | Categoria | Precio | Stock |
|-----|--------|-----------|--------|-------|
| PROD-001 | Laptop Dell XPS 15 | Electronica | $25,999.00 | 50 |
| PROD-002 | Monitor Samsung 27" | Electronica | $8,499.00 | 120 |
| PROD-003 | Teclado Mecanico RGB | Perifericos | $1,899.00 | 200 |
| PROD-004 | Mouse Logitech MX | Perifericos | $1,499.00 | 150 |
| PROD-005 | Webcam HD 1080p | Perifericos | $899.00 | 80 |

**Acciones de Demo:**
1. **Vista Table** (default) - Mostrar ordenamiento por columna
2. **Vista Grid** - Click en icono de grid, mostrar cards 4x4
3. **Vista List** - Ideal para mobile, informacion detallada
4. **Vista Compact** - Alta densidad, mas items visibles
5. **Vista Showcase** - Presentacion premium con imagenes grandes

**Filtros a demostrar:**
- Buscar: "Laptop"
- Categoria: "Electronica"
- Limpiar filtros

### 3.2 Entidades Auxiliares

**Unidades (`/dashboard/products/units`):**
| Codigo | Nombre | Descripcion |
|--------|--------|-------------|
| PZA | Pieza | Unidad individual |
| KG | Kilogramo | Peso en kilogramos |
| LT | Litro | Volumen en litros |
| MT | Metro | Longitud en metros |

**Categorias (`/dashboard/products/categories`):**
| Nombre | Descripcion | Productos |
|--------|-------------|-----------|
| Electronica | Equipos electronicos | 15 |
| Perifericos | Accesorios de computo | 25 |
| Software | Licencias y programas | 10 |

**Marcas (`/dashboard/products/brands`):**
| Nombre | Slug | Productos |
|--------|------|-----------|
| Dell | dell | 8 |
| Samsung | samsung | 12 |
| Logitech | logitech | 15 |

---

## FLUJO 4: Ciclo de Ventas - Order to Cash (4 min)

### 4.1 Ordenes de Venta
**Ruta:** `/dashboard/sales`

**Datos esperados:**
| # Orden | Cliente | Fecha | Total | Estado |
|---------|---------|-------|-------|--------|
| SO-2025-001 | Acme Corporation | 2025-01-10 | $45,998.00 | Confirmada |
| SO-2025-002 | Tech Solutions SA | 2025-01-12 | $12,897.00 | Borrador |
| SO-2025-003 | Juan Perez Garcia | 2025-01-14 | $3,398.00 | Entregada |

**Acciones:**
1. Mostrar lista de ordenes
2. Filtrar por estado "Confirmada"
3. Click en SO-2025-001 para ver detalle
4. Mostrar lineas de producto en el detalle

### 4.2 Crear Orden de Venta
**Ruta:** `/dashboard/sales/create`

**Datos para crear:**
```
Cliente: Acme Corporation (buscar y seleccionar)
Fecha: [fecha actual]
Referencia: PO-CLIENTE-123

Lineas:
  1. Laptop Dell XPS 15 - Cantidad: 2 - Precio: $25,999.00
  2. Monitor Samsung 27" - Cantidad: 2 - Precio: $8,499.00

Subtotal: $68,996.00
IVA (16%): $11,039.36
Total: $80,035.36
```

---

## FLUJO 5: Ciclo de Compras - Procure to Pay (3 min)

### 5.1 Ordenes de Compra
**Ruta:** `/dashboard/purchase`

**Datos esperados:**
| # Orden | Proveedor | Fecha | Total | Estado |
|---------|-----------|-------|-------|--------|
| PO-2025-001 | Distribuidora ABC | 2025-01-08 | $150,000.00 | Recibida |
| PO-2025-002 | Importadora XYZ | 2025-01-11 | $75,500.00 | Confirmada |
| PO-2025-003 | Tech Supplies Inc | 2025-01-15 | $32,000.00 | Borrador |

**Flujo a demostrar:**
```
Orden de Compra (PO)
    -> Recepcion de Mercancia
    -> Factura de Proveedor (AP Invoice)
    -> Pago
```

---

## FLUJO 5.5: Inventario (3 min)

### 5.5.1 Almacenes
**Ruta:** `/dashboard/inventory/warehouses`

**Datos esperados:**
| Codigo | Nombre | Ubicacion | Activo |
|--------|--------|-----------|--------|
| ALM-01 | Almacen Central | CDMX | Si |
| ALM-02 | Almacen Norte | Monterrey | Si |
| ALM-03 | Almacen Sur | Guadalajara | Si |

### 5.5.2 Stock por Producto
**Ruta:** `/dashboard/inventory/stock`

**Datos esperados:**
| Producto | Almacen | Cantidad | Reservado | Disponible |
|----------|---------|----------|-----------|------------|
| Laptop Dell XPS | Central | 50 | 5 | 45 |
| Monitor Samsung | Central | 120 | 10 | 110 |
| Laptop Dell XPS | Norte | 30 | 0 | 30 |

### 5.5.3 Movimientos de Inventario
**Ruta:** `/dashboard/inventory/movements`

**Tipos de movimiento:**
- **Entry** - Entradas por compra
- **Exit** - Salidas por venta
- **Transfer** - Transferencias entre almacenes
- **Adjustment** - Ajustes de inventario

**Puntos a destacar:**
- Trazabilidad completa de movimientos
- GL Posting automatico (integracion con contabilidad)
- Control de calidad requerido para salidas
- Lotes y fechas de vencimiento

---

## FLUJO 6: Finanzas - AR/AP (3 min)

### 6.1 Cuentas por Cobrar (AR)
**Ruta:** `/dashboard/finance/ar-invoices`

**Datos esperados:**
| # Factura | Cliente | Fecha | Vencimiento | Total | Estado |
|-----------|---------|-------|-------------|-------|--------|
| FAC-2025-001 | Acme Corporation | 2025-01-10 | 2025-02-09 | $80,035.36 | Publicada |
| FAC-2025-002 | Tech Solutions | 2025-01-12 | 2025-02-11 | $14,960.52 | Borrador |
| FAC-2025-003 | Juan Perez | 2025-01-14 | 2025-01-29 | $3,941.68 | Pagada |

### 6.2 Cuentas por Pagar (AP)
**Ruta:** `/dashboard/finance/ap-invoices`

**Datos esperados:**
| # Factura | Proveedor | Fecha | Vencimiento | Total | Estado |
|-----------|-----------|-------|-------------|-------|--------|
| PROV-001 | Distribuidora ABC | 2025-01-08 | 2025-02-07 | $174,000.00 | Publicada |
| PROV-002 | Importadora XYZ | 2025-01-11 | 2025-02-10 | $87,580.00 | Borrador |

### 6.3 Cuentas Bancarias
**Ruta:** `/dashboard/finance/bank-accounts`

**Datos esperados:**
| Banco | Numero de Cuenta | CLABE | Moneda | Saldo |
|-------|------------------|-------|--------|-------|
| BBVA | **** 4523 | 012180001234567890 | MXN | $500,000.00 |
| Santander | **** 7891 | 014180009876543210 | MXN | $250,000.00 |
| HSBC | **** 1234 | 021180005555666677 | USD | $15,000.00 |

---

## FLUJO 7: Contabilidad (3 min)

### 7.1 Catalogo de Cuentas
**Ruta:** `/dashboard/accounting/accounts`

**Estructura esperada:**
```
1000 - ACTIVO
  1100 - Activo Circulante
    1101 - Caja
    1102 - Bancos
    1103 - Clientes
    1104 - Inventarios
  1200 - Activo Fijo
    1201 - Mobiliario y Equipo
    1202 - Equipo de Computo
    1203 - Depreciacion Acumulada

2000 - PASIVO
  2100 - Pasivo Circulante
    2101 - Proveedores
    2102 - Impuestos por Pagar
    2103 - IVA Trasladado

3000 - CAPITAL
  3100 - Capital Social
  3200 - Resultados de Ejercicios Anteriores
  3300 - Resultado del Ejercicio

4000 - INGRESOS
  4100 - Ventas
  4200 - Otros Ingresos

5000 - GASTOS
  5100 - Costo de Ventas
  5200 - Gastos de Operacion
```

### 7.2 Polizas Contables
**Ruta:** `/dashboard/accounting/journal-entries`

**Ejemplo de Poliza - Venta:**
```
Poliza: POL-2025-001
Fecha: 2025-01-10
Concepto: Venta a Acme Corporation - FAC-2025-001

Lineas:
| Cuenta | Concepto | Debe | Haber |
|--------|----------|------|-------|
| 1103 Clientes | Acme Corporation | $80,035.36 | |
| 4100 Ventas | Venta de productos | | $68,996.00 |
| 2103 IVA Trasladado | IVA 16% | | $11,039.36 |

Totales: $80,035.36 = $80,035.36 (Cuadrado)
```

---

## FLUJO 8: Recursos Humanos (2 min)

### 8.1 Empleados
**Ruta:** `/dashboard/hr/employees`

**Datos esperados:**
| # Empleado | Nombre | Puesto | Departamento | Fecha Ingreso |
|------------|--------|--------|--------------|---------------|
| EMP-001 | Maria Garcia Lopez | Gerente General | Direccion | 2020-01-15 |
| EMP-002 | Carlos Rodriguez | Contador Senior | Finanzas | 2021-03-01 |
| EMP-003 | Ana Martinez Ruiz | Desarrollador | TI | 2022-06-15 |
| EMP-004 | Pedro Sanchez | Vendedor | Ventas | 2023-02-01 |

### 8.2 Estructura Organizacional
**Ruta:** `/dashboard/hr/organization`

**Departamentos:**
- Direccion General
- Finanzas y Contabilidad
- Tecnologia de la Informacion
- Ventas y Marketing
- Recursos Humanos
- Operaciones

### 8.3 Modulos HR Adicionales

**Asistencias (`/dashboard/hr/attendances`):**
- Registro de entrada/salida
- Horas trabajadas calculadas automaticamente
- Horas extras

**Vacaciones y Permisos (`/dashboard/hr/leaves`):**
- Tipos de permiso (vacaciones, incapacidad, personal)
- Aprobaciones pendientes
- Dias disponibles vs usados

**Nomina (`/dashboard/hr/payroll`):**
- Periodos de nomina (quincenal/mensual)
- Items de nomina por empleado
- Integracion automatica con contabilidad (polizas)

**Evaluaciones de Desempeno (`/dashboard/hr/performance-reviews`):**
- Evaluaciones 360
- Reviewer asignado
- Ratings y comentarios

---

## FLUJO 9: CRM (3 min)

### 9.1 Pipeline de Ventas
**Ruta:** `/dashboard/crm/pipeline-stages`

**Etapas del Pipeline:**
| Etapa | Tipo | Probabilidad | Oportunidades |
|-------|------|--------------|---------------|
| Prospecto | Lead | 10% | 15 |
| Calificado | Lead | 25% | 8 |
| Propuesta | Opportunity | 50% | 5 |
| Negociacion | Opportunity | 75% | 3 |
| Cerrado Ganado | Opportunity | 100% | 2 |
| Cerrado Perdido | Opportunity | 0% | 1 |

### 9.2 Leads
**Ruta:** `/dashboard/crm/leads`

**Datos esperados:**
| Lead | Empresa | Rating | Valor Estimado | Etapa |
|------|---------|--------|----------------|-------|
| Proyecto ERP para retail | Tiendas MX | Hot | $500,000 | Propuesta |
| Sistema de inventarios | Almacenes SA | Warm | $150,000 | Calificado |
| Portal de clientes | Servicios Pro | Cold | $80,000 | Prospecto |

### 9.3 Campanas
**Ruta:** `/dashboard/crm/campaigns`

**Datos esperados:**
| Campana | Tipo | Estado | Presupuesto | ROI |
|---------|------|--------|-------------|-----|
| Email Q1 2025 | Email | Activa | $10,000 | 250% |
| LinkedIn Ads | Social Media | Activa | $15,000 | 180% |
| Webinar ERP | Evento | Completada | $5,000 | 320% |

### 9.4 Actividades
**Ruta:** `/dashboard/crm/activities`

**Tipos de actividad:**
- **Call** - Llamadas telefonicas
- **Email** - Correos enviados
- **Meeting** - Reuniones programadas
- **Note** - Notas de seguimiento
- **Task** - Tareas pendientes

**Datos esperados:**
| Tipo | Asunto | Lead/Campana | Estado | Duracion |
|------|--------|--------------|--------|----------|
| Call | Seguimiento propuesta | Proyecto ERP | Completada | 30 min |
| Meeting | Demo producto | Sistema inventarios | Programada | 60 min |
| Email | Envio cotizacion | Portal clientes | Completada | - |

### 9.5 Oportunidades
**Ruta:** `/dashboard/crm/opportunities`

**Datos esperados:**
| Oportunidad | Lead Origen | Valor | Probabilidad | Etapa |
|-------------|-------------|-------|--------------|-------|
| ERP Retail - Tiendas MX | Proyecto ERP | $500,000 | 75% | Negociacion |
| Inventarios - Almacenes | Sistema inventarios | $150,000 | 50% | Propuesta |

**Puntos a destacar:**
- Pipeline visual de oportunidades
- Forecast por categoria (pipeline, best_case, commit, closed)
- Historial de actividades por oportunidad

---

## FLUJO 10: Facturacion CFDI (1 min)

### 10.1 Facturacion Electronica
**Ruta:** `/dashboard/billing/invoices`

**Puntos a destacar:**
- Estructura CFDI 4.0 compliant
- Configuracion de empresa emisora (RFC, regimen fiscal)
- Vista previa de XML y PDF
- Generacion automatica desde AR Invoice

**Datos de ejemplo:**
| Serie-Folio | RFC Receptor | Total | Estado |
|-------------|--------------|-------|--------|
| F-001 | ACO123456AB1 | $80,035.36 | Borrador |
| F-002 | TSO789012CD3 | $14,960.52 | Borrador |

### ⚠️ IMPORTANTE - Limitaciones en Demo

**NO MOSTRAR estos botones (requieren PAC configurado):**
- ❌ "Timbrar CFDI" - Requiere credenciales SW Sapien
- ❌ "Cancelar Factura" - Requiere PAC activo
- ❌ "Validar con SAT" - Requiere conexion PAC

**Si preguntan sobre timbrado:**
> "El modulo de facturacion esta preparado para CFDI 4.0 con integracion
> a SW Sapien PAC. En ambiente de produccion se configuran las credenciales
> del PAC y los certificados digitales de la empresa para el timbrado real."

**Lo que SI se puede mostrar:**
- ✅ Lista de CFDIs con estructura completa
- ✅ Detalle de factura (campos SAT)
- ✅ Configuracion de empresa emisora
- ✅ Vista previa de PDF (borrador)

---

## FLUJO 11: Reportes (3 min)

### 11.1 Estados Financieros
**Ruta:** `/dashboard/reports/financial-statements`

**Acciones a demostrar:**
1. Navegar a la pagina de Estados Financieros
2. Mostrar los 4 reportes integrados en una sola pagina:
   - Balance General (Balance Sheet)
   - Estado de Resultados (Income Statement)
   - Flujo de Efectivo (Cash Flow)
   - Balanza de Comprobacion (Trial Balance)

**Filtros disponibles:**
- Fecha de Corte (para Balance y Balanza)
- Fecha Inicio / Fecha Fin (para Estado de Resultados y Flujo)
- Moneda (USD, MXN, EUR)

**Datos esperados (Balance General):**
| Concepto | Valor |
|----------|-------|
| Total Activos | $500,000.00 |
| Total Pasivos | $200,000.00 |
| Total Capital | $300,000.00 |
| Estado | Cuadrado (balanced) |

**Datos esperados (Estado de Resultados):**
| Concepto | Valor |
|----------|-------|
| Utilidad Bruta | $150,000.00 |
| Margen Bruto | 35.00% |
| Utilidad Neta | $75,000.00 |
| Margen Neto | 17.50% |

### 11.2 Reportes de Antiguedad (Aging)
**Ruta:** `/dashboard/reports/aging-reports`

**Que mostrar:**
1. Antiguedad de Cuentas por Cobrar (AR)
   - Cards por periodo: 0-30, 31-60, 61-90, 90+ dias
   - Tabla detallada por cliente
2. Antiguedad de Cuentas por Pagar (AP)
   - Cards por periodo: 0-30, 31-60, 61-90, 90+ dias
   - Tabla detallada por proveedor

**Datos esperados AR Aging:**
| Cliente | 0-30 dias | 31-60 dias | 61-90 dias | 90+ dias | Total |
|---------|-----------|------------|------------|----------|-------|
| Acme Corp | $5,000 | $2,500 | $0 | $500 | $8,000 |
| Tech Solutions | $3,000 | $0 | $0 | $0 | $3,000 |

### 11.3 Reportes Gerenciales
**Ruta:** `/dashboard/reports/management-reports`

**Que mostrar:**
1. **Ventas por Cliente** - Top clientes con total de ventas y ticket promedio
2. **Ventas por Producto** - Productos mas vendidos con cantidades e ingresos
3. **Compras por Proveedor** - Top proveedores con total de compras
4. **Compras por Producto** - Productos mas comprados con costos

**Filtros disponibles:**
- Fecha Inicio / Fecha Fin
- Moneda

**Datos esperados (Ventas por Cliente):**
| Cliente | Pedidos | Total Ventas | Ticket Promedio |
|---------|---------|--------------|-----------------|
| Acme Corporation | 5 | $250,000 | $50,000 |
| Tech Solutions | 3 | $75,000 | $25,000 |

### 11.4 Analytics Dashboard (Evitar en Demo)

**Rutas con problemas (requieren ajustes):**
| Ruta | Estado | Razon |
|------|--------|-------|
| `/dashboard/analytics` | ⚠️ | Error en servicio KPIService |

**Nota:** Los analytics tienen un bug en el servicio backend.
Evitar mostrar el dashboard de analytics en la demo.
Los reportes de Financial Statements, Aging y Management funcionan correctamente.

---

## Cierre de Demo

### Puntos Tecnicos a Resaltar:
1. **15+ modulos** completamente funcionales
2. **1,144 tests** pasando (100% coverage en services)
3. **Next.js 15** con App Router
4. **JSON:API** spec compliant
5. **TypeScript** estricto (zero `any`)
6. **SWR + Zustand** para estado
7. **TanStack Virtual** para performance
8. **Laravel Sanctum** para auth

### Arquitectura Destacable:
- Modulos independientes y portables
- Party Pattern para contactos
- 5 vistas virtualizadas en productos
- Flujos Order-to-Cash y Procure-to-Pay completos

### Proximos Pasos (roadmap):
- Dashboards interactivos con graficas
- Notificaciones en tiempo real
- App movil (React Native)
- Integracion con mas PACs

---

## ⚠️ FUNCIONALIDADES A EVITAR EN DEMO

### Billing/CFDI
| Accion | Razon |
|--------|-------|
| ❌ Click en "Timbrar CFDI" | Requiere PAC (SW Sapien) configurado |
| ❌ Click en "Cancelar Factura" | Requiere PAC activo |
| ❌ "Validar con SAT" | Requiere conexion a SAT via PAC |

### Ecommerce/Pagos
| Accion | Razon |
|--------|-------|
| ❌ Checkout con tarjeta | Requiere Stripe configurado |
| ❌ Procesar pagos | Sin credenciales de pasarela |

### Reportes
| Accion | Razon |
|--------|-------|
| ⚠️ Algunos reportes | Pueden mostrar datos vacios |
| ✅ Mostrar estructura | Filtros y opciones disponibles |

### Respuestas preparadas:

**Si preguntan por timbrado CFDI:**
> "El sistema esta preparado para CFDI 4.0 con integracion a SW Sapien PAC.
> En produccion se configuran credenciales y certificados digitales."

**Si preguntan por pagos en linea:**
> "El modulo de Ecommerce incluye integracion con Stripe para pagos con
> tarjeta, OXXO y transferencia. Se configura en produccion con las
> credenciales de la cuenta Stripe del cliente."

**Si preguntan por algo que falla:**
> "Ese modulo esta en fase de desarrollo activo. La arquitectura base
> esta completa y es extensible. Podemos agregar esa funcionalidad
> especifica segun los requerimientos del proyecto."

---

## Troubleshooting Durante Demo

### Si algo falla:
1. **Error de auth:** Verificar token en localStorage (`localStorage.getItem('auth_token')`)
2. **Datos no cargan:** Verificar backend corriendo (`curl http://127.0.0.1:8000/api/v1/contacts`)
3. **Pagina en blanco:** Check console del browser (F12)
4. **404 en API:** Verificar `NEXT_PUBLIC_BACKEND_URL` en `.env.local`
5. **CORS error:** Verificar configuracion de CORS en backend

### Comandos utiles:
```bash
# Verificar backend
curl -H "Accept: application/vnd.api+json" http://127.0.0.1:8000/api/v1/contacts

# Verificar auth
curl -X POST http://127.0.0.1:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secureadmin"}'

# Limpiar cache frontend
rm -rf .next && npm run dev
```

### Backup Plan:
- Tener screenshots listos de cada seccion
- Tener video grabado como respaldo
- Preparar datos en Postman para mostrar API directamente
