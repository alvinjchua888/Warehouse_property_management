import { useState, useEffect } from 'react';
import { Tenant, Lease } from '../../types';
import { leaseService } from '../../services';
import { Badge } from '../ui';

interface TenantDetailProps {
  tenant: Tenant;
}

const TenantDetail: React.FC<TenantDetailProps> = ({ tenant }) => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeases();
  }, [tenant.id]);

  const loadLeases = async () => {
    try {
      const data = await leaseService.getAll({ tenant_id: tenant.id });
      setLeases(data);
    } catch (error) {
      console.error('Failed to load leases:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
      active: 'success',
      expired: 'warning',
      terminated: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="text-sm font-medium text-gray-900">{tenant.full_name}</p>
          </div>
          {tenant.business_name && (
            <div>
              <p className="text-sm text-gray-500">Business Name</p>
              <p className="text-sm font-medium text-gray-900">{tenant.business_name}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{tenant.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-900">{tenant.phone}</p>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact</h4>
          <div className="grid grid-cols-2 gap-4">
            {tenant.emergency_contact_name && (
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{tenant.emergency_contact_name}</p>
              </div>
            )}
            {tenant.emergency_contact_phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{tenant.emergency_contact_phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {tenant.notes && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{tenant.notes}</p>
        </div>
      )}

      {/* Status */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Status</h4>
        <Badge variant={tenant.is_active ? 'success' : 'gray'}>
          {tenant.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Associated Leases */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Associated Leases ({leases.length})
        </h4>
        {loading ? (
          <p className="text-sm text-gray-500">Loading leases...</p>
        ) : leases.length > 0 ? (
          <div className="space-y-2">
            {leases.map((lease) => (
              <div
                key={lease.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${lease.rental_amount.toLocaleString()}/month
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
                  </p>
                </div>
                {getStatusBadge(lease.status)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No leases found</p>
        )}
      </div>

      {/* Created Date */}
      <div>
        <p className="text-xs text-gray-500">
          Created on {formatDate(tenant.created_at)}
        </p>
      </div>
    </div>
  );
};

export default TenantDetail;
