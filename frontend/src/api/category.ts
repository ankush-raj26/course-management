import { api } from './axios';
import type { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const res = await api.get('/categories');
  return res.data.categories;
}
