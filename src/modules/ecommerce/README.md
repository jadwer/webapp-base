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

## Testing

The module includes comprehensive tests:

### Test Coverage
- **Services**: 100% of service methods tested (39 tests)
- **Total Tests**: 39 tests passing
- Coverage includes:
  - Ecommerce orders CRUD operations
  - Order items management
  - Shopping cart operations
  - Cart items management
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

1. **Testing Coverage**:
   - Hooks tests: 0% (pending implementation)
   - Component tests: 0% (UI components not yet implemented)
   - Recommended: Add hooks and component tests

2. **Backend Integration**:
   - Assumes backend endpoints exist and follow JSON:API spec
   - Payment processing integration pending
   - Email notifications not implemented

3. **Advanced Features** (Not Implemented):
   - Multi-currency support
   - Advanced tax calculations
   - Shipment tracking integration
   - Email notifications
   - Abandoned cart recovery
   - Coupon/promo code system

## Future Enhancements

### High Priority
- [ ] Add hooks tests (React hooks testing library)
- [ ] Implement UI components (product catalog, cart, checkout)
- [ ] Add email notifications for order status changes
- [ ] Implement payment gateway integration

### Medium Priority
- [ ] Add coupon/promo code system
- [ ] Implement abandoned cart recovery
- [ ] Add order templates for recurring orders
- [ ] Customer wishlist functionality

### Low Priority
- [ ] Multi-currency support
- [ ] Order versioning and history
- [ ] Advanced reporting with charts
- [ ] Export to PDF/Excel functionality

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

**Module Status**: Production Ready (Service Layer - 39 tests passing)
**Last Updated**: November 2025
**Version**: 1.0.0
