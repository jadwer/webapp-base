import axios from '@/lib/api';
import { Product } from '../types/Product';

export async function fetchInventory(): Promise<Product[]> {
  const response = await axios.get('/inventory');
  return response.data.data;
}
