# Ecommerce Module

Complete e-commerce solution with order management and shopping cart functionality.

## Features

### Core Functionality
- **Order Management**: Complete CRUD operations for e-commerce orders
- **Order Items Management**: Add, update, and delete items within orders
- **Shopping Cart**: Session-based cart with persistence support
- **Customer Integration**: Seamless integration with Contacts module
- **Product Integration**: Direct access to Products module for order items
- **Payment Processing**: Payment status tracking and management
- **Shipping Management**: Shipping status tracking with address management
- **Order Tracking**: Customer order history and status updates

### Technical Features
- **JSON:API Compliance**: Full JSON:API v1.1 specification support
- **SWR Data Fetching**: Intelligent caching and revalidation
- **TypeScript**: Fully typed interfaces and strict type checking
- **Testing**: Comprehensive test coverage with Vitest
- **Session Support**: Guest checkout with session-based carts
- **Customer Support**: Authenticated user cart management

## Entities

### EcommerceOrder
Main entity for e-commerce orders:
- `id`: Unique identifier
- `orderNumber`: Human-readable order number
- `customerId`: Reference to customer contact (optional for guest orders)
- `customerEmail`: Customer email address
- `customerName`: Customer full name
- `customerPhone`: Customer phone number

**Order Status:**
- `status`: Order status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- `paymentStatus`: Payment status (pending, processing, completed, failed, refunded)
- `shippingStatus`: Shipping status (pending, processing, shipped, in_transit, delivered, returned)

**Amounts:**
- `subtotalAmount`: Subtotal before taxes and shipping
- `taxAmount`: Tax amount
- `shippingAmount`: Shipping cost
- `discountAmount`: Discount applied
- `totalAmount`: Total order value

**Shipping Information:**
- `shippingAddressLine1`: Primary shipping address
- `shippingAddressLine2`: Secondary shipping address
- `shippingCity`: Shipping city
- `shippingState`: Shipping state/province
- `shippingPostalCode`: Shipping postal code
- `shippingCountry`: Shipping country

**Billing Information (optional):**
- `billingAddressLine1`: Primary billing address
- `billingAddressLine2`: Secondary billing address
- `billingCity`: Billing city
- `billingState`: Billing state/province
- `billingPostalCode`: Billing postal code
- `billingCountry`: Billing country

**Payment Information:**
- `paymentMethodId`: Reference to payment method
- `paymentReference`: Payment transaction reference

**Metadata:**
- `notes`: Additional order notes
- `orderDate`: Date of order creation
- `completedDate`: Date when order was completed

### EcommerceOrderItem
Line items within e-commerce orders:
- `id`: Unique identifier
- `ecommerceOrderId`: Reference to parent order
- `productId`: Reference to product
- `productName`: Product name (snapshot)
- `productSku`: Product SKU (snapshot)
- `productImage`: Product image URL (snapshot)
- `quantity`: Quantity ordered
- `unitPrice`: Price per unit
- `discount`: Discount amount or percentage
- `taxAmount`: Tax amount for this item
- `totalPrice`: Total price for this line item

### ShoppingCart
Shopping cart entity:
- `id`: Unique identifier
- `sessionId`: Session identifier for guest carts
- `customerId`: Customer ID for authenticated users
- `subtotalAmount`: Cart subtotal
- `taxAmount`: Cart tax amount
- `totalAmount`: Cart total
- `expiresAt`: Cart expiration date

### ShoppingCartItem
Items in shopping cart:
- `id`: Unique identifier
- `shoppingCartId`: Reference to cart
- `productId`: Reference to product
- `productName`: Product name
- `productSku`: Product SKU
- `productImage`: Product image URL
- `quantity`: Quantity in cart
- `unitPrice`: Unit price
- `totalPrice`: Total price

## API Endpoints

### Ecommerce Orders
```
GET    /api/v1/ecommerce-orders              - List all orders
GET    /api/v1/ecommerce-orders/:id          - Get single order
POST   /api/v1/ecommerce-orders              - Create new order
PATCH  /api/v1/ecommerce-orders/:id          - Update order
DELETE /api/v1/ecommerce-orders/:id          - Delete order
```

