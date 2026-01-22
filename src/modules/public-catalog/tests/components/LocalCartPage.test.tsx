/**
 * Tests for LocalCartPage component
 * Tests the public shopping cart page with quote request functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LocalCartItem } from '../../hooks/useLocalCart'

// Define mocks before vi.mock calls (hoisting issue)
const mockPush = vi.fn()
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
    replace: vi.fn(),
    back: vi.fn(),
  }),
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

// Import after mocks
import { LocalCartPage } from '../../components/LocalCartPage'
import { toast } from '@/lib/toast'

const mockToast = toast as {
  success: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
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
      // Arrange
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

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Cargando carrito...')).toBeInTheDocument()
    })
  })

  describe('Empty Cart State', () => {
    it('should show empty cart message when no items', () => {
      // Arrange
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

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('Tu carrito esta vacio')).toBeInTheDocument()
      expect(screen.getByText('Ver Productos')).toBeInTheDocument()
    })

    it('should link to products page when empty', () => {
      // Arrange
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

      // Act
      render(<LocalCartPage />)

      // Assert
      const link = screen.getByRole('link', { name: /ver productos/i })
      expect(link).toHaveAttribute('href', '/productos')
    })

    it('should use custom continueShoppingUrl when provided', () => {
      // Arrange
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

      // Act
      render(<LocalCartPage continueShoppingUrl="/catalog" />)

      // Assert
      const link = screen.getByRole('link', { name: /ver productos/i })
      expect(link).toHaveAttribute('href', '/catalog')
    })
  })

  describe('Cart with Items', () => {
    it('should display cart items', () => {
      // Arrange
      const items = [
        createMockCartItem({ productId: '1', name: 'Product A', price: 100, quantity: 2 }),
        createMockCartItem({ productId: '2', name: 'Product B', price: 200, quantity: 1 }),
      ]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 3, subtotal: 400, uniqueItems: 2 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('Product A')).toBeInTheDocument()
      expect(screen.getByText('Product B')).toBeInTheDocument()
      expect(screen.getByText('3 productos')).toBeInTheDocument()
    })

    it('should show item count badge', () => {
      // Arrange
      const items = [createMockCartItem({ quantity: 5 })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 5, subtotal: 500, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('5 productos')).toBeInTheDocument()
    })

    it('should show singular "producto" for 1 item', () => {
      // Arrange
      const items = [createMockCartItem({ quantity: 1 })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 1, subtotal: 100, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('1 producto')).toBeInTheDocument()
    })

    it('should display SKU and brand for items', () => {
      // Arrange
      const items = [createMockCartItem({ sku: 'TEST-SKU', brandName: 'Test Brand' })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('SKU: TEST-SKU')).toBeInTheDocument()
      expect(screen.getByText('Test Brand')).toBeInTheDocument()
    })

    it('should format prices correctly in MXN', () => {
      // Arrange
      const items = [createMockCartItem({ price: 1234.56, quantity: 1 })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 1, subtotal: 1234.56, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      // Should display MXN formatted price (appears multiple times: unit price, line total, subtotal, total)
      const priceElements = screen.getAllByText('$1,234.56')
      expect(priceElements.length).toBeGreaterThan(0)
    })
  })

  describe('Quantity Controls', () => {
    it('should call incrementQuantity when + button is clicked', async () => {
      // Arrange
      const mockIncrementQuantity = vi.fn()
      const items = [createMockCartItem({ productId: '1', quantity: 2 })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: mockIncrementQuantity,
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const incrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.bi-plus')
      )
      if (incrementButton) {
        await user.click(incrementButton)
      }

      // Assert
      expect(mockIncrementQuantity).toHaveBeenCalledWith('1')
    })

    it('should call decrementQuantity when - button is clicked', async () => {
      // Arrange
      const mockDecrementQuantity = vi.fn()
      const items = [createMockCartItem({ productId: '1', quantity: 2 })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: mockDecrementQuantity,
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const decrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.bi-dash')
      )
      if (decrementButton) {
        await user.click(decrementButton)
      }

      // Assert
      expect(mockDecrementQuantity).toHaveBeenCalledWith('1')
    })

    it('should disable decrement button when quantity is 1', () => {
      // Arrange
      const items = [createMockCartItem({ productId: '1', quantity: 1 })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 1, subtotal: 100, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)
      const decrementButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('.bi-dash')
      )

      // Assert
      expect(decrementButton).toBeDisabled()
    })
  })

  describe('Remove Item', () => {
    it('should call removeFromCart when trash button is clicked', async () => {
      // Arrange
      const mockRemoveFromCart = vi.fn()
      const items = [createMockCartItem({ productId: '1' })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: mockRemoveFromCart,
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const removeButton = screen.getByTitle('Eliminar producto')
      await user.click(removeButton)

      // Assert
      expect(mockRemoveFromCart).toHaveBeenCalledWith('1')
    })
  })

  describe('Clear Cart', () => {
    it('should call clearCart when clear button is clicked', async () => {
      // Arrange
      const mockClearCart = vi.fn()
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: mockClearCart,
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const clearButton = screen.getByText('Vaciar Carrito')
      await user.click(clearButton)

      // Assert
      expect(mockClearCart).toHaveBeenCalled()
    })
  })

  describe('Request Quote - Not Authenticated', () => {
    it('should redirect to login when requesting quote without auth', async () => {
      // Arrange
      mockIsAuthenticated.mockReturnValue(false)
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/dashboard/quotes/create&action=quote')
      expect(mockToast.info).toHaveBeenCalledWith('Inicia sesion para solicitar una cotizacion')
    })

    it('should save cart to sessionStorage when redirecting to login', async () => {
      // Arrange
      mockIsAuthenticated.mockReturnValue(false)
      const items = [createMockCartItem({ productId: '1', name: 'Test', price: 100, quantity: 2 })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      // Assert
      const savedCart = sessionStorage.getItem('pendingQuoteCart')
      expect(savedCart).not.toBeNull()
      const parsedCart = JSON.parse(savedCart!)
      expect(parsedCart).toHaveLength(1)
      expect(parsedCart[0].productId).toBe('1')
    })
  })

  describe('Request Quote - Authenticated', () => {
    it('should redirect to quote creation when authenticated', async () => {
      // Arrange
      mockIsAuthenticated.mockReturnValue(true)
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/dashboard/quotes/create?source=public-cart')
    })

    it('should save cart to sessionStorage before redirecting', async () => {
      // Arrange
      mockIsAuthenticated.mockReturnValue(true)
      const items = [createMockCartItem({ productId: '42' })]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      // Assert
      const savedCart = sessionStorage.getItem('pendingQuoteCart')
      expect(savedCart).not.toBeNull()
      const parsedCart = JSON.parse(savedCart!)
      expect(parsedCart[0].productId).toBe('42')
    })
  })

  describe('Request Quote - Empty Cart', () => {
    it('should show error toast when cart is empty', async () => {
      // Arrange
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

      // Act
      render(<LocalCartPage />)
      const quoteButton = screen.getByText('Solicitar Cotizacion')
      await user.click(quoteButton)

      // Assert
      expect(mockToast.error).toHaveBeenCalledWith('El carrito esta vacio')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Order Summary', () => {
    it('should display subtotal correctly', () => {
      // Arrange
      const items = [
        createMockCartItem({ price: 100, quantity: 2 }),
        createMockCartItem({ productId: '2', price: 50, quantity: 3 }),
      ]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 5, subtotal: 350, uniqueItems: 2 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      // Subtotal appears in summary section
      expect(screen.getByText('Subtotal (5 productos)')).toBeInTheDocument()
      expect(screen.getAllByText('$350.00')).toHaveLength(2) // Subtotal and Total
    })

    it('should show "Por calcular" for shipping', () => {
      // Arrange
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('Por calcular')).toBeInTheDocument()
    })

    it('should display quote info message', () => {
      // Arrange
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText(/Solicitar cotizacion:/i)).toBeInTheDocument()
      expect(screen.getByText(/Te contactaremos con precios especiales/i)).toBeInTheDocument()
    })
  })

  describe('Checkout Button', () => {
    it('should show checkout button linking to default URL', () => {
      // Arrange
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      const checkoutLink = screen.getByRole('link', { name: /proceder al pago/i })
      expect(checkoutLink).toHaveAttribute('href', '/checkout')
    })

    it('should use custom checkoutUrl when provided', () => {
      // Arrange
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage checkoutUrl="/custom-checkout" />)

      // Assert
      const checkoutLink = screen.getByRole('link', { name: /proceder al pago/i })
      expect(checkoutLink).toHaveAttribute('href', '/custom-checkout')
    })

    it('should call onCheckout callback when provided', async () => {
      // Arrange
      const mockOnCheckout = vi.fn()
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      const user = userEvent.setup()

      // Act
      render(<LocalCartPage onCheckout={mockOnCheckout} />)
      const checkoutButton = screen.getByText('Proceder al Pago')
      await user.click(checkoutButton)

      // Assert
      expect(mockOnCheckout).toHaveBeenCalled()
    })
  })

  describe('Trust Badges', () => {
    it('should display trust badges', () => {
      // Arrange
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('Envio Seguro')).toBeInTheDocument()
      expect(screen.getByText('Devoluciones')).toBeInTheDocument()
      expect(screen.getByText('Soporte')).toBeInTheDocument()
    })

    it('should display secure payment badge', () => {
      // Arrange
      const items = [createMockCartItem()]
      mockUseLocalCart.mockReturnValue({
        items,
        totals: { itemCount: 2, subtotal: 200, uniqueItems: 1 },
        isInitialized: true,
        isEmpty: false,
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        incrementQuantity: vi.fn(),
        decrementQuantity: vi.fn(),
        clearCart: vi.fn(),
      })

      // Act
      render(<LocalCartPage />)

      // Assert
      expect(screen.getByText('Pago seguro garantizado')).toBeInTheDocument()
    })
  })
})
