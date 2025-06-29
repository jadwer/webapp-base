import useSWR from 'swr';
import { Product } from '../types/Product';
import { fetchInventory } from '../services/inventoryApi';

export function useInventory() {
  const { data, error, isLoading } = useSWR<Product[]>('/api/inventory', fetchInventory);
  return { products: data, isLoading, error };
}
