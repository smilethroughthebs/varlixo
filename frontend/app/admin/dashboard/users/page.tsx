'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN USER MANAGEMENT
 * ==============================================
 * Full user management with balance control
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  DollarSign,
  TrendingUp,
  Plus,
  Minus,
  Wallet,
  AlertTriangle,
  RefreshCw,
  Trash2,
  UserCheck,
  Send,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import toast from 'react-hot-toast';
import { adminAPI } from '@/app/lib/api';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    kycStatus: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Filter out empty string values to avoid validation errors
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await adminAPI.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...cleanFilters,
      });
      
      if (response.data.data) {
        setUsers(response.data.data.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0,
          pages: response.data.data.pagination?.pages || 1,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Use empty array for demonstration
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleBalanceAdjust = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await adminAPI.adjustUserBalance(selectedUser._id, {
        amount: parseFloat(balanceAmount),
        type: balanceAction,
        note: balanceNote,
      });
      
      toast.success(`$${balanceAmount} ${balanceAction === 'add' ? 'added to' : 'subtracted from'} user balance`);
      setShowBalanceModal(false);
      setBalanceAmount('');
      setBalanceNote('');
      fetchUsers();
      
      // Update selected user
      const newBalance = balanceAction === 'add' 
        ? selectedUser.mainBalance + parseFloat(balanceAmount)
        : selectedUser.mainBalance - parseFloat(balanceAmount);
      setSelectedUser({ ...selectedUser, mainBalance: Math.max(0, newBalance) });
    } catch (error) {
      toast.error('Failed to adjust balance');
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      toast.error('Please fill in subject and message');
      return;
    }

    try {
      await adminAPI.sendUserEmail(selectedUser._id, {
        subject: emailSubject,
        body: emailBody,
      });
      
      toast.success('Email sent successfully');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const handleVerifyKyc = async (userId: string) => {
    try {
      await adminAPI.verifyUserKyc(userId);
      toast.success('KYC verified successfully');
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, kycStatus: 'verified' });
      }
    } catch (error) {
      toast.error('Failed to verify KYC');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      active: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      suspended: { color: 'bg-red-500/20 text-red-400', icon: Ban },
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getKycBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      verified: { color: 'bg-green-500/20 text-green-400', icon: Shield },
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      rejected: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
      not_submitted: { color: 'bg-gray-500/20 text-gray-400', icon: Shield },
    };
    const config = configs[status] || configs.not_submitted;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage all registered users, balances, and accounts</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={fetchUsers} leftIcon={<RefreshCw size={18} />}>
            Refresh
          </Button>
          <Button variant="secondary" leftIcon={<Download size={18} />}>
            Export Users
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Users className="text-primary-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-xl font-bold text-white">{pagination.total || users.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Shield className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending KYC</p>
              <p className="text-xl font-bold text-yellow-400">{users.filter(u => u.kycStatus === 'pending').length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Ban className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Suspended</p>
              <p className="text-xl font-bold text-red-400">{users.filter(u => u.status === 'suspended').length}</p>
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
                placeholder="Search by name, email, or referral code..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filters.kycStatus}
              onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value })}
              className="px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All KYC</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="not_submitted">Not Submitted</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary-500" />
              All Users
            </CardTitle>
            <span className="text-sm text-gray-500">{pagination.total || users.length} total users</span>
          </CardHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b border-dark-600">
                      <th className="pb-4 pr-4">User</th>
                      <th className="pb-4 pr-4">Status</th>
                      <th className="pb-4 pr-4">KYC</th>
                      <th className="pb-4 pr-4">Balance</th>
                      <th className="pb-4 pr-4">Referral Code</th>
                      <th className="pb-4 pr-4">Joined</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                              {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">{getStatusBadge(user.status)}</td>
                        <td className="py-4 pr-4">{getKycBadge(user.kycStatus)}</td>
                        <td className="py-4 pr-4">
                          <p className="text-white font-semibold">${(user.mainBalance || 0).toLocaleString()}</p>
                          <p className="text-xs text-green-400">+${(user.totalEarnings || 0).toLocaleString()}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <code className="px-2 py-1 bg-dark-700 rounded text-primary-400 text-sm">
                            {user.referralCode || 'N/A'}
                          </code>
                        </td>
                        <td className="py-4 pr-4 text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => { setSelectedUser(user); setShowBalanceModal(true); }}
                              className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                              title="Adjust Balance"
                            >
                              <DollarSign size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'suspended' : 'active')}
                              className={`p-2 rounded-lg transition-colors ${
                                user.status === 'active' 
                                  ? 'text-red-400 hover:bg-red-500/10' 
                                  : 'text-green-400 hover:bg-green-500/10'
                              }`}
                              title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                            >
                              {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <Users size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No users found</p>
              <p className="text-sm text-gray-500 mt-1">Users will appear here once they register</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-dark-800 rounded-2xl border border-dark-600 max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-700">
                <h3 className="text-xl font-bold text-white">User Details</h3>
                <button onClick={() => setShowUserModal(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-700">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.firstName?.[0] || 'U'}{selectedUser.lastName?.[0] || ''}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    <p className="text-gray-400">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(selectedUser.status)}
                      {getKycBadge(selectedUser.kycStatus)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-sm text-gray-400 mb-1">Balance</p>
                    <p className="text-xl font-bold text-white">${(selectedUser.mainBalance || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-sm text-gray-400 mb-1">Total Deposits</p>
                    <p className="text-xl font-bold text-green-400">${(selectedUser.totalDeposits || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-sm text-gray-400 mb-1">Withdrawals</p>
                    <p className="text-xl font-bold text-red-400">${(selectedUser.totalWithdrawals || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-600">
                    <p className="text-sm text-gray-400 mb-1">Earnings</p>
                    <p className="text-xl font-bold text-primary-400">${(selectedUser.totalEarnings || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 p-4 bg-dark-700/30 rounded-xl">
                  <div className="flex justify-between py-2 border-b border-dark-600">
                    <span className="text-gray-400">User ID</span>
                    <code className="text-white text-sm">{selectedUser._id}</code>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-600">
                    <span className="text-gray-400">Referral Code</span>
                    <code className="px-2 py-1 bg-primary-500/20 rounded text-primary-400">{selectedUser.referralCode || 'N/A'}</code>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-600">
                    <span className="text-gray-400">Referrals</span>
                    <span className="text-white">{selectedUser.referrals || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-600">
                    <span className="text-gray-400">Phone</span>
                    <span className="text-white">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-600">
                    <span className="text-gray-400">2FA Enabled</span>
                    <span className={selectedUser.twoFactorEnabled ? 'text-green-400' : 'text-gray-500'}>
                      {selectedUser.twoFactorEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-600">
                    <span className="text-gray-400">Joined</span>
                    <span className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Last Login</span>
                    <span className="text-white">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<DollarSign size={16} />}
                    onClick={() => { setShowBalanceModal(true); setShowUserModal(false); }}
                  >
                    Adjust Balance
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Mail size={16} />}
                    onClick={() => { setShowEmailModal(true); setShowUserModal(false); }}
                  >
                    Send Email
                  </Button>
                  {selectedUser.kycStatus === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<UserCheck size={16} />}
                      onClick={() => handleVerifyKyc(selectedUser._id)}
                    >
                      Verify KYC
                    </Button>
                  )}
                  <Button
                    variant={selectedUser.status === 'active' ? 'danger' : 'primary'}
                    size="sm"
                    leftIcon={selectedUser.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                    onClick={() => handleStatusChange(selectedUser._id, selectedUser.status === 'active' ? 'suspended' : 'active')}
                  >
                    {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Adjustment Modal */}
      <AnimatePresence>
        {showBalanceModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBalanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-dark-800 rounded-2xl p-6 border border-dark-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Adjust Balance</h3>
                <button onClick={() => setShowBalanceModal(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-gray-400">Current Balance: <span className="text-primary-400 font-semibold">${(selectedUser.mainBalance || 0).toLocaleString()}</span></p>
                  </div>
                </div>

                {/* Action Toggle */}
                <div className="flex gap-2 p-1 bg-dark-700 rounded-xl">
                  <button
                    onClick={() => setBalanceAction('add')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                      balanceAction === 'add' ? 'bg-green-500 text-white' : 'text-gray-400'
                    }`}
                  >
                    <Plus size={18} />
                    Add Funds
                  </button>
                  <button
                    onClick={() => setBalanceAction('subtract')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                      balanceAction === 'subtract' ? 'bg-red-500 text-white' : 'text-gray-400'
                    }`}
                  >
                    <Minus size={18} />
                    Subtract
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white text-xl font-semibold placeholder-gray-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 250, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBalanceAmount(amt.toString())}
                      className="px-4 py-2 rounded-lg bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white text-sm transition-colors"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Note (optional)</label>
                  <input
                    type="text"
                    placeholder="Reason for adjustment..."
                    value={balanceNote}
                    onChange={(e) => setBalanceNote(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Preview */}
                {balanceAmount && (
                  <div className={`p-4 rounded-xl border ${balanceAction === 'add' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <p className={`text-sm ${balanceAction === 'add' ? 'text-green-400' : 'text-red-400'}`}>
                      New Balance: ${(
                        balanceAction === 'add'
                          ? (selectedUser.mainBalance || 0) + parseFloat(balanceAmount || '0')
                          : Math.max(0, (selectedUser.mainBalance || 0) - parseFloat(balanceAmount || '0'))
                      ).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowBalanceModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className={`flex-1 ${balanceAction === 'subtract' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    onClick={handleBalanceAdjust}
                  >
                    {balanceAction === 'add' ? 'Add Balance' : 'Subtract Balance'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-dark-800 rounded-2xl p-6 border border-dark-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Send Email</h3>
                <button onClick={() => setShowEmailModal(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-xl">
                  <Mail className="text-gray-400" size={18} />
                  <span className="text-gray-400">To:</span>
                  <span className="text-white">{selectedUser.email}</span>
                </div>

                <Input
                  label="Subject"
                  placeholder="Email subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea
                    placeholder="Write your message..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowEmailModal(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" leftIcon={<Send size={18} />} onClick={handleSendEmail}>
                    Send Email
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
