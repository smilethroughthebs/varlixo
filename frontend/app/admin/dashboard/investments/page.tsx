'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN INVESTMENTS PAGE
 * ==============================================
 * Admin panel for viewing and managing user investments
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, Filter, Eye, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import toast from 'react-hot-toast';
import api from '@/app/lib/api';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Admin investments page uses the shared API client, which already
// knows the base URL and attaches the auth token from cookies.

interface Investment {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  planId: {
    _id: string;
    name: string;
    dailyReturnRate: number;
  };
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  maturityDate: string;
  expectedTotalProfit: number;
  accumulatedProfit: number;
  investmentRef: string;
}

interface AdminRecurringPlan {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  planType: string;
  monthlyContribution: number;
  totalContributed: number;
  portfolioValue: number;
  monthsCompleted: number;
  monthsRequired: number;
  status: string;
  startDate?: string;
  nextPaymentDate?: string;
  maturityDate?: string;
  withdrawalRequested?: boolean;
  withdrawalApproved?: boolean;
}

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recurringPlans, setRecurringPlans] = useState<AdminRecurringPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  useEffect(() => {
    fetchInvestments();
  }, [filterStatus]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const [investmentsRes, recurringRes] = await Promise.all([
        api.get('/investments/admin/all', { params }),
        api.get('/investments/admin/recurring', { params }).catch(() => ({ data: { plans: [] } })),
      ]);

      setInvestments(investmentsRes.data.investments || []);
      setRecurringPlans(recurringRes.data.plans || recurringRes.data.data?.plans || []);
    } catch (error: any) {
      toast.error('Failed to fetch investments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markRecurringPaid = async (planId: string, defaultAmount?: number) => {
    const amountStr = window.prompt('Enter amount to mark as paid (USD)', String(defaultAmount ?? ''));
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }
    try {
      await api.post(`/investments/admin/recurring/${planId}/mark-paid`, { amount });
      toast.success('Marked as paid');
      fetchInvestments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark paid');
    }
  };

  const markRecurringMissed = async (planId: string) => {
    try {
      await api.post(`/investments/admin/recurring/${planId}/mark-missed`, { notifyUser: true });
      toast.success('Marked as missed');
      fetchInvestments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark missed');
    }
  };

  const updateRecurringPortfolio = async (planId: string, currentValue?: number) => {
    const valueStr = window.prompt('Enter portfolio value (USD)', String(currentValue ?? ''));
    if (!valueStr) return;
    const portfolioValue = parseFloat(valueStr);
    if (!Number.isFinite(portfolioValue) || portfolioValue < 0) {
      toast.error('Invalid portfolio value');
      return;
    }
    try {
      await api.post(`/investments/admin/recurring/${planId}/update-portfolio`, { portfolioValue });
      toast.success('Portfolio updated');
      fetchInvestments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update portfolio');
    }
  };

  const approveRecurringWithdrawal = async (planId: string) => {
    try {
      await api.post(`/investments/admin/recurring/${planId}/approve-withdrawal`, { approve: true });
      toast.success('Withdrawal approved');
      fetchInvestments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve withdrawal');
    }
  };

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch =
      inv.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.planId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.investmentRef?.includes(searchQuery);

    return matchesSearch;
  });

  const stats = {
    total: investments.length,
    active: investments.filter(i => i.status === 'active').length,
    pending: investments.filter(i => i.status === 'pending').length,
    completed: investments.filter(i => i.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <TrendingUp size={32} className="text-primary-500" />
          User Investments
        </h1>
        <p className="text-gray-400">Monitor and manage all user investments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Investments', value: stats.total, color: 'from-blue-500 to-blue-600' },
          { label: 'Active', value: stats.active, color: 'from-green-500 to-green-600' },
          { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600' },
          { label: 'Completed', value: stats.completed, color: 'from-purple-500 to-purple-600' },
        ].map((stat, index) => (
          <Card key={index} className="p-6">
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by email, name, plan, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Expected Profit
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Maturity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader className="animate-spin mx-auto text-primary-500" />
                  </td>
                </tr>
              ) : filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No investments found
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((investment) => (
                  <tr
                    key={investment._id}
                    className="border-b border-dark-700 hover:bg-dark-800/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {investment.userId?.firstName} {investment.userId?.lastName}
                        </p>
                        <p className="text-gray-500 text-sm">{investment.userId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {investment.planId?.name}
                      <p className="text-gray-500 text-sm">
                        {investment.planId?.dailyReturnRate}% daily
                      </p>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      ${investment.amount?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-green-400 font-medium">
                          ${investment.expectedTotalProfit?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Accumulated: ${investment.accumulatedProfit?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          investment.status
                        )}`}
                      >
                        {investment.status.charAt(0).toUpperCase() +
                          investment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(investment.maturityDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedInvestment(investment)}
                        className="text-primary-500 hover:text-primary-400 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recurring Investments Table */}
      <Card className="overflow-hidden">
        <div className="px-6 pt-4">
          <h2 className="text-lg font-semibold text-white mb-2">Recurring Investments</h2>
          <p className="text-sm text-gray-500 mb-4">All user recurring investment plans</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Plan Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Monthly</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Total Contributed</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Progress</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Dates</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader className="animate-spin mx-auto text-primary-500" />
                  </td>
                </tr>
              ) : recurringPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                    No recurring investments found
                  </td>
                </tr>
              ) : (
                recurringPlans.map((plan) => (
                  <tr key={plan._id} className="border-b border-dark-700 hover:bg-dark-800/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {(plan.userId?.firstName || '') + ' ' + (plan.userId?.lastName || '')}
                        </p>
                        <p className="text-gray-500 text-sm">{plan.userId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white text-sm capitalize">{plan.planType}</td>
                    <td className="px-6 py-4 text-white font-medium">
                      ${plan.monthlyContribution?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary-400 font-semibold">
                        ${plan.totalContributed?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Portfolio: ${plan.portfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {plan.monthsCompleted || 0} / {plan.monthsRequired || 0} months
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      <div>Start: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '—'}</div>
                      <div>Next: {plan.nextPaymentDate ? new Date(plan.nextPaymentDate).toLocaleDateString() : '—'}</div>
                      <div>End: {plan.maturityDate ? new Date(plan.maturityDate).toLocaleDateString() : '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markRecurringPaid(plan._id, plan.monthlyContribution)}
                        >
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markRecurringMissed(plan._id)}
                        >
                          Mark Missed
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateRecurringPortfolio(plan._id, plan.portfolioValue)}
                        >
                          Update Portfolio
                        </Button>
                        {plan.withdrawalRequested && !plan.withdrawalApproved && (
                          <Button
                            size="sm"
                            onClick={() => approveRecurringWithdrawal(plan._id)}
                          >
                            Approve Withdrawal
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal (Simple) */}
      {selectedInvestment && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedInvestment(null)}
        >
          <Card
            className="max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Investment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Reference:</span>
                <span className="text-white font-mono">{selectedInvestment.investmentRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User:</span>
                <span className="text-white">
                  {selectedInvestment.userId?.firstName}{' '}
                  {selectedInvestment.userId?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">
                  ${selectedInvestment.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Profit:</span>
                <span className="text-green-400 font-semibold">
                  ${selectedInvestment.expectedTotalProfit?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    selectedInvestment.status
                  )}`}
                >
                  {selectedInvestment.status}
                </span>
              </div>
            </div>
            <Button
              onClick={() => setSelectedInvestment(null)}
              className="w-full mt-6"
              variant="secondary"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
