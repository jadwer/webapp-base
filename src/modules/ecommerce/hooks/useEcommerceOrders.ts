/**
 * useEcommerceOrders Hooks
 *
 * SWR-based hooks for fetching and mutating ecommerce orders.
 */

import useSWR from 'swr';
import { useState } from 'react';
import { ecommerceService } from '../services';
import type {
  EcommerceOrder,
  EcommerceOrderItem,
  EcommerceOrderFilters,
} from '../types';

// ============================================
// Data Fetching Hooks
// ============================================

/**
 * Hook to fetch all ecommerce orders with optional filters
 */
export function useEcommerceOrders(filters?: EcommerceOrderFilters) {
  const { data, error, isLoading, mutate } = useSWR(
    filters ? ['ecommerce-orders', filters] : 'ecommerce-orders',
    () => ecommerceService.orders.getAll(filters)
  );

  return {
    ecommerceOrders: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single ecommerce order by ID
 */
export function useEcommerceOrder(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `ecommerce-orders/${id}` : null,
    () => ecommerceService.orders.getById(id!)
  );

  return {
    ecommerceOrder: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch order items for a specific order
 */
export function useEcommerceOrderItems(ecommerceOrderId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    ecommerceOrderId ? `ecommerce-order-items/${ecommerceOrderId}` : null,
    () => ecommerceService.items.getAll(ecommerceOrderId)
  );

  return {
    ecommerceOrderItems: data || [],
    isLoading,
    error,
    mutate,
  };
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook for ecommerce order mutations (create, update, delete)
 */
export function useEcommerceOrderMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new ecommerce order
   */
  const createEcommerceOrder = async (
    order: Partial<EcommerceOrder>
  ): Promise<EcommerceOrder> => {
    setIsCreating(true);
    try {
      const result = await ecommerceService.orders.create(order);
      return result;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update an existing ecommerce order
   */
  const updateEcommerceOrder = async (
    id: string,
    order: Partial<EcommerceOrder>
  ): Promise<EcommerceOrder> => {
    setIsUpdating(true);
    try {
      const result = await ecommerceService.orders.update(id, order);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update order status
   */
  const updateOrderStatus = async (
    id: string,
    status: string
  ): Promise<EcommerceOrder> => {
    setIsUpdating(true);
    try {
      const result = await ecommerceService.orders.updateStatus(id, status);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update payment status
   */
  const updatePaymentStatus = async (
    id: string,
    paymentStatus: string
  ): Promise<EcommerceOrder> => {
    setIsUpdating(true);
    try {
      const result = await ecommerceService.orders.updatePaymentStatus(
        id,
        paymentStatus
      );
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update shipping status
   */
  const updateShippingStatus = async (
    id: string,
    shippingStatus: string
  ): Promise<EcommerceOrder> => {
    setIsUpdating(true);
    try {
      const result = await ecommerceService.orders.updateShippingStatus(
        id,
        shippingStatus
      );
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update order totals
   */
  const updateEcommerceOrderTotals = async (
    id: string,
    totals: {
      subtotalAmount: number;
      taxAmount: number;
      shippingAmount?: number;
      discountAmount?: number;
      totalAmount: number;
    }
  ): Promise<EcommerceOrder> => {
    setIsUpdating(true);
    try {
      const result = await ecommerceService.orders.updateTotals(id, totals);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete an ecommerce order
   */
  const deleteEcommerceOrder = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await ecommerceService.orders.delete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cancel an order
   */
  const cancelOrder = async (id: string, reason?: string): Promise<EcommerceOrder> => {
    setIsUpdating(true);
    try {
      const result = await ecommerceService.orders.cancel(id, reason);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    createEcommerceOrder,
    updateEcommerceOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateShippingStatus,
    updateEcommerceOrderTotals,
    deleteEcommerceOrder,
    cancelOrder,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

/**
 * Hook for ecommerce order item mutations (create, update, delete)
 */
export function useEcommerceOrderItemMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new order item
   */
  const createEcommerceOrderItem = async (
    item: Partial<EcommerceOrderItem>
  ): Promise<EcommerceOrderItem> => {
    setIsCreating(true);
    try {
      const result = await ecommerceService.items.create(item);
      return result;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update an existing order item
   */
  const updateEcommerceOrderItem = async (
    id: string,
    item: Partial<EcommerceOrderItem>
  ): Promise<EcommerceOrderItem> => {
    setIsUpdating(true);
    try {
      const result = await ecommerceService.items.update(id, item);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete an order item
   */
  const deleteEcommerceOrderItem = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await ecommerceService.items.delete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createEcommerceOrderItem,
    updateEcommerceOrderItem,
    deleteEcommerceOrderItem,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