### Ecommerce Order Items
```
GET    /api/v1/ecommerce-order-items         - List all items
POST   /api/v1/ecommerce-order-items         - Create new item
PATCH  /api/v1/ecommerce-order-items/:id     - Update item
DELETE /api/v1/ecommerce-order-items/:id     - Delete item
```

### Shopping Cart
```
GET    /api/v1/shopping-carts/current        - Get current cart
GET    /api/v1/shopping-carts/:id            - Get cart by ID
POST   /api/v1/shopping-carts                - Create new cart
PATCH  /api/v1/shopping-carts/:id            - Update cart
DELETE /api/v1/shopping-carts/:id            - Delete cart
DELETE /api/v1/shopping-carts/:id/clear      - Clear all items
POST   /api/v1/shopping-carts/:id/checkout   - Convert to order
```

### Shopping Cart Items
```
GET    /api/v1/shopping-cart-items           - List cart items
POST   /api/v1/shopping-cart-items           - Add item to cart
PATCH  /api/v1/shopping-cart-items/:id       - Update cart item
DELETE /api/v1/shopping-cart-items/:id       - Remove from cart
```

## Usage

### Data Fetching Hooks

```typescript
import {
  useEcommerceOrders,
  useEcommerceOrder,
  useEcommerceOrderItems,
  useCurrentCart,
  useShoppingCartItems,
  useCart, // Comprehensive cart hook
} from '@/modules/ecommerce';

// Fetch all orders with filters
const { ecommerceOrders, isLoading, error } = useEcommerceOrders({
  search: 'ECO-2025',
  status: 'pending',
  customerId: 123,
});

// Fetch single order by ID
const { ecommerceOrder, isLoading } = useEcommerceOrder('1');

// Fetch order items
const { ecommerceOrderItems, isLoading } = useEcommerceOrderItems(1);

// Get current shopping cart
const { cart, isLoading } = useCurrentCart({
  sessionId: 'sess_123456789',
});

// Comprehensive cart hook with all functionality
const {
  cart,
  cartItems,
  addProduct,
  updateItemQuantity,
  removeItem,
  clearAllItems,
  checkoutCart,
  isLoading,
} = useCart({ sessionId: 'sess_123456789' });
```

### Mutation Hooks

```typescript
import {
  useEcommerceOrderMutations,
  useEcommerceOrderItemMutations,
  useShoppingCartMutations,
  useShoppingCartItemMutations,
} from '@/modules/ecommerce';

// Order mutations
const {
  createEcommerceOrder,
  updateEcommerceOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingStatus,
  deleteEcommerceOrder,
  cancelOrder,
} = useEcommerceOrderMutations();

// Create order
const newOrder = await createEcommerceOrder({
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  orderDate: '2025-01-15',
  status: 'pending',
  shippingAddressLine1: '123 Main St',
  shippingCity: 'New York',
  shippingState: 'NY',
  shippingPostalCode: '10001',
  shippingCountry: 'USA',
});

// Update order status
await updateOrderStatus('1', 'confirmed');
await updatePaymentStatus('1', 'completed');
await updateShippingStatus('1', 'shipped');

// Shopping cart mutations
const {
  createCart,
  updateCartTotals,
  clearCart,
  checkout,
} = useShoppingCartMutations();

// Cart item mutations
const {
  addToCart,
  updateQuantity,
  removeFromCart,
} = useShoppingCartItemMutations();

// Add product to cart
await addToCart(1, 5, 2); // cartId, productId, quantity

// Update quantity
await updateQuantity('1', 5);

// Checkout
const order = await checkout('1', {
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  shippingAddress: '123 Main St',
});
```

### Comprehensive Cart Hook

The `useCart` hook provides a complete shopping cart solution:

