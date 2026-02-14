import { useState, useEffect } from 'react';
import { tenantService } from '../services';
import { Tenant } from '../types';
import { Modal, Button, Badge, ConfirmDialog } from '../components/ui';
import TenantForm from '../components/tenants/TenantForm';
import TenantDetail from '../components/tenants/TenantDetail';
import { toast } from 'react-toastify';

const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchQuery, statusFilter]);

  const loadTenants = async () => {
    try {
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const filterTenants = () => {
    let filtered = [...tenants];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.is_active === (statusFilter === 'active'));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.full_name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          (t.business_name && t.business_name.toLowerCase().includes(query))
      );
    }

    setFilteredTenants(filtered);
  };

  const handleCreate = () => {
    setSelectedTenant(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsFormOpen(true);
  };

  const handleView = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Tenant>) => {
    try {
      if (selectedTenant) {
        await tenantService.update(selectedTenant.id, data);
        toast.success('Tenant updated successfully');
      } else {
        await tenantService.create(data);
        toast.success('Tenant created successfully');
      }
      setIsFormOpen(false);
      loadTenants();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Operation failed';
      toast.error(message);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!selectedTenant) return;

    try {
      await tenantService.delete(selectedTenant.id);
      toast.success('Tenant deleted successfully');
      loadTenants();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete tenant';
      toast.error(message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tenants...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
        <Button onClick={handleCreate}>Add Tenant</Button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by name, email, or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                statusFilter === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                statusFilter === 'inactive'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleView(tenant)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tenant.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.business_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={tenant.is_active ? 'success' : 'gray'}>
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(tenant);
                    }}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tenant);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTenants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No tenants found matching your filters.'
              : 'No tenants found. Add your first tenant to get started.'}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedTenant ? 'Edit Tenant' : 'Add Tenant'}
        size="lg"
      >
        <TenantForm
          tenant={selectedTenant || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Tenant Details"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedTenant && <TenantDetail tenant={selectedTenant} />}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Tenant"
        message={`Are you sure you want to delete ${selectedTenant?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Tenants;
