export { authService } from './authService';
export { warehouseService } from './warehouseService';
import api from './api';
import { Tenant, Lease, Payment, MaintenanceRequest } from '../types';

// Tenant Service
export const tenantService = {
  async getAll(is_active?: boolean): Promise<Tenant[]> {
    const params = is_active !== undefined ? { is_active } : {};
    const response = await api.get<Tenant[]>('/tenants', { params });
    return response.data;
  },

  async getById(id: number): Promise<Tenant> {
    const response = await api.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.post<Tenant>('/tenants', data);
    return response.data;
  },

  async update(id: number, data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put<Tenant>(`/tenants/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tenants/${id}`);
  },
};

// Lease Service
export const leaseService = {
  async getAll(params?: { status?: string; warehouse_id?: number; tenant_id?: number }): Promise<Lease[]> {
    const response = await api.get<Lease[]>('/leases', { params });
    return response.data;
  },

  async getById(id: number): Promise<Lease> {
    const response = await api.get<Lease>(`/leases/${id}`);
    return response.data;
  },

  async create(data: Partial<Lease>): Promise<Lease> {
    const response = await api.post<Lease>('/leases', data);
    return response.data;
  },

  async update(id: number, data: Partial<Lease>): Promise<Lease> {
    const response = await api.put<Lease>(`/leases/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/leases/${id}`);
  },
};

// Payment Service
export const paymentService = {
  async getAll(params?: { status?: string; lease_id?: number }): Promise<Payment[]> {
    const response = await api.get<Payment[]>('/payments', { params });
    return response.data;
  },

  async getOverdue(): Promise<Payment[]> {
    const response = await api.get<Payment[]>('/payments/overdue');
    return response.data;
  },

  async getById(id: number): Promise<Payment> {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  async create(data: Partial<Payment>): Promise<Payment> {
    const response = await api.post<Payment>('/payments', data);
    return response.data;
  },

  async update(id: number, data: Partial<Payment>): Promise<Payment> {
    const response = await api.put<Payment>(`/payments/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/payments/${id}`);
  },
};

// Maintenance Service
export const maintenanceService = {
  async getAll(params?: { status?: string; priority?: string; warehouse_id?: number }): Promise<MaintenanceRequest[]> {
    const response = await api.get<MaintenanceRequest[]>('/maintenance', { params });
    return response.data;
  },

  async getById(id: number): Promise<MaintenanceRequest> {
    const response = await api.get<MaintenanceRequest>(`/maintenance/${id}`);
    return response.data;
  },

  async create(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const response = await api.post<MaintenanceRequest>('/maintenance', data);
    return response.data;
  },

  async update(id: number, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const response = await api.put<MaintenanceRequest>(`/maintenance/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/maintenance/${id}`);
  },
};