```typescript
import { useCart } from '@/modules/ecommerce';

function ShoppingCartPage() {
  const {
    cart,
    cartItems,
    addProduct,
    updateItemQuantity,
    removeItem,
    clearAllItems,
    checkoutCart,
    isLoading,
    isAdding,
    isUpdating,
  } = useCart({ sessionId: 'sess_123456789' });

  const handleAddProduct = async (productId: number) => {
    await addProduct(productId, 1);
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    await updateItemQuantity(itemId, quantity);
  };

  const handleCheckout = async () => {
    const orderData = {
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
      shippingAddressLine1: '123 Main St',
      shippingCity: 'New York',
      shippingState: 'NY',
      shippingPostalCode: '10001',
      shippingCountry: 'USA',
    };

    const order = await checkoutCart(orderData);
    console.log('Order created:', order);
  };

  return (
    <div>
      {/* Cart UI */}
    </div>
  );
}
```

## Status Values

### Order Status
- `pending`: Order created, awaiting confirmation
- `confirmed`: Order confirmed by customer
- `processing`: Order being processed
- `shipped`: Order shipped to customer
- `delivered`: Order delivered successfully
- `cancelled`: Order cancelled
- `refunded`: Order refunded

### Payment Status
- `pending`: Payment not yet processed
- `processing`: Payment being processed
- `completed`: Payment completed successfully
- `failed`: Payment failed
- `refunded`: Payment refunded

### Shipping Status
- `pending`: Shipment not yet prepared
- `processing`: Preparing shipment
- `shipped`: Package shipped
- `in_transit`: Package in transit
- `delivered`: Package delivered
- `returned`: Package returned

## UI Components

The module includes complete UI components for both admin and public interfaces.

### Admin Components

#### OrdersAdminPage
Main administration interface for managing ecommerce orders.

**Features:**
- Order metrics dashboard (total, pending, completed, revenue)
- Advanced filtering (search, order status, payment status, shipping status)
- Professional table with status badges
- Pagination with smooth navigation
- CRUD operations (view, edit, delete)
- ConfirmModal for deletions
- Toast notifications

**Usage:**
```tsx
import { OrdersAdminPage } from '@/modules/ecommerce'

export default function OrdersPage() {
  return <OrdersAdminPage />
}
```

**Route:** `/dashboard/ecommerce/orders`

#### OrderViewTabs
Detailed order view with tabbed interface.

**Features:**
- Three tabs: Details, Items, Shipping
- Order status cards (order, payment, shipping)
- Customer information display
- Payment breakdown (subtotal, tax, shipping, discount, total)
- Order items table with product details
- Shipping and billing addresses
- Print functionality

**Usage:**
```tsx
import { OrderViewTabs } from '@/modules/ecommerce'

const { ecommerceOrder } = useEcommerceOrder(id)
const { ecommerceOrderItems } = useEcommerceOrderItems(orderId)

return (
  <OrderViewTabs
    order={ecommerceOrder}
    orderItems={ecommerceOrderItems}
    isLoadingItems={isLoading}
  />
)
```

**Route:** `/dashboard/ecommerce/orders/[id]`

#### OrderStatusBadge
Color-coded status badges for orders, payments, and shipping.

**Features:**
- Three badge types: order, payment, shipping
- Color-coded by status
- Bootstrap Icons integration
- Spanish labels

**Usage:**
```tsx
import { OrderStatusBadge } from '@/modules/ecommerce'

<OrderStatusBadge status="pending" type="order" />
<OrderStatusBadge status="completed" type="payment" />
<OrderStatusBadge status="shipped" type="shipping" />
```

### Public Components

#### CartPage
Shopping cart interface for viewing and managing cart items.

**Features:**
- Cart items list with product images
- Quantity controls (increment/decrement)
- Item removal with confirmation
- Clear cart functionality
- Cart summary (subtotal, tax, total)
- Responsive design
- Loading states
- Empty cart state with CTA

**Usage:**
```tsx
import { CartPage } from '@/modules/ecommerce'

<CartPage sessionId={sessionId} />
```

**Route:** `/cart`

**Session Management:**
```tsx
// Generate or retrieve session ID
const sessionId = localStorage.getItem('ecommerce_session_id') ||
  `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`
```

#### CheckoutPage
Complete checkout form for order completion.

