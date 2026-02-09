/**
 * Tests for LocalCartPage component
 * Tests the public shopping cart page with quote request functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LocalCartItem } from '../../hooks/useLocalCart'

// Define mocks before vi.mock calls (hoisting issue)
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockIsAuthenticated = vi.fn()
const mockUseLocalCart = vi.fn()

// Mock toast - use factory function to avoid hoisting issues
vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock auth hook
vi.mock('@/modules/auth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated(),
    isLoading: false,
  }),
}))

// Mock useLocalCart hook
vi.mock('../../hooks/useLocalCart', () => ({
  useLocalCart: () => mockUseLocalCart(),
}))

// Mock quote service
vi.mock('@/modules/quotes/services/quoteService', () => ({
  default: {
    quotes: {
      requestQuote: vi.fn(),
    },
  },
}))

// Mock shopping cart service
vi.mock('@/modules/ecommerce/services', () => ({
  shoppingCartService: {
    localSync: {
      syncLocalCartToAPI: vi.fn(),
      saveCartIdForCheckout: vi.fn(),
    },
  },
}))

// Import after mocks
import { LocalCartPage } from '../../components/LocalCartPage'
import { toast } from '@/lib/toast'
import quoteServiceModule from '@/modules/quotes/services/quoteService'
import { shoppingCartService } from '@/modules/ecommerce/services'

const mockToast = toast as {
  success: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
}

const mockQuoteService = quoteServiceModule.quotes as {
  requestQuote: ReturnType<typeof vi.fn>
}

const mockCartSync = shoppingCartService.localSync as {
  syncLocalCartToAPI: ReturnType<typeof vi.fn>
  saveCartIdForCheckout: ReturnType<typeof vi.fn>
}

// Create mock cart items
function createMockCartItem(overrides: Partial<LocalCartItem> = {}): LocalCartItem {
  return {
    id: 'item_1_123',
    productId: '1',
    name: 'Test Product',
    price: 100,
    quantity: 2,
    imageUrl: 'https://example.com/image.jpg',
    sku: 'SKU-001',
    unitName: 'pz',
    categoryName: 'Category 1',
    brandName: 'Brand 1',
    addedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// Helper: standard mock return for cart with items
function mockCartWithItems(items: LocalCartItem[], totals?: { itemCount: number; subtotal: number; uniqueItems: number }) {
  const defaultTotals = {
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    uniqueItems: items.length,
  }
  return {
    items,
    totals: totals || defaultTotals,
    isInitialized: true,
    isEmpty: false,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    incrementQuantity: vi.fn(),
    decrementQuantity: vi.fn(),
    clearCart: vi.fn(),
  }
}

describe('LocalCartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsAuthenticated.mockReturnValue(false)
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('Loading State', () => {
    it('should show loading spinner when cart is not initialized', () => {
      mockUseLocalCart.mockReturnValue({
        items: [],
        totals: { itemCount: 0, subtotal: 0, uniqueItems: 0 },
        isInitialized: false,
        isEmpty: true,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      render(<LocalCartPage />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Cargando carrito...')).toBeInTheDocument()
    })
  })

  describe('Empty Cart State', () => {
    it('should show empty cart message when no items', () => {
      mockUseLocalCart.mockReturnValue({
        items: [],
        totals: { itemCount: 0, subtotal: 0, uniqueItems: 0 },
        isInitialized: true,
        isEmpty: true,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      render(<LocalCartPage />)

      expect(screen.getByText('Tu carrito esta vacio')).toBeInTheDocument()
      expect(screen.getByText('Ver Productos')).toBeInTheDocument()
    })

    it('should link to products page when empty', () => {
      mockUseLocalCart.mockReturnValue({
        items: [],
        totals: { itemCount: 0, subtotal: 0, uniqueItems: 0 },
        isInitialized: true,
        isEmpty: true,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      render(<LocalCartPage />)

      const link = screen.getByRole('link', { name: /ver productos/i })
      expect(link).toHaveAttribute('href', '/productos')
    })

    it('should use custom continueShoppingUrl when provided', () => {
      mockUseLocalCart.mockReturnValue({
        items: [],
        totals: { itemCount: 0, subtotal: 0, uniqueItems: 0 },
        isInitialized: true,
        isEmpty: true,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      render(<LocalCartPage continueShoppingUrl="/catalog" />)

      const link = screen.getByRole('link', { name: /ver productos/i })
      expect(link).toHaveAttribute('href', '/catalog')
    })
  })

  describe('Cart with Items', () => {
    it('should display cart items', () => {
      const items = [
        createMockCartItem({ productId: '1', name: 'Product A', price: 100, quantity: 2 }),
        createMockCartItem({ productId: '2', name: 'Product B', price: 200, quantity: 1 }),
      ]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items, { itemCount: 3, subtotal: 400, uniqueItems: 2 }))

      render(<LocalCartPage />)

      expect(screen.getByText('Product A')).toBeInTheDocument()
      expect(screen.getByText('Product B')).toBeInTheDocument()
      expect(screen.getByText('3 productos')).toBeInTheDocument()
    })

    it('should show item count badge', () => {
      const items = [createMockCartItem({ quantity: 5 })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items, { itemCount: 5, subtotal: 500, uniqueItems: 1 }))

      render(<LocalCartPage />)

      expect(screen.getByText('5 productos')).toBeInTheDocument()
    })

    it('should show singular "producto" for 1 item', () => {
      const items = [createMockCartItem({ quantity: 1 })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items, { itemCount: 1, subtotal: 100, uniqueItems: 1 }))

      render(<LocalCartPage />)

      expect(screen.getByText('1 producto')).toBeInTheDocument()
    })

    it('should display SKU and brand for items', () => {
      const items = [createMockCartItem({ sku: 'TEST-SKU', brandName: 'Test Brand' })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items, { itemCount: 2, subtotal: 200, uniqueItems: 1 }))

      render(<LocalCartPage />)

      expect(screen.getByText('SKU: TEST-SKU')).toBeInTheDocument()
      expect(screen.getByText('Test Brand')).toBeInTheDocument()
    })

    it('should format prices correctly in MXN', () => {
      const items = [createMockCartItem({ price: 1234.56, quantity: 1 })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items, { itemCount: 1, subtotal: 1234.56, uniqueItems: 1 }))

      render(<LocalCartPage />)

      const priceElements = screen.getAllByText('$1,234.56')
      expect(priceElements.length).toBeGreaterThan(0)
    })
  })

  describe('Quantity Controls', () => {
    it('should call incrementQuantity when + button is clicked', async () => {
      const mockIncrementQuantity = vi.fn()
      const items = [createMockCartItem({ productId: '1', quantity: 2 })]
      mockUseLocalCart.mockReturnValue({
        ...mockCartWithItems(items),
        incrementQuantity: mockIncrementQuantity,
      })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const incrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.bi-plus')
      )
      if (incrementButton) {
        await user.click(incrementButton)
      }

      expect(mockIncrementQuantity).toHaveBeenCalledWith('1')
    })

    it('should call decrementQuantity when - button is clicked', async () => {
      const mockDecrementQuantity = vi.fn()
      const items = [createMockCartItem({ productId: '1', quantity: 2 })]
      mockUseLocalCart.mockReturnValue({
        ...mockCartWithItems(items),
        decrementQuantity: mockDecrementQuantity,
      })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const decrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.bi-dash')
      )
      if (decrementButton) {
        await user.click(decrementButton)
      }

      expect(mockDecrementQuantity).toHaveBeenCalledWith('1')
    })

    it('should disable decrement button when quantity is 1', () => {
      const items = [createMockCartItem({ productId: '1', quantity: 1 })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      render(<LocalCartPage />)
      const decrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.bi-dash')
      )

      expect(decrementButton).toBeDisabled()
    })
  })

  describe('Remove Item', () => {
    it('should call removeFromCart when trash button is clicked', async () => {
      const mockRemoveFromCart = vi.fn()
      const items = [createMockCartItem({ productId: '1' })]
      mockUseLocalCart.mockReturnValue({
        ...mockCartWithItems(items),
        removeFromCart: mockRemoveFromCart,
      })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const removeButton = screen.getByTitle('Eliminar producto')
      await user.click(removeButton)

      expect(mockRemoveFromCart).toHaveBeenCalledWith('1')
    })
  })

  describe('Clear Cart', () => {
    it('should call clearCart when clear button is clicked', async () => {
      const mockClearCart = vi.fn()
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        ...mockCartWithItems(items),
        clearCart: mockClearCart,
      })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const clearButton = screen.getByText('Vaciar Carrito')
      await user.click(clearButton)

      expect(mockClearCart).toHaveBeenCalled()
    })
  })

  describe('Request Quote - Not Authenticated', () => {
    it('should redirect to login when requesting quote without auth', async () => {
      mockIsAuthenticated.mockReturnValue(false)
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/cart&action=quote')
    })

    it('should save cart to sessionStorage when redirecting to login', async () => {
      mockIsAuthenticated.mockReturnValue(false)
      const items = [createMockCartItem({ productId: '1', name: 'Test', price: 100, quantity: 2 })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      const savedCart = sessionStorage.getItem('pendingQuoteCart')
      expect(savedCart).not.toBeNull()
      const parsedCart = JSON.parse(savedCart!)
      expect(parsedCart).toHaveLength(1)
      expect(parsedCart[0].productId).toBe('1')
    })
  })

  describe('Request Quote - Authenticated', () => {
    it('should call requestQuote API when authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(true)
      const items = [createMockCartItem({ productId: '1', quantity: 2 })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))
      mockQuoteService.requestQuote.mockResolvedValue({
        success: true,
        message: 'Cotizacion creada',
        data: { quote_number: 'COT-001', total_amount: 200 },
      })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      await waitFor(() => {
        expect(mockQuoteService.requestQuote).toHaveBeenCalledWith({
          items: [{ product_id: 1, quantity: 2 }],
          notes: undefined,
        })
      })
    })

    it('should show success toast after quote creation', async () => {
      mockIsAuthenticated.mockReturnValue(true)
      const items = [createMockCartItem({ productId: '1', quantity: 2 })]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))
      mockQuoteService.requestQuote.mockResolvedValue({
        success: true,
        message: 'Cotizacion creada exitosamente',
        data: { quote_number: 'COT-001', total_amount: 200 },
      })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Cotizacion creada exitosamente')
      })
    })
  })

  describe('Request Quote - Empty Cart', () => {
    it('should show error toast when cart is empty', async () => {
      mockIsAuthenticated.mockReturnValue(true)
      mockUseLocalCart.mockReturnValue({
        items: [],
        totals: { itemCount: 0, subtotal: 0, uniqueItems: 0 },
        isInitialized: true,
        isEmpty: false, // Component still renders, but items array is empty
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      expect(mockToast.error).toHaveBeenCalledWith('El carrito esta vacio')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Order Summary', () => {
    it('should display subtotal correctly', () => {
      const items = [
        createMockCartItem({ price: 100, quantity: 2 }),
        createMockCartItem({ productId: '2', price: 50, quantity: 3 }),
      ]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items, { itemCount: 5, subtotal: 350, uniqueItems: 2 }))

      render(<LocalCartPage />)

      expect(screen.getByText('Subtotal (5 productos)')).toBeInTheDocument()
      expect(screen.getAllByText('$350.00')).toHaveLength(2) // Subtotal and Total
    })

    it('should show "Por calcular" for shipping', () => {
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      render(<LocalCartPage />)

      expect(screen.getByText('Por calcular')).toBeInTheDocument()
    })

    it('should display quote info message', () => {
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      render(<LocalCartPage />)

      expect(screen.getByText(/Solicitar cotizacion:/i)).toBeInTheDocument()
      expect(screen.getByText(/Te contactaremos con precios especiales/i)).toBeInTheDocument()
    })
  })

  describe('Checkout Button', () => {
    it('should show checkout button with correct text', () => {
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      render(<LocalCartPage />)

      // Checkout is a Button (not Link), found by text
      expect(screen.getByText('Proceder al Pago')).toBeInTheDocument()
    })

    it('should redirect to login when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false)
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const checkoutButton = screen.getByText('Proceder al Pago')
      await user.click(checkoutButton)

      expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/cart&action=checkout')
    })

    it('should sync cart and navigate to checkout when authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(true)
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))
      mockCartSync.syncLocalCartToAPI.mockResolvedValue({ id: 'cart-123' })

      const user = userEvent.setup()

      render(<LocalCartPage />)
      const checkoutButton = screen.getByText('Proceder al Pago')
      await user.click(checkoutButton)

      await waitFor(() => {
        expect(mockCartSync.syncLocalCartToAPI).toHaveBeenCalledWith(items)
        expect(mockCartSync.saveCartIdForCheckout).toHaveBeenCalledWith('cart-123')
        expect(mockPush).toHaveBeenCalledWith('/checkout')
      })
    })

    it('should call onCheckout callback when provided', async () => {
      mockIsAuthenticated.mockReturnValue(true)
      const mockOnCheckout = vi.fn()
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))
      mockCartSync.syncLocalCartToAPI.mockResolvedValue({ id: 'cart-456' })

      const user = userEvent.setup()

      render(<LocalCartPage onCheckout={mockOnCheckout} />)
      const checkoutButton = screen.getByText('Proceder al Pago')
      await user.click(checkoutButton)

      await waitFor(() => {
        expect(mockOnCheckout).toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled() // should use callback, not router
      })
    })
  })

  describe('Trust Badges', () => {
    it('should display trust badges', () => {
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      render(<LocalCartPage />)

      expect(screen.getByText('Envio Seguro')).toBeInTheDocument()
      expect(screen.getByText('Devoluciones')).toBeInTheDocument()
      expect(screen.getByText('Soporte')).toBeInTheDocument()
    })

    it('should display secure payment badge', () => {
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue(mockCartWithItems(items))

      render(<LocalCartPage />)

      expect(screen.getByText('Pago seguro garantizado')).toBeInTheDocument()
    })
  })
})
