import { useState, useEffect } from 'react';
import { Input, TextArea, Button } from '../ui';
import { Tenant } from '../../types';

interface TenantFormProps {
  tenant?: Tenant;
  onSubmit: (data: Partial<Tenant>) => Promise<void>;
  onCancel: () => void;
}

const TenantForm: React.FC<TenantFormProps> = ({ tenant, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: tenant?.full_name || '',
    business_name: tenant?.business_name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    emergency_contact_name: tenant?.emergency_contact_name || '',
    emergency_contact_phone: tenant?.emergency_contact_phone || '',
    notes: tenant?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          error={errors.full_name}
          required
        />

        <Input
          label="Business Name"
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Emergency Contact Name"
          name="emergency_contact_name"
          value={formData.emergency_contact_name}
          onChange={handleChange}
        />

        <Input
          label="Emergency Contact Phone"
          name="emergency_contact_phone"
          type="tel"
          value={formData.emergency_contact_phone}
          onChange={handleChange}
        />
      </div>

      <TextArea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : tenant ? 'Update Tenant' : 'Create Tenant'}
        </Button>
      </div>
    </form>
  );
};

export default TenantForm;
