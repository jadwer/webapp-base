# Purchase Module

Complete purchase order management system with real-time reporting and supplier analytics.

## Features

### Core Functionality
- **Purchase Order Management**: Complete CRUD operations for purchase orders
- **Order Items Management**: Add, update, and delete items within orders
- **Supplier Integration**: Seamless integration with Contacts module
- **Product Integration**: Direct access to Products module for order items
- **Date-Based Reporting**: Purchase reports and analytics by date range
- **Supplier Analytics**: Top suppliers and purchasing behavior analysis

### Technical Features
- **JSON:API Compliance**: Full JSON:API v1.1 specification support
- **SWR Data Fetching**: Intelligent caching and revalidation
- **TypeScript**: Fully typed interfaces and strict type checking
- **Testing**: 81.92% hooks coverage, 93.98% services coverage
- **3-Step Order Creation**: Create order → Add items → Update totals workflow

## Entities

### PurchaseOrder
Main entity for purchase orders:
- `id`: Unique identifier
- `contactId`: Reference to supplier contact
- `orderNumber`: Human-readable order number
- `orderDate`: Date of order creation
- `status`: Order status (pending, approved, received, completed, cancelled)
- `financialStatus`: Invoice status (not_invoiced, invoiced, paid)
- `apInvoiceId`: Reference to AP invoice (if invoiced)
- `totalAmount`: Total order value
- `subtotalAmount`: Subtotal before taxes
- `taxAmount`: Tax amount
- `discountTotal`: Total discount applied
- `notes`: Additional notes

### PurchaseOrderItem
Line items within purchase orders:
- `id`: Unique identifier
- `purchaseOrderId`: Reference to parent purchase order
- `productId`: Reference to product
- `quantity`: Quantity ordered
- `unitPrice`: Price per unit
- `discount`: Discount amount or percentage
- `totalPrice`: Total price for this line item

## API Endpoints

### Purchase Orders
```
GET    /api/v1/purchase-orders              - List all orders
GET    /api/v1/purchase-orders/:id          - Get single order
POST   /api/v1/purchase-orders              - Create new order
PATCH  /api/v1/purchase-orders/:id          - Update order
DELETE /api/v1/purchase-orders/:id          - Delete order
GET    /api/v1/purchase-orders/reports      - Get purchase reports
GET    /api/v1/purchase-orders/suppliers    - Get supplier analytics
```

### Purchase Order Items
```
GET    /api/v1/purchase-order-items         - List all items
POST   /api/v1/purchase-order-items         - Create new item
PATCH  /api/v1/purchase-order-items/:id     - Update item
DELETE /api/v1/purchase-order-items/:id     - Delete item
```

## Usage

### Data Fetching Hooks

```typescript
import {
  usePurchaseOrders,
  usePurchaseOrder,
  usePurchaseOrderItems,
  usePurchaseReports,
  usePurchaseSuppliers
} from '@/modules/purchase'

// Fetch all purchase orders with optional filters
const { purchaseOrders, isLoading, error, mutate } = usePurchaseOrders({
  search: 'PO-2025',
  status: 'pending',
  contactId: 123
})

// Fetch single order by ID
const { purchaseOrder, isLoading, error } = usePurchaseOrder('1')

// Fetch order items
const { purchaseOrderItems, isLoading, mutate } = usePurchaseOrderItems('1')

// Fetch purchase reports with date range
const { reports, isLoading } = usePurchaseReports('2025-01-01', '2025-01-31')

// Fetch top suppliers with date range
const { suppliers, isLoading } = usePurchaseSuppliers('2025-01-01', '2025-12-31')
```

### Mutation Hooks

```typescript
import {
  usePurchaseOrderMutations,
  usePurchaseOrderItemMutations
} from '@/modules/purchase'

// Purchase order mutations
const {
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderTotals,
  deletePurchaseOrder
} = usePurchaseOrderMutations()

// Create order
const newOrder = await createPurchaseOrder({
  contactId: 123,
  orderNumber: 'PO-2025-001',
  orderDate: '2025-01-15',
  status: 'pending',
  notes: 'Urgent order'
})

// Update totals after adding items
await updatePurchaseOrderTotals(orderId, {
  totalAmount: 1500.00
})

// Purchase order item mutations
const {
  createPurchaseOrderItem,
  updatePurchaseOrderItem,
  deletePurchaseOrderItem
} = usePurchaseOrderItemMutations()

// Add item to order
await createPurchaseOrderItem({
  purchaseOrderId: parseInt(orderId),
  productId: 5,
  quantity: 10,
  unitPrice: 150.00,
  discount: 0,
  total: 1500.00
})
```

