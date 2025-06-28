<<<<<<< HEAD
import axios from '@/lib/api';
import { Product } from '../types/Product';

export async function fetchInventory(): Promise<Product[]> {
  const response = await axios.get('/inventory');
  return response.data.data;
=======
import axios from 'axios';
import { Product } from '../types/Product';

export async function fetchInventory(): Promise<Product[]> {
  const { data } = await axios.get<Product[]>('/api/inventory');
  return data;
>>>>>>> codex
}
