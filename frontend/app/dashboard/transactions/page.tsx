'use client';

/**
 * ==============================================
 * VARLIXO - TRANSACTIONS PAGE
 * ==============================================
 * View and filter all transaction history
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Filter,
  Download,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Money from '@/app/components/ui/Money';
import { useAuthStore } from '@/app/lib/store';
import { walletAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Transaction type config
const transactionTypes = {
  deposit: { label: 'Deposit', icon: ArrowDownRight, color: 'text-green-500', bgColor: 'bg-green-500/20' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-red-500', bgColor: 'bg-red-500/20' },
  profit: { label: 'Profit', icon: TrendingUp, color: 'text-primary-500', bgColor: 'bg-primary-500/20' },
  referral_bonus: { label: 'Referral Bonus', icon: Wallet, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  investment: { label: 'Investment', icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
};

// Status config
const statusConfig = {
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  processing: { label: 'Processing', icon: RefreshCw, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

export default function TransactionsPage() {
  const { wallet } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await walletAPI.getTransactions({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      const apiPayload = response.data?.data ?? response.data;

      // Expected backend shape (after TransformInterceptor):
      // { success, message, data: { data: Transaction[], meta: {...} } }
      const items = Array.isArray(apiPayload?.data)
        ? apiPayload.data
        : Array.isArray(apiPayload)
          ? apiPayload
          : [];
      const meta = apiPayload?.meta || {};

      setTransactions(items);
      setPagination((prev) => ({
        ...prev,
        total: meta.total || 0,
        pages: meta.totalPages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportTransactions = () => {
    // Generate CSV
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Method', 'Description'];
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.type,
      tx.amount,
      tx.status,
      tx.paymentMethod,
      tx.description || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported');
  };

  const clearFilters = () => {
    setFilters({ type: '', status: '', startDate: '', endDate: '', search: '' });
  };

  const getTransactionConfig = (type: string) => {
    return transactionTypes[type as keyof typeof transactionTypes] || {
      label: type,
      icon: Wallet,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/20',
    };
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      icon: AlertCircle,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
    };
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-400">
            View and manage all your transactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={18} />}
          >
            Filters
          </Button>
          <Button
            variant="ghost"
            onClick={exportTransactions}
            leftIcon={<Download size={18} />}
          >
            Export
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <ArrowDownRight className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Deposits</p>
              <p className="text-lg font-bold text-white">
                <Money valueUsd={wallet?.totalDeposits || 0} className="text-lg font-bold text-white" />
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ArrowUpRight className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Withdrawals</p>
              <p className="text-lg font-bold text-white">
                <Money valueUsd={wallet?.totalWithdrawals || 0} className="text-lg font-bold text-white" />
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <TrendingUp className="text-primary-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Profits</p>
              <p className="text-lg font-bold text-green-400">
                +<Money valueUsd={wallet?.totalEarnings || 0} className="text-lg font-bold text-green-400" />
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Wallet className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Referral Earnings</p>
              <p className="text-lg font-bold text-white">
                <Money valueUsd={wallet?.referralEarnings || 0} className="text-lg font-bold text-white" />
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Filter Transactions</CardTitle>
              <button onClick={clearFilters} className="text-sm text-primary-400 hover:text-primary-300">
                Clear All
              </button>
            </CardHeader>

            <div className="grid md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  {Object.entries(transactionTypes).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Transactions List */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History size={20} className="text-primary-500" />
              All Transactions
            </CardTitle>
            <span className="text-sm text-gray-500">{pagination.total} transactions</span>
          </CardHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b border-dark-600">
                      <th className="pb-4 pr-4">Type</th>
                      <th className="pb-4 pr-4">Amount</th>
                      <th className="pb-4 pr-4">Status</th>
                      <th className="pb-4 pr-4">Method</th>
                      <th className="pb-4 pr-4">Date</th>
                      <th className="pb-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {transactions.map((tx) => {
                      const typeConfig = getTransactionConfig(tx.type);
                      const statusCfg = getStatusConfig(tx.status);
                      const TypeIcon = typeConfig.icon;
                      const StatusIcon = statusCfg.icon;

                      return (
                        <tr key={tx._id} className="hover:bg-dark-700/30 transition-colors">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center`}>
                                <TypeIcon className={typeConfig.color} size={20} />
                              </div>
                              <span className="text-white font-medium capitalize">
                                {typeConfig.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <span
                              className={`font-semibold ${
                                tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral'
                                  ? 'text-green-400'
                                  : 'text-white'
                              }`}
                            >
                              {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral' ? '+' : '-'}
                              <Money valueUsd={tx.amount} className="" />
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.color}`}>
                              <StatusIcon size={12} />
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-gray-400">
                            {tx.method}
                          </td>
                          <td className="py-4 pr-4 text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString()}
                            <span className="text-gray-600 text-sm block">
                              {new Date(tx.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500 text-sm">
                            {tx.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="md:hidden space-y-4">
                {transactions.map((tx) => {
                  const typeConfig = getTransactionConfig(tx.type);
                  const statusCfg = getStatusConfig(tx.status);
                  const TypeIcon = typeConfig.icon;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div
                      key={tx._id}
                      className="p-4 bg-dark-700/30 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center`}>
                            <TypeIcon className={typeConfig.color} size={20} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{typeConfig.label}</p>
                            <p className="text-xs text-gray-500">{tx.method}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral'
                                ? 'text-green-400'
                                : 'text-white'
                            }`}
                          >
                            {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral' ? '+' : '-'}
                            <Money valueUsd={tx.amount} className="" />
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusCfg.bgColor} ${statusCfg.color}`}>
                            <StatusIcon size={10} />
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{tx.description}</span>
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-dark-600">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-dark-600 text-gray-400 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPagination({ ...pagination, page })}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          pagination.page === page
                            ? 'bg-primary-500 text-white'
                            : 'border border-dark-600 text-gray-400 hover:bg-dark-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 rounded-lg border border-dark-600 text-gray-400 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <History size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No transactions found</p>
              <p className="text-sm text-gray-500">
                {Object.values(filters).some(Boolean)
                  ? 'Try adjusting your filters'
                  : 'Your transactions will appear here'}
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}



