'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN DEPOSIT MANAGEMENT
 * ==============================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownRight,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  ExternalLink,
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

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    method: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchDeposits();
  }, [pagination.page, filters]);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getDeposits({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
      });
      
      if (response.data) {
        const data = response.data.data || response.data;
        setDeposits(data.data || data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || data.length || 0,
          pages: data.pagination?.pages || 1,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    try {
      await adminAPI.approveDeposit(depositId);
      toast.success('Deposit approved successfully');
      fetchDeposits();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to approve deposit');
    }
  };

  const handleReject = async (depositId: string, reason: string) => {
    try {
      await adminAPI.rejectDeposit(depositId, { reason });
      toast.success('Deposit rejected');
      fetchDeposits();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to reject deposit');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
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

  // Build full URL for proofOfPayment if backend returns a relative path like "uploads/deposits/..."
  const getProofUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const base = apiBase.replace(/\/+$/, '');
    const cleanedPath = path.replace(/^\/+/, '');
    // We keep the full API base (including /api/v1) so files are served from
    // `${API_URL}/uploads/...` which matches the Nest globalPrefix + static prefix.
    return `${base}/${cleanedPath}`;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Deposit Management</h1>
          <p className="text-gray-400">Review and approve user deposits</p>
        </div>
      </motion.div>

      {/* Stats - computed from deposits */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-xl font-bold text-white">
                {deposits.filter(d => d.status === 'pending').length}
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
                {deposits.filter(d => d.status === 'approved' || d.status === 'completed').length}
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
                {deposits.filter(d => d.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <ArrowDownRight className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-xl font-bold text-green-400">
                ${deposits.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
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

      {/* Deposits Table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight size={20} className="text-green-500" />
              All Deposits
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deposits.length > 0 ? (
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
                  {deposits.map((deposit) => (
                    <tr key={deposit._id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="py-4 pr-4">
                        <span className="text-white font-mono text-sm">{deposit.depositRef}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-white">{deposit.userId?.firstName || 'User'} {deposit.userId?.lastName || ''}</p>
                        <p className="text-sm text-gray-500">{deposit.userId?.email || 'N/A'}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-white font-semibold">${(deposit.amount || 0).toLocaleString()}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-gray-400">{getMethodLabel(deposit.paymentMethod || deposit.method)}</span>
                      </td>
                      <td className="py-4 pr-4">{getStatusBadge(deposit.status)}</td>
                      <td className="py-4 pr-4 text-gray-400">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedDeposit(deposit); setShowModal(true); }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg"
                          >
                            <Eye size={18} />
                          </button>
                          {deposit.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(deposit._id)}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(deposit._id, 'Invalid transaction')}
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
              <ArrowDownRight size={48} className="mb-3 opacity-50" />
              <p className="text-sm">No deposits found</p>
              <p className="text-xs">Deposits will appear here as users make them</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Deposit Detail Modal */}
      <AnimatePresence>
        {showModal && selectedDeposit && (
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
                <h3 className="text-xl font-bold text-white">Deposit Details</h3>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Reference</span>
                  <span className="text-white font-mono">{selectedDeposit?.depositRef || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">User</span>
                  <span className="text-white">
                    {(selectedDeposit.userId?.firstName || selectedDeposit.user?.firstName || 'User')}{' '}
                    {(selectedDeposit.userId?.lastName || selectedDeposit.user?.lastName || '')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-bold">
                    ${typeof selectedDeposit?.amount === 'number' ? selectedDeposit.amount.toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Method</span>
                  <span className="text-white">{getMethodLabel(selectedDeposit?.method || selectedDeposit?.paymentMethod || '')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600">
                  <span className="text-gray-400">Status</span>
                  {getStatusBadge(selectedDeposit?.status || 'pending')}
                </div>
                {selectedDeposit?.walletAddress && (
                  <div className="py-2 border-b border-dark-600">
                    <span className="text-gray-400 block mb-1">Wallet Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm truncate">{selectedDeposit.walletAddress}</span>
                      <button onClick={() => copyToClipboard(selectedDeposit.walletAddress)} className="text-gray-400 hover:text-white">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}
                {selectedDeposit?.txHash && (
                  <div className="py-2 border-b border-dark-600">
                    <span className="text-gray-400 block mb-1">Transaction Hash</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm truncate">{selectedDeposit.txHash}</span>
                      <button className="text-gray-400 hover:text-white">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {selectedDeposit.proofOfPayment && (
                  <div className="py-2 border-b border-dark-600">
                    <span className="text-gray-400 block mb-2">Proof of Payment</span>
                    {selectedDeposit.userNote && (
                      <p className="text-xs text-gray-400 mb-2 break-words">
                        Note: {selectedDeposit.userNote}
                      </p>
                    )}
                    <div className="space-y-2">
                      {getProofUrl(selectedDeposit.proofOfPayment) && (
                        <>
                          <a
                            href={getProofUrl(selectedDeposit.proofOfPayment)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
                          >
                            <ExternalLink size={14} />
                            Open full image / file
                          </a>
                          <div className="mt-1 max-h-64 overflow-hidden rounded-xl border border-dark-600 bg-dark-900 flex items-center justify-center">
                            <img
                              src={getProofUrl(selectedDeposit.proofOfPayment)}
                              alt="Deposit proof"
                              className="max-h-64 w-full object-contain"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {selectedDeposit.status === 'pending' && (
                  <div className="flex gap-3 mt-6">
                    <Button
                      className="flex-1"
                      variant="danger"
                      onClick={() => handleReject(selectedDeposit._id, 'Invalid transaction')}
                    >
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(selectedDeposit._id)}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



