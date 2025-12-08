'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { cryptoDepositAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AdminCryptoDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [amountUsd, setAmountUsd] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, [statusFilter]);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const res = await cryptoDepositAPI.adminList({ status: statusFilter || undefined });
      const payload = res.data.data || res.data;
      setDeposits(payload.data || []);
    } catch (error) {
      toast.error('Failed to load crypto deposits');
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmModal = (deposit: any) => {
    setSelectedDeposit(deposit);
    setAmountUsd(deposit.amountUsd ? String(deposit.amountUsd) : '');
    setTxHash(deposit.txHash || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async (status: 'confirmed' | 'rejected') => {
    if (!selectedDeposit) return;

    if (status === 'confirmed' && (!amountUsd || Number(amountUsd) <= 0)) {
      toast.error('Enter a valid USD amount to credit');
      return;
    }

    setIsSubmitting(true);
    try {
      await cryptoDepositAPI.adminUpdateStatus(selectedDeposit._id, {
        status,
        amountUsd: status === 'confirmed' ? Number(amountUsd) : undefined,
        txHash: txHash || undefined,
      });
      toast.success(`Crypto deposit ${status}`);
      setShowModal(false);
      setSelectedDeposit(null);
      fetchDeposits();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400' },
      confirmed: { label: 'Confirmed', className: 'bg-green-500/20 text-green-400' },
      rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400' },
    };
    const cfg = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${cfg.className}`}>
        {status === 'pending' && <Clock size={12} />}
        {status === 'confirmed' && <CheckCircle size={12} />}
        {status === 'rejected' && <XCircle size={12} />}
        {cfg.label}
      </span>
    );
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Crypto Deposit Management</h1>
          <p className="text-gray-400">Review and confirm on-chain crypto deposits</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp}>
        <Card>
          <div className="flex flex-wrap gap-2">
            {['', 'pending', 'confirmed', 'rejected'].map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                  statusFilter === s
                    ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                    : 'bg-dark-800 border-dark-600 text-gray-400 hover:border-dark-500'
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight size={20} className="text-green-500" />
              Crypto Deposits
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ArrowDownRight size={48} className="mb-3 opacity-50" />
              <p className="text-sm">No crypto deposits found</p>
              <p className="text-xs">Deposits will appear here as users create them</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b border-dark-600">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Currency</th>
                    <th className="pb-3 pr-4">Crypto Amount</th>
                    <th className="pb-3 pr-4">USD Amount</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Created</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {deposits.map((dep) => (
                    <tr key={dep._id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-white text-sm">
                          {dep.userId?.firstName || 'User'} {dep.userId?.lastName || ''}
                        </p>
                        <p className="text-xs text-gray-500">{dep.userId?.email || 'N/A'}</p>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-300">{dep.currency}</td>
                      <td className="py-3 pr-4 text-sm text-white">{dep.amountCrypto}</td>
                      <td className="py-3 pr-4 text-sm text-white">
                        {typeof dep.amountUsd === 'number' ? `$${dep.amountUsd.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 pr-4">{getStatusBadge(dep.status)}</td>
                      <td className="py-3 pr-4 text-xs text-gray-400">
                        {dep.createdAt ? new Date(dep.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {dep.status === 'pending' && (
                            <>
                              <Button size="sm" variant="secondary" onClick={() => openConfirmModal(dep)}>
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setSelectedDeposit(dep);
                                  setAmountUsd('');
                                  setTxHash('');
                                  handleUpdateStatus('rejected');
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Confirm Modal */}
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
              className="w-full max-w-md bg-dark-800 rounded-2xl p-6 border border-dark-600"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Confirm Crypto Deposit</h3>
              <p className="text-sm text-gray-400 mb-4">
                User: {selectedDeposit.userId?.firstName || 'User'} {selectedDeposit.userId?.lastName || ''} •
                Currency: {selectedDeposit.currency} • Crypto Amount: {selectedDeposit.amountCrypto}
              </p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">USD Amount to Credit</label>
                  <input
                    type="number"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm"
                    placeholder="e.g. 100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Transaction Hash (optional)</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm"
                    placeholder="Paste on-chain tx hash"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDeposit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  onClick={() => handleUpdateStatus('confirmed')}
                >
                  Confirm & Credit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
