import useSWR from 'swr';
<<<<<<< HEAD
import { Product } from '../types/Product';
import { fetchInventory } from '../services/inventoryApi';

export function useInventory() {
  const { data, error, isLoading } = useSWR<Product[]>('/api/inventory', fetchInventory);
  return { products: data, isLoading, error };
=======
import { fetchInventory } from '../services/inventoryApi';

export function useInventory() {
  const { data, error } = useSWR('inventory', fetchInventory);
  return { items: data ?? [], isLoading: !error && !data, error };
>>>>>>> codex
}
