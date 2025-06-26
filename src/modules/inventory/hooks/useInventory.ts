import useSWR from 'swr';
import { fetchInventory } from '../services/inventoryApi';

export function useInventory() {
  const { data, error } = useSWR('inventory', fetchInventory);
  return { items: data ?? [], isLoading: !error && !data, error };
}
