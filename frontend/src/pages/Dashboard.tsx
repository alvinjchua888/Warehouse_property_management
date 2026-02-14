import { useState, useEffect } from 'react';
import { warehouseService, paymentService, maintenanceService, leaseService } from '../services';
import { Warehouse, Payment, MaintenanceRequest, Lease } from '../types';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUnits: 0,
    occupiedUnits: 0,
    totalRevenue: 0,
    overduePayments: 0,
    pendingMaintenance: 0,
    upcomingLeaseExpirations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [warehouses, payments, maintenance, leases] = await Promise.all([
        warehouseService.getAll(),
        paymentService.getOverdue(),
        maintenanceService.getAll({ status: 'submitted' }),
        leaseService.getAll({ status: 'active' }),
      ]);

      const occupiedCount = warehouses.filter((w) => w.status === 'occupied').length;

      // Calculate total revenue from paid payments
      const allPayments = await paymentService.getAll({ status: 'paid' });
      const revenue = allPayments.reduce((sum, p) => sum + p.amount_paid, 0);

      // Count upcoming lease expirations (next 60 days)
      const today = new Date();
      const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
      const upcomingExpirations = leases.filter((lease) => {
        const endDate = new Date(lease.end_date);
        return endDate >= today && endDate <= sixtyDaysFromNow;
      }).length;

      setStats({
        totalUnits: warehouses.length,
        occupiedUnits: occupiedCount,
        totalRevenue: revenue,
        overduePayments: payments.length,
        pendingMaintenance: maintenance.length,
        upcomingLeaseExpirations: upcomingExpirations,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Warehouse Units"
          value={stats.totalUnits}
          color="text-blue-600"
        />

        <StatCard
          title="Occupancy Rate"
          value={stats.totalUnits > 0 ? `${Math.round((stats.occupiedUnits / stats.totalUnits) * 100)}%` : '0%'}
          subtitle={`${stats.occupiedUnits} of ${stats.totalUnits} units occupied`}
          color="text-green-600"
        />

        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle="From completed payments"
          color="text-green-600"
        />

        <StatCard
          title="Overdue Payments"
          value={stats.overduePayments}
          color="text-red-600"
        />

        <StatCard
          title="Pending Maintenance"
          value={stats.pendingMaintenance}
          color="text-orange-600"
        />

        <StatCard
          title="Upcoming Lease Expirations"
          value={stats.upcomingLeaseExpirations}
          subtitle="Next 60 days"
          color="text-yellow-600"
        />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/warehouses"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition"
          >
            <h4 className="font-medium text-gray-900">Add Warehouse Unit</h4>
            <p className="text-sm text-gray-600 mt-1">Create a new warehouse listing</p>
          </a>

          <a
            href="/tenants"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition"
          >
            <h4 className="font-medium text-gray-900">Add Tenant</h4>
            <p className="text-sm text-gray-600 mt-1">Register a new tenant</p>
          </a>

          <a
            href="/payments"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition"
          >
            <h4 className="font-medium text-gray-900">Record Payment</h4>
            <p className="text-sm text-gray-600 mt-1">Log a rent payment</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