### Auxiliary Hooks

```typescript
import { usePurchaseContacts, usePurchaseProducts } from '@/modules/purchase'

// Fetch suppliers for order creation
const { contacts, isLoading } = usePurchaseContacts({
  'filter[isSupplier]': '1',
  'filter[status]': 'active'
})

// Fetch products for order items
const { products, isLoading } = usePurchaseProducts({
  'filter[search]': 'laptop',
  'include': 'unit,category,brand'
})
```

## 3-Step Order Creation Workflow

The module implements a specific workflow for order creation:

```typescript
// Step 1: Create order with zero totals
const orderData = {
  contactId: parseInt(formData.contactId),
  orderNumber: formData.orderNumber,
  orderDate: formData.orderDate,
  status: 'pending',
  totalAmount: 0,
  subtotalAmount: 0,
  taxAmount: 0
}
const orderResponse = await createPurchaseOrder(orderData)
const orderId = orderResponse.data?.id || orderResponse.id

// Step 2: Add all items
for (const item of orderItems) {
  await createPurchaseOrderItem({
    purchaseOrderId: parseInt(orderId),
    productId: parseInt(item.productId),
    quantity: parseInt(item.quantity),
    unitPrice: parseFloat(item.unitPrice),
    discount: parseFloat(item.discount),
    total: parseFloat(item.total)
  })
}

// Step 3: Update order totals
await updatePurchaseOrderTotals(orderId, {
  totalAmount: calculatedTotal
})
```

## Status Values

### Order Status
- `pending`: Order created, awaiting approval
- `approved`: Order approved, sent to supplier
- `received`: Order received from supplier
- `completed`: Order completed and processed
- `cancelled`: Order cancelled

### Financial Status
- `not_invoiced`: No invoice created
- `invoiced`: Invoice created
- `paid`: Invoice paid in full

## Reports API Differences

**Important**: Purchase reports use date ranges instead of period in days:

```typescript
// ✅ Correct - Purchase uses startDate/endDate
const reports = await purchaseReportsService.getReports('2025-01-01', '2025-01-31')
const suppliers = await purchaseReportsService.getSuppliers('2025-01-01', '2025-12-31')

// ❌ Wrong - This is Sales API pattern
const reports = await salesReportsService.getReports(30) // period in days
```

**API Response Structure:**
```typescript
// Reports endpoint
{
  data: {
    summary: {
      total_orders: number,
      total_amount: number,
      average_order_value: number,
      pending_orders: number,
      completed_orders: number
    },
    by_status: Array<{status, count, total_amount}>,
    by_supplier: Array<{supplier_id, supplier_name, total_orders, total_amount}>,
    monthly_trend: Array<{month, total_orders, total_amount}>
  },
  period: { start_date, end_date }
}

// Suppliers endpoint (JSON:API format)
{
  data: Array<{
    id, type: 'suppliers',
    attributes: {
      supplier_name,
      supplier_email,
      supplier_phone,
      supplier_classification,
      total_orders,
      total_purchased,
      average_order_value,
      last_order_date,
      orders: []
    }
  }>,
  meta: { total_suppliers, period }
}
```

## Testing

The module includes comprehensive tests:

### Test Coverage
- **Hooks**: 81.92% statements, 90% functions ✅
- **Services**: 93.98% statements, 100% functions ✅
- **Utils**: 81.63% (transformers), 90.69% (test-utils) ✅
- **Total Tests**: 69 tests passing

### Running Tests
```bash
# Run all purchase module tests
npm run test:run -- src/modules/purchase

# Run with coverage
npm run test:coverage -- src/modules/purchase

# Watch mode
npm run test -- src/modules/purchase
```

### Test Files
- `purchaseService.test.ts`: Service layer tests (20 tests)
- `purchaseReportsService.test.ts`: Reports service tests (8 tests)
- `purchaseContactsService.test.ts`: Contacts service tests (5 tests)
- `purchaseProductsService.test.ts`: Products service tests (6 tests)
- `usePurchaseOrders.test.ts`: Data fetching hooks tests (17 tests)
- `usePurchaseAuxiliaryHooks.test.ts`: Auxiliary hooks tests (13 tests)

