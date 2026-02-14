import { useState, useEffect } from 'react';
import { leaseService, warehouseService, tenantService } from '../services';
import { Lease, Warehouse, Tenant } from '../types';
import { Modal, Button, Badge, ConfirmDialog } from '../components/ui';
import LeaseForm from '../components/leases/LeaseForm';
import LeaseDetail from '../components/leases/LeaseDetail';
import { toast } from 'react-toastify';

const Leases = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'terminated'>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeases();
  }, [leases, statusFilter, warehouseFilter, tenantFilter]);

  const loadData = async () => {
    try {
      const [leasesData, warehousesData, tenantsData] = await Promise.all([
        leaseService.getAll(),
        warehouseService.getAll(),
        tenantService.getAll(),
      ]);
      setLeases(leasesData);
      setWarehouses(warehousesData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load leases');
    } finally {
      setLoading(false);
    }
  };

  const filterLeases = () => {
    let filtered = [...leases];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }

    // Warehouse filter
    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(l => l.warehouse_id === parseInt(warehouseFilter));
    }

    // Tenant filter
    if (tenantFilter !== 'all') {
      filtered = filtered.filter(l => l.tenant_id === parseInt(tenantFilter));
    }

    setFilteredLeases(filtered);
  };

  const handleCreate = () => {
    setSelectedLease(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lease: Lease) => {
    setSelectedLease(lease);
    setIsFormOpen(true);
  };

  const handleView = (lease: Lease) => {
    setSelectedLease(lease);
    setIsDetailOpen(true);
  };

  const handleTerminate = (lease: Lease) => {
    setSelectedLease(lease);
    setIsTerminateOpen(true);
  };

  const handleSubmit = async (data: Partial<Lease>) => {
    try {
      if (selectedLease) {
        await leaseService.update(selectedLease.id, data);
        toast.success('Lease updated successfully');
      } else {
        await leaseService.create(data);
        toast.success('Lease created successfully');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Operation failed';
      toast.error(message);
      throw error;
    }
  };

  const confirmTerminate = async () => {
    if (!selectedLease) return;

    try {
      await leaseService.update(selectedLease.id, { status: 'terminated' });
      toast.success('Lease terminated successfully');
      setIsTerminateOpen(false);
      setIsDetailOpen(false);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to terminate lease';
      toast.error(message);
    }
  };

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? `${warehouse.unit_number} - ${warehouse.location}` : 'Unknown';
  };

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.full_name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
      active: 'success',
      expired: 'warning',
      terminated: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const isExpiringSoon = (lease: Lease) => {
    if (lease.status !== 'active') return false;
    const today = new Date();
    const endDate = new Date(lease.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  if (loading) {
    return <div className="text-center py-8">Loading leases...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leases</h2>
        <Button onClick={handleCreate}>Create Lease</Button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  statusFilter === 'active'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  statusFilter === 'expired'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expired
              </button>
              <button
                onClick={() => setStatusFilter('terminated')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  statusFilter === 'terminated'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Terminated
              </button>
            </div>
          </div>

          {/* Warehouse Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.unit_number} - {warehouse.location}
                </option>
              ))}
            </select>
          </div>

          {/* Tenant Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeases.map((lease) => (
              <tr
                key={lease.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  isExpiringSoon(lease) ? 'bg-yellow-50' : ''
                }`}
                onClick={() => handleView(lease)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getWarehouseName(lease.warehouse_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getTenantName(lease.tenant_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(lease.start_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {formatDate(lease.end_date)}
                    {isExpiringSoon(lease) && (
                      <span className="ml-2 text-xs text-yellow-700">⚠️ Expiring soon</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(lease.rental_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(lease.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(lease);
                    }}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    Edit
                  </button>
                  {lease.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTerminate(lease);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Terminate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeases.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {statusFilter !== 'all' || warehouseFilter !== 'all' || tenantFilter !== 'all'
              ? 'No leases found matching your filters.'
              : 'No leases found. Create your first lease to get started.'}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedLease ? 'Edit Lease' : 'Create Lease'}
        size="lg"
      >
        <LeaseForm
          lease={selectedLease || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Lease Details"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedLease && (
          <LeaseDetail
            lease={selectedLease}
            onTerminate={
              selectedLease.status === 'active'
                ? () => handleTerminate(selectedLease)
                : undefined
            }
          />
        )}
      </Modal>

      {/* Terminate Confirmation */}
      <ConfirmDialog
        isOpen={isTerminateOpen}
        onClose={() => setIsTerminateOpen(false)}
        onConfirm={confirmTerminate}
        title="Terminate Lease"
        message={`Are you sure you want to terminate this lease? The warehouse will become available for rent.`}
        confirmText="Terminate"
        variant="danger"
      />
    </div>
  );
};

export default Leases;
