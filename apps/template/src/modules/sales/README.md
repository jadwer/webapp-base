# Sales Module

Complete sales order management system with real-time reporting and customer analytics.

## Features

### Core Functionality
- **Sales Order Management**: Complete CRUD operations for sales orders
- **Order Items Management**: Add, update, and delete items within orders
- **Customer Integration**: Seamless integration with Contacts module
- **Product Integration**: Direct access to Products module for order items
- **Real-time Reporting**: Sales reports and analytics by period
- **Customer Analytics**: Top customers and purchasing behavior analysis

### Technical Features
- **JSON:API Compliance**: Full JSON:API v1.1 specification support
- **SWR Data Fetching**: Intelligent caching and revalidation
- **TypeScript**: Fully typed interfaces and strict type checking
- **Testing**: 70%+ test coverage with Vitest
- **3-Step Order Creation**: Create order → Add items → Update totals workflow

## Entities

### SalesOrder
Main entity for sales orders:
- `id`: Unique identifier
- `contactId`: Reference to customer contact
- `orderNumber`: Human-readable order number
- `orderDate`: Date of order creation
- `status`: Order status (pending, approved, completed, cancelled)
- `financialStatus`: Invoice status (not_invoiced, invoiced, paid)
- `invoicingStatus`: Detailed invoice status
- `arInvoiceId`: Reference to AR invoice (if invoiced)
- `totalAmount`: Total order value
- `subtotalAmount`: Subtotal before taxes
- `taxAmount`: Tax amount
- `discountTotal`: Total discount applied
- `notes`: Additional notes

### SalesOrderItem
Line items within sales orders:
- `id`: Unique identifier
- `salesOrderId`: Reference to parent sales order
- `productId`: Reference to product
- `quantity`: Quantity ordered
- `unitPrice`: Price per unit
- `discount`: Discount amount or percentage
- `totalPrice`: Total price for this line item

## API Endpoints

### Sales Orders
```
GET    /api/v1/sales-orders              - List all orders
GET    /api/v1/sales-orders/:id          - Get single order
POST   /api/v1/sales-orders              - Create new order
PATCH  /api/v1/sales-orders/:id          - Update order
DELETE /api/v1/sales-orders/:id          - Delete order
GET    /api/v1/sales-orders/reports      - Get sales reports
GET    /api/v1/sales-orders/customers    - Get customer analytics
```

### Sales Order Items
```
GET    /api/v1/sales-order-items         - List all items
POST   /api/v1/sales-order-items         - Create new item
PATCH  /api/v1/sales-order-items/:id     - Update item
DELETE /api/v1/sales-order-items/:id     - Delete item
```

## Usage

### Data Fetching Hooks

```typescript
import {
  useSalesOrders,
  useSalesOrder,
  useSalesOrderItems,
  useSalesReports,
  useSalesCustomers
} from '@/modules/sales'

// Fetch all sales orders with optional filters
const { salesOrders, isLoading, error, mutate } = useSalesOrders({
  search: 'SO-2025',
  status: 'pending',
  contactId: 123
})

// Fetch single order by ID
const { salesOrder, isLoading, error } = useSalesOrder('1')

// Fetch order items
const { salesOrderItems, isLoading, mutate } = useSalesOrderItems('1')

// Fetch sales reports
const { reports, isLoading } = useSalesReports(30) // 30 days

// Fetch top customers
const { customers, isLoading } = useSalesCustomers(90) // 90 days
```

### Mutation Hooks

```typescript
import {
  useSalesOrderMutations,
  useSalesOrderItemMutations
} from '@/modules/sales'

// Sales order mutations
const {
  createSalesOrder,
  updateSalesOrder,
  updateSalesOrderTotals,
  deleteSalesOrder
} = useSalesOrderMutations()

// Create order
const newOrder = await createSalesOrder({
  contactId: 123,
  orderNumber: 'SO-2025-001',
  orderDate: '2025-01-15',
  status: 'pending',
  notes: 'Priority order'
})

// Update totals after adding items
await updateSalesOrderTotals(orderId, {
  totalAmount: 1500.00,
  subtotalAmount: 1400.00,
  taxAmount: 100.00
})

// Sales order item mutations
const {
  createSalesOrderItem,
  updateSalesOrderItem,
  deleteSalesOrderItem
} = useSalesOrderItemMutations()

// Add item to order
await createSalesOrderItem({
  salesOrderId: parseInt(orderId),
  productId: 5,
  quantity: 10,
  unitPrice: 150.00,
  discount: 0,
  total: 1500.00
})
```

### Auxiliary Hooks

```typescript
import { useSalesContacts, useSalesProducts } from '@/modules/sales'

// Fetch customers for order creation
const { contacts, isLoading } = useSalesContacts({
  'filter[isCustomer]': '1',
  'filter[status]': 'active'
})

// Fetch products for order items
const { products, isLoading } = useSalesProducts({
  'filter[search]': 'laptop'
})
```

## Components

### AddItemModal
Modal component for adding items to a sales order:
```typescript
import { AddItemModal } from '@/modules/sales'

<AddItemModal
  salesOrderId={orderId}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => mutateItems()}
/>
```

