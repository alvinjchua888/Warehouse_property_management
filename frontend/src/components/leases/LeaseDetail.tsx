import { useState, useEffect } from 'react';
import { Lease, Payment } from '../../types';
import { paymentService } from '../../services';
import { Badge, Button } from '../ui';
import { toast } from 'react-toastify';

interface LeaseDetailProps {
  lease: Lease;
  onTerminate?: () => void;
}

const LeaseDetail: React.FC<LeaseDetailProps> = ({ lease, onTerminate }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [lease.id]);

  const loadPayments = async () => {
    try {
      const data = await paymentService.getAll({ lease_id: lease.id });
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
      active: 'success',
      expired: 'warning',
      terminated: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      partial: 'warning',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const calculateTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0);
  };

  const calculateTotalDue = () => {
    return payments.reduce((sum, payment) => sum + payment.amount_due, 0);
  };

  const daysUntilExpiration = () => {
    const today = new Date();
    const endDate = new Date(lease.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = daysUntilExpiration();
  const showExpirationWarning = daysRemaining > 0 && daysRemaining <= 60;

  return (
    <div className="space-y-6">
      {/* Lease Information */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Lease Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="mt-1">{getStatusBadge(lease.status)}</div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Frequency</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{lease.payment_frequency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(lease.start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(lease.end_date)}</p>
          </div>
        </div>

        {showExpirationWarning && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ This lease expires in {daysRemaining} days
            </p>
          </div>
        )}
      </div>

      {/* Financial Details */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Financial Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Rental Amount</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(lease.rental_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Security Deposit</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(lease.security_deposit)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Late Fee</p>
            <p className="text-sm font-medium text-gray-900">{lease.late_fee_percentage}% per month</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Grace Period</p>
            <p className="text-sm font-medium text-gray-900">{lease.grace_period_days} days</p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {lease.terms_and_conditions && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Terms and Conditions</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{lease.terms_and_conditions}</p>
        </div>
      )}

      {/* Notes */}
      {lease.notes && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{lease.notes}</p>
        </div>
      )}

      {/* Payment Summary */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Summary</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-xs text-green-600 mb-1">Total Paid</p>
            <p className="text-lg font-semibold text-green-900">{formatCurrency(calculateTotalPaid())}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-600 mb-1">Total Due</p>
            <p className="text-lg font-semibold text-blue-900">{formatCurrency(calculateTotalDue())}</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Payment History ({payments.length})
        </h4>
        {loading ? (
          <p className="text-sm text-gray-500">Loading payment history...</p>
        ) : payments.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Due: {formatDate(payment.due_date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(payment.amount_paid || 0)} of {formatCurrency(payment.amount_due)}
                  </p>
                  {payment.payment_date && (
                    <p className="text-xs text-gray-500">
                      Paid: {formatDate(payment.payment_date)}
                    </p>
                  )}
                </div>
                <div className="ml-3">
                  {getPaymentStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No payment records found</p>
        )}
      </div>

      {/* Actions */}
      {lease.status === 'active' && onTerminate && (
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="danger"
            onClick={onTerminate}
          >
            Terminate Lease
          </Button>
        </div>
      )}

      {/* Created Date */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Created on {formatDate(lease.created_at)}
        </p>
      </div>
    </div>
  );
};

export default LeaseDetail;
