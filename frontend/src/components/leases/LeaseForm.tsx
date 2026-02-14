import { useState, useEffect } from 'react';
import { Input, TextArea, Select, Button } from '../ui';
import { Lease, Warehouse, Tenant } from '../../types';
import { warehouseService, tenantService } from '../../services';

interface LeaseFormProps {
  lease?: Lease;
  onSubmit: (data: Partial<Lease>) => Promise<void>;
  onCancel: () => void;
}

const LeaseForm: React.FC<LeaseFormProps> = ({ lease, onSubmit, onCancel }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    warehouse_id: lease?.warehouse_id?.toString() || '',
    tenant_id: lease?.tenant_id?.toString() || '',
    start_date: lease?.start_date || '',
    end_date: lease?.end_date || '',
    rental_amount: lease?.rental_amount?.toString() || '',
    payment_frequency: lease?.payment_frequency || 'monthly',
    security_deposit: lease?.security_deposit?.toString() || '0',
    late_fee_percentage: lease?.late_fee_percentage?.toString() || '5',
    grace_period_days: lease?.grace_period_days?.toString() || '5',
    terms_and_conditions: lease?.terms_and_conditions || '',
    notes: lease?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [warehousesData, tenantsData] = await Promise.all([
        warehouseService.getAll(),
        tenantService.getAll(true), // Only active tenants
      ]);

      // For create mode, filter to show only vacant warehouses
      if (!lease) {
        const vacantWarehouses = warehousesData.filter((w) => w.status === 'vacant');
        setWarehouses(vacantWarehouses);
      } else {
        // For edit mode, show all warehouses
        setWarehouses(warehousesData);
      }

      setTenants(tenantsData.filter(t => t.is_active));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.warehouse_id) {
      newErrors.warehouse_id = 'Warehouse is required';
    }

    if (!formData.tenant_id) {
      newErrors.tenant_id = 'Tenant is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (!formData.rental_amount || parseFloat(formData.rental_amount) <= 0) {
      newErrors.rental_amount = 'Rental amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        warehouse_id: parseInt(formData.warehouse_id),
        tenant_id: parseInt(formData.tenant_id),
        rental_amount: parseFloat(formData.rental_amount),
        security_deposit: parseFloat(formData.security_deposit),
        late_fee_percentage: parseFloat(formData.late_fee_percentage),
        grace_period_days: parseInt(formData.grace_period_days),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Warehouse Unit"
          name="warehouse_id"
          value={formData.warehouse_id}
          onChange={handleChange}
          error={errors.warehouse_id}
          options={warehouses.map((w) => ({
            value: w.id,
            label: `${w.unit_number} - ${w.location} (${w.size_sqft} sqft)`,
          }))}
          placeholder="Select a warehouse"
          required
          disabled={!!lease} // Can't change warehouse once lease is created
        />

        <Select
          label="Tenant"
          name="tenant_id"
          value={formData.tenant_id}
          onChange={handleChange}
          error={errors.tenant_id}
          options={tenants.map((t) => ({
            value: t.id,
            label: t.business_name ? `${t.full_name} (${t.business_name})` : t.full_name,
          }))}
          placeholder="Select a tenant"
          required
          disabled={!!lease} // Can't change tenant once lease is created
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          error={errors.start_date}
          required
        />

        <Input
          label="End Date"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
          error={errors.end_date}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Rental Amount (Monthly)"
          name="rental_amount"
          type="number"
          step="0.01"
          value={formData.rental_amount}
          onChange={handleChange}
          error={errors.rental_amount}
          required
        />

        <Select
          label="Payment Frequency"
          name="payment_frequency"
          value={formData.payment_frequency}
          onChange={handleChange}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'annually', label: 'Annually' },
          ]}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Security Deposit"
          name="security_deposit"
          type="number"
          step="0.01"
          value={formData.security_deposit}
          onChange={handleChange}
        />

        <Input
          label="Late Fee (%)"
          name="late_fee_percentage"
          type="number"
          step="0.1"
          value={formData.late_fee_percentage}
          onChange={handleChange}
          helperText="Percentage per month"
        />

        <Input
          label="Grace Period (Days)"
          name="grace_period_days"
          type="number"
          value={formData.grace_period_days}
          onChange={handleChange}
        />
      </div>

      <TextArea
        label="Terms and Conditions"
        name="terms_and_conditions"
        value={formData.terms_and_conditions}
        onChange={handleChange}
        rows={4}
      />

      <TextArea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
      />

      {warehouses.length === 0 && !lease && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            No vacant warehouses available. All warehouses are currently occupied or under maintenance.
          </p>
        </div>
      )}

      {tenants.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            No active tenants available. Please add tenants first before creating a lease.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting || (warehouses.length === 0 && !lease) || tenants.length === 0}
        >
          {submitting ? 'Saving...' : lease ? 'Update Lease' : 'Create Lease'}
        </Button>
      </div>
    </form>
  );
};

export default LeaseForm;