**Features:**
- Customer information form (name, email, phone)
- Shipping address form (complete address fields)
- Billing address option (same as shipping or different)
- Order summary sidebar (items, totals)
- Form validation with user feedback
- Checkout processing with loading states
- Integration with `checkoutCart` hook

**Usage:**
```tsx
import { CheckoutPage } from '@/modules/ecommerce'

<CheckoutPage sessionId={sessionId} />
```

**Route:** `/checkout`

**Form Data:**
```typescript
{
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddressLine1: string
  shippingAddressLine2?: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  shippingCountry: string
  billingAddressLine1?: string  // If different from shipping
  // ... other billing fields
}
```

### Utility Components

#### OrderFilters
Advanced filtering component for orders.

**Features:**
- Search by order number, customer, email
- Filter by order status
- Filter by payment status
- Filter by shipping status
- Active filters summary with badges

#### OrdersTable
Professional table for displaying orders.

**Features:**
- Order information (number, customer, date, total)
- Status badges (order, payment, shipping)
- Actions (view, edit, delete)
- Responsive layout
- Empty state
- Loading state

#### PaginationSimple
Simple pagination component.

**Features:**
- First/last page navigation
- Page number buttons with ellipsis
- Items count display
- Disabled states

## Routes

### Admin Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/ecommerce/orders` | OrdersAdminPage | List all orders with filters |
| `/dashboard/ecommerce/orders/[id]` | OrderViewTabs | View order details |

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/cart` | CartPage | Shopping cart management |
| `/checkout` | CheckoutPage | Order checkout process |

## Testing

The module includes comprehensive tests:

### Test Coverage
- **Services**: 100% of service methods tested (39 tests)
- **Hooks**: 100% of hooks tested (39 tests)
- **Total Tests**: 78 tests passing
- Coverage includes:
  - Ecommerce orders CRUD operations
  - Order items management
  - Shopping cart operations
  - Cart items management
  - All data fetching hooks
  - All mutation hooks
  - Comprehensive useCart hook
  - Error handling and edge cases

### Running Tests
```bash
# Run all ecommerce module tests
npm run test:run -- src/modules/ecommerce

# Run with coverage
npm run test:coverage -- src/modules/ecommerce

# Watch mode
npm run test -- src/modules/ecommerce
```

### Test Files
- `ecommerceService.test.ts`: Service layer tests (24 tests)
- `cartService.test.ts`: Cart service tests (15 tests)
- `useEcommerceOrders.test.ts`: Order hooks tests (26 tests)
- `useShoppingCart.test.ts`: Cart hooks tests (13 tests)

## Services

### ecommerceService
Main service for orders and items:
```typescript
import { ecommerceService } from '@/modules/ecommerce/services';

// Orders
await ecommerceService.orders.getAll(filters);
await ecommerceService.orders.getById(id);
await ecommerceService.orders.create(data);
await ecommerceService.orders.update(id, data);
await ecommerceService.orders.updateStatus(id, status);
await ecommerceService.orders.updatePaymentStatus(id, status);
await ecommerceService.orders.updateShippingStatus(id, status);
await ecommerceService.orders.updateTotals(id, totals);
await ecommerceService.orders.delete(id);
await ecommerceService.orders.cancel(id, reason);

// Items
await ecommerceService.items.getAll(orderId);
await ecommerceService.items.create(data);
await ecommerceService.items.update(id, data);
await ecommerceService.items.delete(id);
```

### shoppingCartService
Service for shopping cart:
```typescript
import { shoppingCartService } from '@/modules/ecommerce/services';

// Cart
await shoppingCartService.cart.getCurrent(filters);
await shoppingCartService.cart.getById(id);
await shoppingCartService.cart.create(data);
await shoppingCartService.cart.updateTotals(id, totals);
await shoppingCartService.cart.clear(id);
await shoppingCartService.cart.delete(id);
await shoppingCartService.cart.checkout(id, orderData);

