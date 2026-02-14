import api from './api';
import { Warehouse } from '../types';

export const warehouseService = {
  async getAll(status?: string): Promise<Warehouse[]> {
    const params = status ? { status } : {};
    const response = await api.get<Warehouse[]>('/warehouses', { params });
    return response.data;
  },

  async getById(id: number): Promise<Warehouse> {
    const response = await api.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  async create(data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.post<Warehouse>('/warehouses', data);
    return response.data;
  },

  async update(id: number, data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.put<Warehouse>(`/warehouses/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/warehouses/${id}`);
  },
};
