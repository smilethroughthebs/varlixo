'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN WITHDRAWAL MANAGEMENT
 * ==============================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { adminAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    method: '',
  });

  useEffect(() => {
    fetchWithdrawals();
  }, [filters, pagination.page]);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getWithdrawals({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
      });
      
      if (response.data) {
        const data = response.data.data || response.data;
        setWithdrawals(data.data || data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || data.length || 0,
          pages: data.pagination?.pages || 1,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    try {
      await adminAPI.approveWithdrawal(withdrawalId);
      toast.success('Withdrawal approved and processed');
      setShowModal(false);
      fetchWithdrawals();
    } catch (error) {
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleReject = async (withdrawalId: string) => {
    if (!rejectReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await adminAPI.rejectWithdrawal(withdrawalId, { reason: rejectReason });
      toast.success('Withdrawal rejected');
      setShowModal(false);
      setRejectReason('');
      fetchWithdrawals();
    } catch (error) {
      toast.error('Failed to reject withdrawal');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      processing: { color: 'bg-blue-500/20 text-blue-400', icon: Clock },
      approved: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      rejected: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      bitcoin: 'Bitcoin',
      ethereum: 'Ethereum',
      usdt: 'USDT',
      bank_transfer: 'Bank Transfer',
    };
    return methods[method] || method;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Withdrawal Management</h1>
          <p className="text-gray-400">Review and process user withdrawals</p>
        </div>
      </motion.div>

      {/* Stats - computed from actual data */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-xl font-bold text-white">
                {withdrawals.filter(w => w.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-xl font-bold text-white">
                {withdrawals.filter(w => w.status === 'approved' || w.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Rejected</p>
              <p className="text-xl font-bold text-white">
                {withdrawals.filter(w => w.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ArrowUpRight className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-xl font-bold text-red-400">
                ${withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp}>
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by reference or user..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Methods</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="ethereum">Ethereum</option>
              <option value="usdt">USDT</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Withdrawals Table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight size={20} className="text-red-500" />
              All Withdrawals
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : withdrawals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b border-dark-600">
                    <th className="pb-4 pr-4">Reference</th>
                    <th className="pb-4 pr-4">User</th>
                    <th className="pb-4 pr-4">Amount</th>
                    <th className="pb-4 pr-4">Method</th>
                    <th className="pb-4 pr-4">Status</th>
                    <th className="pb-4 pr-4">Date</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="py-4 pr-4">
                        <span className="text-white font-mono text-sm">{withdrawal.withdrawalRef}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-white">{withdrawal.userId?.firstName || 'User'} {withdrawal.userId?.lastName || ''}</p>
                            <p className="text-sm text-gray-500">{withdrawal.userId?.email || 'N/A'}</p>
                          </div>
                          {withdrawal.userId?.kycStatus !== 'approved' && (
                            <span title="KYC not verified">
                              <AlertTriangle className="text-yellow-500" size={16} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-white font-semibold">${(withdrawal.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Fee: ${withdrawal.fee || 0}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-gray-400">{getMethodLabel(withdrawal.paymentMethod || withdrawal.method)}</span>
                      </td>
                      <td className="py-4 pr-4">{getStatusBadge(withdrawal.status)}</td>
                      <td className="py-4 pr-4 text-gray-400">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedWithdrawal(withdrawal); setShowModal(true); }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg"
                          >
                            <Eye size={18} />
                          </button>
                          {withdrawal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(withdrawal._id)}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => { setSelectedWithdrawal(withdrawal); setShowModal(true); }}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ArrowUpRight size={48} className="mb-3 opacity-50" />
              <p className="text-sm">No withdrawals found</p>
              <p className="text-xs">Withdrawals will appear here as users request them</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Withdrawal Detail Modal */}
      <AnimatePresence>
        {showModal && selectedWithdrawal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-dark-800 rounded-2xl p-6 border border-dark-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Withdrawal Details</h3>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* KYC Warning */}
              {(selectedWithdrawal.userId?.kycStatus || selectedWithdrawal.user?.kycStatus) !== 'verified' && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4 flex items-center gap-3">
                  <AlertTriangle className="text-yellow-500" size={24} />
                  <div>
                    <p className="text-yellow-400 font-medium">KYC Not Verified</p>
                    <p className="text-sm text-gray-400">This user's identity has not been verified</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Reference</span>
                  <span className="text-white font-mono">{selectedWithdrawal.withdrawalRef}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">User</span>
                  <span className="text-white">
                    {(selectedWithdrawal.userId?.firstName || selectedWithdrawal.user?.firstName || 'User')}{' '}
                    {(selectedWithdrawal.userId?.lastName || selectedWithdrawal.user?.lastName || '')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Gross Amount</span>
                  <span className="text-white">${selectedWithdrawal.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Fee</span>
                  <span className="text-red-400">-${selectedWithdrawal.fee}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Net Amount</span>
                  <span className="text-white font-bold">${selectedWithdrawal.netAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Method</span>
                  <span className="text-white">{getMethodLabel(selectedWithdrawal.method)}</span>
                </div>
                {selectedWithdrawal.walletAddress && (
                  <div className="py-2 border-b border-dark-600">
                    <span className="text-gray-400 block mb-1">Wallet Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm truncate">{selectedWithdrawal.walletAddress}</span>
                      <button onClick={() => copyToClipboard(selectedWithdrawal.walletAddress)} className="text-gray-400 hover:text-white">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}
                {selectedWithdrawal.bankName && (
                  <>
                    <div className="flex justify-between py-2 border-b border-dark-600">
                      <span className="text-gray-400">Bank</span>
                      <span className="text-white">{selectedWithdrawal.bankName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dark-600">
                      <span className="text-gray-400">Account</span>
                      <span className="text-white font-mono">{selectedWithdrawal.accountNumber}</span>
                    </div>
                  </>
                )}

                {selectedWithdrawal.status === 'pending' && (
                  <>
                    <div className="pt-4">
                      <label className="block text-sm text-gray-400 mb-2">Rejection Reason (if rejecting)</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        variant="danger"
                        onClick={() => handleReject(selectedWithdrawal._id)}
                      >
                        Reject
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleApprove(selectedWithdrawal._id)}
                      >
                        Approve & Process
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