### ItemsManager
Complete items management interface with search, add, edit, delete:
```typescript
import { ItemsManager } from '@/modules/sales'

<ItemsManager
  items={orderItems}
  onItemsChange={setOrderItems}
  onTotalChange={setTotalAmount}
/>
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
const orderResponse = await createSalesOrder(orderData)
const orderId = orderResponse.data?.id || orderResponse.id

// Step 2: Add all items
for (const item of orderItems) {
  await createSalesOrderItem({
    salesOrderId: parseInt(orderId),
    productId: parseInt(item.productId),
    quantity: parseInt(item.quantity),
    unitPrice: parseFloat(item.unitPrice),
    discount: parseFloat(item.discount),
    total: parseFloat(item.total)
  })
}

// Step 3: Update order totals
await updateSalesOrderTotals(orderId, {
  totalAmount: calculatedTotal,
  subtotalAmount: calculatedSubtotal,
  taxAmount: calculatedTax
})
```

## Status Values

### Order Status
- `pending`: Order created, awaiting approval
- `approved`: Order approved, ready for processing
- `completed`: Order fulfilled and delivered
- `cancelled`: Order cancelled

### Financial Status
- `not_invoiced`: No invoice created
- `invoiced`: Invoice created
- `paid`: Invoice paid in full

### Invoicing Status
- `not_invoiced`: No invoice
- `partially_invoiced`: Some items invoiced
- `fully_invoiced`: All items invoiced

## Testing

The module includes comprehensive tests:

### Test Coverage
- **Hooks**: 88.21% statements, 91.66% functions
- **Services**: 93.35% statements, 100% functions
- **Utils**: 87.03% statements
- **Total Tests**: 72 tests passing

### Running Tests
```bash
# Run all sales module tests
npm run test:run -- src/modules/sales

# Run with coverage
npm run test:coverage -- src/modules/sales

# Watch mode
npm run test -- src/modules/sales
```

### Test Files
- `salesService.test.ts`: Service layer tests (18 tests)
- `salesReportsService.test.ts`: Reports service tests (8 tests)
- `salesContactsService.test.ts`: Contacts service tests (5 tests)
- `salesProductsService.test.ts`: Products service tests (6 tests)
- `useSalesOrders.test.ts`: Data fetching hooks tests (17 tests)
- `useSalesReportsHooks.test.ts`: Reports hooks tests (9 tests)
- `useSalesAuxiliaryHooks.test.ts`: Auxiliary hooks tests (9 tests)

## Services

### salesService
Main service for sales orders and items:
```typescript
import { salesService } from '@/modules/sales/services'

// Orders
await salesService.orders.getAll(params)
await salesService.orders.getById(id)
await salesService.orders.create(data)
await salesService.orders.update(id, data)
await salesService.orders.updateTotals(id, totals)
await salesService.orders.delete(id)

// Items
await salesService.items.getAll(params)
await salesService.items.create(data)
await salesService.items.update(id, data)
await salesService.items.delete(id)
```

### salesReportsService
Service for reports and analytics:
```typescript
import { salesReportsService } from '@/modules/sales/services'

// Get sales reports summary
const reports = await salesReportsService.getReports(period)
// Returns: { totalOrders, totalRevenue, salesByStatus, topCustomers, salesTrend }

// Get top customers analytics
const customers = await salesReportsService.getCustomers(period)
// Returns: { customers: [...], meta: {...} }
```

## Known Limitations

1. **Testing Coverage**:
   - Component tests: 0% (AddItemModal, ItemsManager need tests)
   - Recommended: Add React Testing Library tests for UI components

2. **Backend Integration**:
   - Pagination not fully implemented on backend (avoid `page[number]` parameters)
   - Some report endpoints may return empty data in development

3. **Performance**:
   - No virtualization for large order lists (consider for 1000+ orders)
   - No debounce on search (recommended for production)

4. **Advanced Features** (Not Implemented):
   - Order approval workflows
   - Multi-currency support
   - Advanced tax calculations
   - Shipment tracking integration
   - Email notifications

## Future Enhancements

### High Priority
- [ ] Add component tests (React Testing Library)
- [ ] Implement order approval workflow
- [ ] Add email notifications for status changes
- [ ] Implement advanced tax calculation system

### Medium Priority
- [ ] Add order templates for recurring orders
- [ ] Implement order cloning functionality
- [ ] Add bulk order operations
- [ ] Customer credit limit checks

### Low Priority
- [ ] Multi-currency support
- [ ] Order versioning and history
- [ ] Advanced reporting with charts
- [ ] Export to PDF/Excel functionality

## Backend Requirements

### Database Tables
- `sales_orders`: Main orders table
- `sales_order_items`: Order line items
- `contacts`: Customer information
- `products`: Product catalog
- `ar_invoices`: Accounts receivable invoices

### Event Listeners
- `SalesOrderCompleted`: Creates AR Invoice automatically when order is marked as completed

### Permissions Required
- `view-sales-orders`: View sales orders
- `create-sales-orders`: Create new orders
- `edit-sales-orders`: Edit existing orders
- `delete-sales-orders`: Delete orders
- `view-sales-reports`: Access reports and analytics

## Related Modules

- **Contacts**: Customer management
- **Products**: Product catalog
- **Finance**: Accounts receivable (AR Invoices)
- **Inventory**: Stock management (optional integration)

## Support

For issues or questions:
1. Check backend API documentation: `/docs/BACKEND_ANALYSIS_SUMMARY.md`
2. Review MASTER_ROADMAP for module status
3. Contact development team

---

**Module Status**: ✅ Production Ready (70%+ test coverage)
**Last Updated**: January 2025
**Version**: 1.0.0