// Items
await shoppingCartService.items.getAll(cartId);
await shoppingCartService.items.add(cartId, productId, quantity);
await shoppingCartService.items.updateQuantity(id, quantity);
await shoppingCartService.items.update(id, data);
await shoppingCartService.items.remove(id);
```

## Order Creation Workflow

The module implements a complete order creation workflow:

```typescript
// Step 1: Create order
const orderData = {
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  status: 'pending',
  paymentStatus: 'pending',
  shippingStatus: 'pending',
  subtotalAmount: 0,
  taxAmount: 0,
  shippingAmount: 0,
  totalAmount: 0,
  shippingAddressLine1: '123 Main St',
  shippingCity: 'New York',
  shippingState: 'NY',
  shippingPostalCode: '10001',
  shippingCountry: 'USA',
  orderDate: '2025-01-15',
};

const order = await createEcommerceOrder(orderData);

// Step 2: Add items
for (const item of items) {
  await createEcommerceOrderItem({
    ecommerceOrderId: parseInt(order.id),
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxAmount: item.taxAmount,
    totalPrice: item.totalPrice,
  });
}

// Step 3: Update totals
await updateEcommerceOrderTotals(order.id, {
  subtotalAmount: calculatedSubtotal,
  taxAmount: calculatedTax,
  shippingAmount: shippingCost,
  totalAmount: calculatedTotal,
});

// Step 4: Update status
await updateOrderStatus(order.id, 'confirmed');
```

## Shopping Cart to Order Conversion

Convert a shopping cart to an order:

```typescript
// Using the comprehensive cart hook
const { cart, checkoutCart } = useCart({ sessionId: 'sess_123' });

// Checkout
const orderData = {
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  shippingAddressLine1: '123 Main St',
  shippingCity: 'New York',
  shippingState: 'NY',
  shippingPostalCode: '10001',
  shippingCountry: 'USA',
};

const order = await checkoutCart(orderData);
```

## Known Limitations

1. **Backend Integration**:
   - Assumes backend endpoints exist and follow JSON:API spec
   - Payment gateway integration pending (requires external service)
   - Email notifications not implemented (requires email service)

2. **Advanced Features** (Not Implemented):
   - Multi-currency support
   - Advanced tax calculations
   - Real-time shipment tracking integration
   - Abandoned cart recovery
   - Coupon/promo code system
   - Customer wishlist

3. **Testing**:
   - Component tests: Not implemented (78 tests for services + hooks)
   - Recommended: Add React Testing Library tests for UI components
   - E2E tests: Not implemented

## Future Enhancements

### High Priority
- [ ] Implement payment gateway integration (Stripe, PayPal, etc.)
- [ ] Add email notifications for order status changes
- [ ] Add component tests with React Testing Library
- [ ] Implement order tracking notifications

### Medium Priority
- [ ] Add coupon/promo code system
- [ ] Implement abandoned cart recovery
- [ ] Customer wishlist functionality
- [ ] Order templates for recurring orders
- [ ] Advanced order reports with charts

### Low Priority
- [ ] Multi-currency support
- [ ] Order versioning and history
- [ ] Export to PDF/Excel functionality
- [ ] Guest checkout optimization
- [ ] Product recommendations engine

## Backend Requirements

### Database Tables
- `ecommerce_orders`: Main orders table
- `ecommerce_order_items`: Order line items
- `shopping_carts`: Shopping carts table
- `shopping_cart_items`: Cart items table
- `contacts`: Customer information
- `products`: Product catalog
- `payment_methods`: Payment methods

### Permissions Required
- `view-ecommerce-orders`: View orders
- `create-ecommerce-orders`: Create new orders
- `edit-ecommerce-orders`: Edit existing orders
- `delete-ecommerce-orders`: Delete orders
- `manage-shopping-carts`: Manage shopping carts

## Related Modules

- **Contacts**: Customer management
- **Products**: Product catalog
- **Finance**: Payment processing (Payment Methods)
- **Inventory**: Stock management (optional integration)

## Support

For issues or questions:
1. Check backend API documentation
2. Review MASTER_ROADMAP for module status
3. Contact development team

---

**Module Status**: ✅ Production Ready (Complete)
**Test Coverage**: 78 tests passing (Services + Hooks)
**Components**: 8 UI components (Admin + Public)
**Routes**: 4 routes (2 admin + 2 public)
**Last Updated**: November 2025
**Version**: 2.0.0