## Services

### purchaseService
Main service for purchase orders and items:
```typescript
import { purchaseService } from '@/modules/purchase/services'

// Orders
await purchaseService.orders.getAll(params)
await purchaseService.orders.getById(id)
await purchaseService.orders.create(data)
await purchaseService.orders.update(id, data)
await purchaseService.orders.updateTotals(id, totals)
await purchaseService.orders.delete(id)

// Items
await purchaseService.items.getAll(params)
await purchaseService.items.create(data)
await purchaseService.items.update(id, data)
await purchaseService.items.delete(id)
```

### purchaseReportsService
Service for reports and analytics (date-based):
```typescript
import { purchaseReportsService } from '@/modules/purchase/services'

// Get purchase reports summary by date range
const reports = await purchaseReportsService.getReports('2025-01-01', '2025-01-31')
// Returns: { totalOrders, totalAmount, byStatus, bySupplier, monthlyTrend, period }

// Get top suppliers analytics by date range
const suppliers = await purchaseReportsService.getSuppliers('2025-01-01', '2025-12-31')
// Returns: { suppliers: [...], meta: {...} }
```

## JSON:API Integration Notes

### Include Path Difference
Purchase module uses `purchaseOrderItems` as the include path (not just `items`):

```typescript
// ✅ Correct for Purchase
const response = await axiosClient.get(
  `/api/v1/purchase-orders/${id}?include=purchaseOrderItems,contact`
)

// ❌ Wrong - This is Sales pattern
const response = await axiosClient.get(
  `/api/v1/sales-orders/${id}?include=items,contact`
)
```

### Field Mapping
The module uses proper camelCase ↔ snake_case transformations:
- `contactId` ↔ `contact_id`
- `orderNumber` ↔ `order_number`
- `orderDate` ↔ `order_date`
- `totalAmount` ↔ `total_amount`
- `apInvoiceId` ↔ `ap_invoice_id`
- `financialStatus` ↔ `financial_status`

## Known Limitations

1. **Testing Coverage**:
   - Component tests: 0% (UI components need tests)
   - Recommended: Add React Testing Library tests for UI components

2. **Backend Integration**:
   - Pagination not fully implemented on backend (avoid `page[number]` parameters)
   - Some report endpoints may return empty data in development

3. **Performance**:
   - No virtualization for large order lists (consider for 1000+ orders)
   - No debounce on search (recommended for production)

4. **Advanced Features** (Not Implemented):
   - Multi-step approval workflows
   - Vendor rating system
   - Purchase requisitions
   - Automated reordering
   - Email notifications to suppliers

## Future Enhancements

### High Priority
- [ ] Add component tests (React Testing Library)
- [ ] Implement multi-level approval workflow
- [ ] Add email notifications for order status changes
- [ ] Implement purchase requisitions system

### Medium Priority
- [ ] Add order templates for recurring purchases
- [ ] Implement bulk order operations
- [ ] Vendor performance tracking and rating
- [ ] Purchase order versioning

### Low Priority
- [ ] Multi-currency support
- [ ] Automated reordering based on inventory levels
- [ ] Advanced reporting with charts
- [ ] Export to PDF/Excel functionality

## Backend Requirements

### Database Tables
- `purchase_orders`: Main orders table
- `purchase_order_items`: Order line items
- `contacts`: Supplier information
- `products`: Product catalog
- `ap_invoices`: Accounts payable invoices

### Event Listeners
- `PurchaseOrderReceived`: Creates AP Invoice automatically when order is marked as received

### Permissions Required
- `view-purchase-orders`: View purchase orders
- `create-purchase-orders`: Create new orders
- `edit-purchase-orders`: Edit existing orders
- `delete-purchase-orders`: Delete orders
- `view-purchase-reports`: Access reports and analytics

## Related Modules

- **Contacts**: Supplier management
- **Products**: Product catalog
- **Finance**: Accounts payable (AP Invoices)
- **Inventory**: Stock management (automatic stock updates on receipt)

## Support

For issues or questions:
1. Check backend API documentation: `/docs/BACKEND_ANALYSIS_SUMMARY.md`
2. Review MASTER_ROADMAP for module status
3. Contact development team

---

**Module Status**: ✅ Production Ready (81.92% hooks, 93.98% services coverage)
**Last Updated**: January 2025
**Version**: 1.0.0
