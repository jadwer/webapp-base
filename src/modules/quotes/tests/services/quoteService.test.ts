/**
 * Quote Service Tests
 *
 * Comprehensive unit tests for quoteService and quoteItemService.
 * Tests all 24 methods across both services.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quoteService, quoteItemService } from '../../services/quoteService';
import {
  createMockQuote,
  createMockQuoteItem,
  createMockQuoteAPIResponse,
  createMockQuotesListAPIResponse,
  createMockQuoteItemAPIResponse,
  createMockQuoteItemsListAPIResponse,
  createMockActionResponse,
  createMockConvertResponse,
  createMockSummaryResponse,
  createMockExpiringSoonResponse,
  createMockQuoteSummary,
  createMockAddress,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosClient from '@/lib/axiosClient';

const mockAxios = axiosClient as any;

// ============================================
// Quote Service Tests
// ============================================

describe('quoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getAll
  // ============================================

  describe('getAll', () => {
    it('should fetch all quotes with default parameters', async () => {
      // Arrange
      const mockQuotes = [
        createMockQuote({ id: '1', quoteNumber: 'COT-26000001' }),
        createMockQuote({ id: '2', quoteNumber: 'COT-26000002' }),
      ];
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse(mockQuotes),
      });

      // Act
      const result = await quoteService.getAll();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          'page[size]': '20',
          include: 'contact,items',
        }),
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].quoteNumber).toBe('COT-26000001');
    });

    it('should fetch quotes with status filter', async () => {
      // Arrange
      const mockQuotes = [createMockQuote({ status: 'draft' })];
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse(mockQuotes),
      });

      // Act
      const result = await quoteService.getAll({ status: 'draft' });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          'filter[status]': 'draft',
        }),
      });
      expect(result.data[0].status).toBe('draft');
    });

    it('should fetch quotes with multiple status filter', async () => {
      // Arrange
      const mockQuotes = [
        createMockQuote({ status: 'draft' }),
        createMockQuote({ status: 'sent' }),
      ];
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse(mockQuotes),
      });

      // Act
      await quoteService.getAll({ status: ['draft', 'sent'] });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          'filter[status]': 'draft,sent',
        }),
      });
    });

    it('should fetch quotes with search filter', async () => {
      // Arrange
      const mockQuotes = [createMockQuote({ quoteNumber: 'COT-26000001' })];
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse(mockQuotes),
      });

      // Act
      await quoteService.getAll({ search: 'COT-26000001' });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          'filter[quote_number]': 'COT-26000001',
        }),
      });
    });

    it('should fetch quotes with date range filter', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse([]),
      });

      // Act
      await quoteService.getAll({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          'filter[quote_date][gte]': '2026-01-01',
          'filter[quote_date][lte]': '2026-01-31',
        }),
      });
    });

    it('should fetch quotes with sorting', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse([]),
      });

      // Act
      await quoteService.getAll(
        undefined,
        { field: 'totalAmount', direction: 'desc' }
      );

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          sort: '-total_amount',
        }),
      });
    });

    it('should fetch quotes with ascending sort', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse([]),
      });

      // Act
      await quoteService.getAll(
        undefined,
        { field: 'quoteDate', direction: 'asc' }
      );

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          sort: 'quote_date',
        }),
      });
    });

    it('should fetch quotes with pagination', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse([], { currentPage: 2, perPage: 10, total: 50 }),
      });

      // Act
      const result = await quoteService.getAll(undefined, undefined, 2, 10);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          'page[number]': '2',
          'page[size]': '10',
        }),
      });
      expect(result.meta?.currentPage).toBe(2);
    });

    it('should fetch quotes with contact filter', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: createMockQuotesListAPIResponse([]),
      });

      // Act
      await quoteService.getAll({ contactId: 123 });

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes', {
        params: expect.objectContaining({
          'filter[contact]': '123',
        }),
      });
    });
  });

  // ============================================
  // getById
  // ============================================

  describe('getById', () => {
    it('should fetch a single quote by ID', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1' });
      mockAxios.get.mockResolvedValue({
        data: createMockQuoteAPIResponse(mockQuote),
      });

      // Act
      const result = await quoteService.getById('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes/1', {
        params: {
          include: 'contact,items,items.product,items.product.stock',
        },
      });
      expect(result.id).toBe('1');
      expect(result.quoteNumber).toBe('COT-26000001');
    });

    it('should fetch quote with custom includes', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1' });
      mockAxios.get.mockResolvedValue({
        data: createMockQuoteAPIResponse(mockQuote),
      });

      // Act
      await quoteService.getById('1', ['contact']);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes/1', {
        params: {
          include: 'contact',
        },
      });
    });
  });

  // ============================================
  // create
  // ============================================

  describe('create', () => {
    it('should create a new quote', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1' });
      mockAxios.post.mockResolvedValue({
        data: createMockQuoteAPIResponse(mockQuote),
      });

      // Act
      const result = await quoteService.create({
        contactId: 1,
        quoteDate: '2026-01-21',
        validUntil: '2026-02-21',
        notes: 'Test notes',
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/quotes',
        expect.objectContaining({
          data: {
            type: 'quotes',
            attributes: expect.objectContaining({
              contact_id: 1,
              quote_date: '2026-01-21',
              valid_until: '2026-02-21',
              notes: 'Test notes',
            }),
          },
        })
      );
      expect(result.id).toBe('1');
    });

    it('should create quote with address', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1' });
      const address = createMockAddress();
      mockAxios.post.mockResolvedValue({
        data: createMockQuoteAPIResponse(mockQuote),
      });

      // Act
      await quoteService.create({
        contactId: 1,
        quoteDate: '2026-01-21',
        shippingAddress: address,
        billingAddress: address,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/quotes',
        expect.objectContaining({
          data: {
            type: 'quotes',
            attributes: expect.objectContaining({
              shipping_address: address,
              billing_address: address,
            }),
          },
        })
      );
    });
  });

  // ============================================
  // createFromCart
  // ============================================

  describe('createFromCart', () => {
    it('should create quote from shopping cart', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1', shoppingCartId: 5 });
      mockAxios.post.mockResolvedValue({
        data: {
          data: createMockQuoteAPIResponse(mockQuote).data,
          message: 'Quote created successfully from cart',
        },
      });

      // Act
      const result = await quoteService.createFromCart({
        shopping_cart_id: 5,
        contact_id: 1,
        valid_until: '2026-02-21',
        notes: 'From cart',
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/from-cart', {
        shopping_cart_id: 5,
        contact_id: 1,
        valid_until: '2026-02-21',
        notes: 'From cart',
      });
      expect(result.data.shoppingCartId).toBe(5);
      expect(result.message).toBe('Quote created successfully from cart');
    });

    it('should create quote from cart with minimal data', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1' });
      mockAxios.post.mockResolvedValue({
        data: {
          data: createMockQuoteAPIResponse(mockQuote).data,
          message: 'Quote created',
        },
      });

      // Act
      await quoteService.createFromCart({
        shopping_cart_id: 1,
        contact_id: 1,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/from-cart', {
        shopping_cart_id: 1,
        contact_id: 1,
      });
    });
  });

  // ============================================
  // update
  // ============================================

  describe('update', () => {
    it('should update an existing quote', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1', notes: 'Updated notes' });
      mockAxios.patch.mockResolvedValue({
        data: createMockQuoteAPIResponse(mockQuote),
      });

      // Act
      const result = await quoteService.update('1', {
        notes: 'Updated notes',
        validUntil: '2026-03-21',
      });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/quotes/1',
        expect.objectContaining({
          data: {
            type: 'quotes',
            id: '1',
            attributes: expect.objectContaining({
              notes: 'Updated notes',
              valid_until: '2026-03-21',
            }),
          },
        })
      );
      expect(result.notes).toBe('Updated notes');
    });
  });

  // ============================================
  // delete
  // ============================================

  describe('delete', () => {
    it('should delete a quote', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await quoteService.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/quotes/1');
    });
  });

  // ============================================
  // send
  // ============================================

  describe('send', () => {
    it('should send quote to customer', async () => {
      // Arrange
      const mockQuote = createMockQuote({
        id: '1',
        status: 'sent',
        sentAt: '2026-01-21T12:00:00.000Z',
      });
      mockAxios.post.mockResolvedValue({
        data: createMockActionResponse(mockQuote, 'Quote sent successfully'),
      });

      // Act
      const result = await quoteService.send('1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/send');
      expect(result.data.status).toBe('sent');
      expect(result.data.sentAt).toBe('2026-01-21T12:00:00.000Z');
      expect(result.message).toBe('Quote sent successfully');
    });
  });

  // ============================================
  // accept
  // ============================================

  describe('accept', () => {
    it('should mark quote as accepted', async () => {
      // Arrange
      const mockQuote = createMockQuote({
        id: '1',
        status: 'accepted',
        acceptedAt: '2026-01-21T14:00:00.000Z',
      });
      mockAxios.post.mockResolvedValue({
        data: createMockActionResponse(mockQuote, 'Quote accepted'),
      });

      // Act
      const result = await quoteService.accept('1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/accept');
      expect(result.data.status).toBe('accepted');
      expect(result.data.acceptedAt).toBe('2026-01-21T14:00:00.000Z');
    });
  });

  // ============================================
  // reject
  // ============================================

  describe('reject', () => {
    it('should mark quote as rejected without reason', async () => {
      // Arrange
      const mockQuote = createMockQuote({
        id: '1',
        status: 'rejected',
        rejectedAt: '2026-01-21T14:00:00.000Z',
      });
      mockAxios.post.mockResolvedValue({
        data: createMockActionResponse(mockQuote, 'Quote rejected'),
      });

      // Act
      const result = await quoteService.reject('1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/reject', {});
      expect(result.data.status).toBe('rejected');
    });

    it('should mark quote as rejected with reason', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1', status: 'rejected' });
      mockAxios.post.mockResolvedValue({
        data: createMockActionResponse(mockQuote, 'Quote rejected'),
      });

      // Act
      await quoteService.reject('1', { reason: 'Price too high' });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/reject', {
        reason: 'Price too high',
      });
    });
  });

  // ============================================
  // convert
  // ============================================

  describe('convert', () => {
    it('should convert quote to sales order', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1', status: 'accepted' });
      const salesOrder = { id: '10', orderNumber: 'SO-26000001' };
      mockAxios.post.mockResolvedValue({
        data: createMockConvertResponse(mockQuote, salesOrder),
      });

      // Act
      const result = await quoteService.convert('1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/convert', {});
      expect(result.data.quote.status).toBe('converted');
      expect(result.data.salesOrder.id).toBe('10');
      expect(result.message).toBe('Quote converted to sales order successfully');
    });

    it('should convert quote with shipping/billing address', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1' });
      const salesOrder = { id: '10', orderNumber: 'SO-26000001' };
      const address = createMockAddress();
      mockAxios.post.mockResolvedValue({
        data: createMockConvertResponse(mockQuote, salesOrder),
      });

      // Act
      await quoteService.convert('1', {
        shipping_address: address,
        billing_address: address,
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/convert', {
        shipping_address: address,
        billing_address: address,
      });
    });
  });

  // ============================================
  // cancel
  // ============================================

  describe('cancel', () => {
    it('should cancel a quote', async () => {
      // Arrange
      const mockQuote = createMockQuote({ id: '1', status: 'cancelled' });
      mockAxios.post.mockResolvedValue({
        data: createMockActionResponse(mockQuote, 'Quote cancelled'),
      });

      // Act
      const result = await quoteService.cancel('1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/cancel');
      expect(result.data.status).toBe('cancelled');
      expect(result.message).toBe('Quote cancelled');
    });
  });

  // ============================================
  // duplicate
  // ============================================

  describe('duplicate', () => {
    it('should duplicate a quote', async () => {
      // Arrange
      const mockQuote = createMockQuote({
        id: '2',
        quoteNumber: 'COT-26000002',
        status: 'draft',
      });
      mockAxios.post.mockResolvedValue({
        data: createMockActionResponse(mockQuote, 'Quote duplicated'),
      });

      // Act
      const result = await quoteService.duplicate('1');

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/quotes/1/duplicate');
      expect(result.data.id).toBe('2');
      expect(result.data.quoteNumber).toBe('COT-26000002');
      expect(result.data.status).toBe('draft');
    });
  });

  // ============================================
  // getExpiringSoon
  // ============================================

  describe('getExpiringSoon', () => {
    it('should fetch quotes expiring within default days', async () => {
      // Arrange
      const mockQuotes = [
        createMockQuote({ id: '1', validUntil: '2026-01-25' }),
        createMockQuote({ id: '2', validUntil: '2026-01-27' }),
      ];
      mockAxios.get.mockResolvedValue({
        data: createMockExpiringSoonResponse(mockQuotes, 7),
      });

      // Act
      const result = await quoteService.getExpiringSoon();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes/expiring-soon', {
        params: { days: 7 },
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta.count).toBe(2);
      expect(result.meta.days).toBe(7);
    });

    it('should fetch quotes expiring within custom days', async () => {
      // Arrange
      mockAxios.get.mockResolvedValue({
        data: createMockExpiringSoonResponse([], 14),
      });

      // Act
      await quoteService.getExpiringSoon(14);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes/expiring-soon', {
        params: { days: 14 },
      });
    });
  });

  // ============================================
  // getSummary
  // ============================================

  describe('getSummary', () => {
    it('should fetch quote statistics summary', async () => {
      // Arrange
      const mockSummary = createMockQuoteSummary();
      mockAxios.get.mockResolvedValue({
        data: createMockSummaryResponse(mockSummary),
      });

      // Act
      const result = await quoteService.getSummary();

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quotes/summary');
      expect(result.total).toBe(100);
      expect(result.draft).toBe(20);
      expect(result.sent).toBe(30);
      expect(result.accepted).toBe(25);
      expect(result.converted).toBe(10);
      expect(result.conversionRate).toBe(35.0);
      expect(result.totalValue).toBe(500000.00);
    });
  });
});

// ============================================
// Quote Item Service Tests
// ============================================

describe('quoteItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getByQuoteId
  // ============================================

  describe('getByQuoteId', () => {
    it('should fetch all items for a quote', async () => {
      // Arrange
      const mockItems = [
        createMockQuoteItem({ id: '1', quoteId: 1 }),
        createMockQuoteItem({ id: '2', quoteId: 1 }),
      ];
      mockAxios.get.mockResolvedValue({
        data: createMockQuoteItemsListAPIResponse(mockItems),
      });

      // Act
      const result = await quoteItemService.getByQuoteId('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quote-items', {
        params: {
          'filter[quote]': '1',
          include: 'product',
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].quoteId).toBe(1);
    });
  });

  // ============================================
  // getById
  // ============================================

  describe('getById', () => {
    it('should fetch a single quote item by ID', async () => {
      // Arrange
      const mockItem = createMockQuoteItem({ id: '1' });
      mockAxios.get.mockResolvedValue({
        data: createMockQuoteItemAPIResponse(mockItem),
      });

      // Act
      const result = await quoteItemService.getById('1');

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/quote-items/1', {
        params: {
          include: 'product',
        },
      });
      expect(result.id).toBe('1');
      expect(result.productName).toBe('Test Product');
    });
  });

  // ============================================
  // create
  // ============================================

  describe('create', () => {
    it('should create a new quote item', async () => {
      // Arrange
      const mockItem = createMockQuoteItem({ id: '1' });
      mockAxios.post.mockResolvedValue({
        data: createMockQuoteItemAPIResponse(mockItem),
      });

      // Act
      const result = await quoteItemService.create({
        quoteId: 1,
        productId: 1,
        quantity: 2,
        unitPrice: 500.00,
        quotedPrice: 450.00,
        discountPercentage: 10,
        taxRate: 16,
        productName: 'Test Product',
        productSku: 'PROD-001',
      });

      // Assert
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/quote-items',
        expect.objectContaining({
          data: {
            type: 'quote-items',
            attributes: expect.objectContaining({
              quote_id: 1,
              product_id: 1,
              quantity: 2,
              unit_price: 500.00,
              quoted_price: 450.00,
              discount_percentage: 10,
              tax_rate: 16,
              product_name: 'Test Product',
              product_sku: 'PROD-001',
            }),
          },
        })
      );
      expect(result.id).toBe('1');
    });
  });

  // ============================================
  // update
  // ============================================

  describe('update', () => {
    it('should update quote item quantity', async () => {
      // Arrange
      const mockItem = createMockQuoteItem({ id: '1', quantity: 5 });
      mockAxios.patch.mockResolvedValue({
        data: createMockQuoteItemAPIResponse(mockItem),
      });

      // Act
      const result = await quoteItemService.update('1', { quantity: 5 });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/quote-items/1',
        expect.objectContaining({
          data: {
            type: 'quote-items',
            id: '1',
            attributes: {
              quantity: 5,
            },
          },
        })
      );
      expect(result.quantity).toBe(5);
    });

    it('should update quote item quoted price', async () => {
      // Arrange
      const mockItem = createMockQuoteItem({ id: '1', quotedPrice: 400.00 });
      mockAxios.patch.mockResolvedValue({
        data: createMockQuoteItemAPIResponse(mockItem),
      });

      // Act
      const result = await quoteItemService.update('1', { quotedPrice: 400.00 });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/quote-items/1',
        expect.objectContaining({
          data: {
            type: 'quote-items',
            id: '1',
            attributes: {
              quoted_price: 400.00,
            },
          },
        })
      );
      expect(result.quotedPrice).toBe(400.00);
    });

    it('should update quote item discount percentage', async () => {
      // Arrange
      const mockItem = createMockQuoteItem({ id: '1', discountPercentage: 15 });
      mockAxios.patch.mockResolvedValue({
        data: createMockQuoteItemAPIResponse(mockItem),
      });

      // Act
      const result = await quoteItemService.update('1', { discountPercentage: 15 });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/quote-items/1',
        expect.objectContaining({
          data: {
            type: 'quote-items',
            id: '1',
            attributes: {
              discount_percentage: 15,
            },
          },
        })
      );
      expect(result.discountPercentage).toBe(15);
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      const mockItem = createMockQuoteItem({
        id: '1',
        quantity: 3,
        quotedPrice: 450.00,
        discountPercentage: 10,
        notes: 'Updated notes',
      });
      mockAxios.patch.mockResolvedValue({
        data: createMockQuoteItemAPIResponse(mockItem),
      });

      // Act
      const result = await quoteItemService.update('1', {
        quantity: 3,
        quotedPrice: 450.00,
        discountPercentage: 10,
        notes: 'Updated notes',
      });

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/api/v1/quote-items/1',
        expect.objectContaining({
          data: {
            type: 'quote-items',
            id: '1',
            attributes: {
              quantity: 3,
              quoted_price: 450.00,
              discount_percentage: 10,
              notes: 'Updated notes',
            },
          },
        })
      );
      expect(result.quantity).toBe(3);
      expect(result.quotedPrice).toBe(450.00);
    });
  });

  // ============================================
  // delete
  // ============================================

  describe('delete', () => {
    it('should delete a quote item', async () => {
      // Arrange
      mockAxios.delete.mockResolvedValue({});

      // Act
      await quoteItemService.delete('1');

      // Assert
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/v1/quote-items/1');
    });
  });

  // ============================================
  // bulkUpdate
  // ============================================

  describe('bulkUpdate', () => {
    it('should bulk update multiple quote items', async () => {
      // Arrange
      const mockItems = [
        createMockQuoteItem({ id: '1', quotedPrice: 400.00 }),
        createMockQuoteItem({ id: '2', quotedPrice: 350.00 }),
        createMockQuoteItem({ id: '3', quotedPrice: 600.00 }),
      ];

      mockAxios.patch
        .mockResolvedValueOnce({ data: createMockQuoteItemAPIResponse(mockItems[0]) })
        .mockResolvedValueOnce({ data: createMockQuoteItemAPIResponse(mockItems[1]) })
        .mockResolvedValueOnce({ data: createMockQuoteItemAPIResponse(mockItems[2]) });

      // Act
      const result = await quoteItemService.bulkUpdate([
        { id: '1', data: { quotedPrice: 400.00 } },
        { id: '2', data: { quotedPrice: 350.00 } },
        { id: '3', data: { quotedPrice: 600.00 } },
      ]);

      // Assert
      expect(mockAxios.patch).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
      expect(result[0].quotedPrice).toBe(400.00);
      expect(result[1].quotedPrice).toBe(350.00);
      expect(result[2].quotedPrice).toBe(600.00);
    });

    it('should handle empty bulk update', async () => {
      // Act
      const result = await quoteItemService.bulkUpdate([]);

      // Assert
      expect(mockAxios.patch).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });
});

// ============================================
// Error Handling Tests
// ============================================

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should propagate network errors from getAll', async () => {
    // Arrange
    const error = new Error('Network Error');
    mockAxios.get.mockRejectedValue(error);

    // Act & Assert
    await expect(quoteService.getAll()).rejects.toThrow('Network Error');
  });

  it('should propagate 404 errors from getById', async () => {
    // Arrange
    const error = new Error('Not Found');
    (error as any).response = { status: 404 };
    mockAxios.get.mockRejectedValue(error);

    // Act & Assert
    await expect(quoteService.getById('999')).rejects.toThrow('Not Found');
  });

  it('should propagate 422 validation errors from create', async () => {
    // Arrange
    const error = new Error('Validation Error');
    (error as any).response = {
      status: 422,
      data: {
        errors: [{ source: { pointer: '/data/attributes/contact_id' }, detail: 'is required' }],
      },
    };
    mockAxios.post.mockRejectedValue(error);

    // Act & Assert
    await expect(
      quoteService.create({ contactId: 0, quoteDate: '' })
    ).rejects.toThrow('Validation Error');
  });

  it('should propagate 403 forbidden errors from send', async () => {
    // Arrange
    const error = new Error('Forbidden');
    (error as any).response = { status: 403 };
    mockAxios.post.mockRejectedValue(error);

    // Act & Assert
    await expect(quoteService.send('1')).rejects.toThrow('Forbidden');
  });

  it('should propagate 500 server errors from convert', async () => {
    // Arrange
    const error = new Error('Internal Server Error');
    (error as any).response = { status: 500 };
    mockAxios.post.mockRejectedValue(error);

    // Act & Assert
    await expect(quoteService.convert('1')).rejects.toThrow('Internal Server Error');
  });
});
