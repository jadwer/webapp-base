# Finance API Debugging - Endpoints Reales del Backend

## 🚨 PROBLEMA ACTUAL

Error: `GET http://127.0.0.1:8000/api/v1/a-p-payments?include=contact 400 (Bad Request)`

## 📋 URLs CONFIRMADAS QUE FUNCIONAN (del reporte)

✅ **Bank Accounts**: `/api/v1/bank-accounts` - 31 registros
✅ **Journal Entries**: `/api/v1/journal-entries` - 27 registros  
✅ **AP Invoices**: `/api/v1/a-p-invoices` - Funciona CREATE/READ
✅ **AR Invoices**: `/api/v1/a-r-invoices` - Funciona CREATE/READ

## ❌ URLs QUE DAN 400 BAD REQUEST

❌ **AP Payments**: `/api/v1/a-p-payments` - 400 Bad Request
❌ **AR Receipts**: `/api/v1/a-r-receipts` - ¿400 Bad Request?

## 🔍 INVESTIGACIÓN REQUERIDA

Según la documentación leída, las URLs reales podrían ser:

```
Documentación Backend:
- APPayment: Resource Type "appayments" → ¿/api/v1/appayments?
- ARReceipt: Resource Type "arreceipts" → ¿/api/v1/arreceipts?
```

## 📊 ESTRUCTURA DE DATOS AP PAYMENTS

Según documentación backend:
```
APPayment Fields:
- id: id
- contactId: number  
- paymentDate: datetime
- paymentMethod: string
- currency: string
- amount: number
- bankAccountId: number
- status: string
```

## 🔧 CORRECCIONES IMPLEMENTADAS (que pueden estar incorrectas)

1. **URLs cambiadas a**: `/api/v1/a-p-payments` 
2. **Transformers corregidos**: contactId en lugar de aPInvoiceId
3. **Includes agregados**: ?include=contact

## ⚡ ACCIÓN INMEDIATA REQUERIDA

1. **Probar URLs reales**:
   - [ ] GET /api/v1/appayments
   - [ ] GET /api/v1/arreceipts
   - [ ] GET /api/v1/a-p-payments (está fallando)
   - [ ] GET /api/v1/a-r-receipts

2. **Verificar includes**:
   - [ ] ?include=contact funciona en AP Payments?
   - [ ] ¿Qué relationships están disponibles?

3. **Probar con curl**:
```bash
curl -H "Authorization: Bearer TOKEN" \
     -H "Accept: application/vnd.api+json" \
     "http://127.0.0.1:8000/api/v1/appayments"
```

## 🎯 PRÓXIMOS PASOS

1. **Identificar URLs reales** que funcionan
2. **Corregir servicios** con URLs correctas  
3. **Actualizar transformers** según structure real del API
4. **Probar includes** disponibles para cada endpoint

## 🗂️ ESTADO ACTUAL FRONTEND

**Servicios implementados con URLs posiblemente incorrectas:**
- apPaymentsService → `/api/v1/a-p-payments` (400 error)
- arReceiptsService → `/api/v1/a-r-receipts` (no probado)

**Transformers implementados:**
- transformAPPaymentFromAPI → Esperando contactId field
- transformARReceiptFromAPI → Esperando contactId field

**UI implementada:**
- AP Payments page con includes contact (falla por 400 error)