export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'property_manager' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export interface Warehouse {
  id: number;
  unit_number: string;
  location: string;
  size_sqft: number;
  rental_rate: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  amenities?: string;
  description?: string;
  floor_plan_url?: string;
  created_at: string;
}

export interface Tenant {
  id: number;
  full_name: string;
  business_name?: string;
  email: string;
  phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Lease {
  id: number;
  warehouse_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  rental_amount: number;
  payment_frequency: 'monthly' | 'quarterly' | 'annually';
  security_deposit: number;
  late_fee_percentage: number;
  grace_period_days: number;
  status: 'active' | 'expired' | 'terminated';
  terms_and_conditions?: string;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  lease_id: number;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_method?: 'bank_transfer' | 'check' | 'cash' | 'online';
  transaction_reference?: string;
  late_fee: number;
  notes?: string;
  created_at: string;
}

export interface MaintenanceRequest {
  id: number;
  warehouse_id: number;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'structural' | 'cleaning' | 'hvac' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  estimated_cost: number;
  actual_cost: number;
  reported_at: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'property_manager' | 'viewer';
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
