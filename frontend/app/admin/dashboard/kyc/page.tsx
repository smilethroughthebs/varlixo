'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN KYC MANAGEMENT
 * ==============================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Download,
  ZoomIn,
  FileText,
  User,
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

export default function AdminKYCPage() {
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    documentType: '',
  });

  useEffect(() => {
    fetchKYCRequests();
  }, [filters, pagination.page]);

  const fetchKYCRequests = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getPendingKyc({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
      });
      
      if (response.data) {
        const data = response.data.data || response.data;
        setKycRequests(data.data || data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || data.length || 0,
          pages: data.pagination?.pages || 1,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch KYC requests:', error);
      setKycRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (kycId: string) => {
    try {
      await adminAPI.approveKyc(kycId);
      toast.success('KYC approved successfully');
      setShowModal(false);
      fetchKYCRequests();
    } catch (error) {
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await adminAPI.rejectKyc(kycId, { reason: rejectReason, adminNote: '' });
      toast.success('KYC rejected');
      setShowModal(false);
      setRejectReason('');
      fetchKYCRequests();
    } catch (error) {
      toast.error('Failed to reject KYC');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      verified: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
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

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      passport: 'Passport',
      national_id: 'National ID',
      drivers_license: "Driver's License",
    };
    return types[type] || type;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">KYC Verification</h1>
          <p className="text-gray-400">Review and verify user identity documents</p>
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
                {kycRequests.filter(k => k.status === 'pending').length}
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
              <p className="text-sm text-gray-400">Verified</p>
              <p className="text-xl font-bold text-white">
                {kycRequests.filter(k => k.status === 'verified' || k.status === 'approved').length}
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
                {kycRequests.filter(k => k.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Shield className="text-primary-500" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Requests</p>
              <p className="text-xl font-bold text-white">{kycRequests.length}</p>
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
                placeholder="Search by user name or email..."
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
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filters.documentType}
              onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
              className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Documents</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* KYC Requests List */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-primary-500" />
              KYC Requests
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : kycRequests.length > 0 ? (
            <div className="space-y-4">
              {kycRequests.map((kyc) => (
                <div
                  key={kyc._id}
                  className="p-4 bg-dark-700/30 rounded-xl border border-dark-600 hover:border-dark-500 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                        {(kyc.userId?.firstName || kyc.user?.firstName || 'U')[0]}{(kyc.userId?.lastName || kyc.user?.lastName || '')[0]}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{kyc.userId?.firstName || kyc.user?.firstName || 'User'} {kyc.userId?.lastName || kyc.user?.lastName || ''}</h4>
                        <p className="text-sm text-gray-500">{kyc.userId?.email || kyc.user?.email || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{getDocumentTypeLabel(kyc.documentType)}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(kyc.submittedAt || kyc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(kyc.status)}
                      <button
                        onClick={() => { setSelectedKYC(kyc); setShowModal(true); }}
                        className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Eye size={16} />
                        Review
                      </button>
                    </div>
                  </div>

                  {kyc.status === 'rejected' && kyc.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">
                        <strong>Rejection Reason:</strong> {kyc.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Shield size={48} className="mb-3 opacity-50" />
              <p className="text-sm">No KYC requests found</p>
              <p className="text-xs">KYC requests will appear here as users submit them</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* KYC Review Modal */}
      <AnimatePresence>
        {showModal && selectedKYC && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-dark-800 rounded-2xl p-6 border border-dark-600 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">KYC Review</h3>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-dark-700 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                  {(selectedKYC.userId?.firstName || selectedKYC.user?.firstName || 'U')[0]}{(selectedKYC.userId?.lastName || selectedKYC.user?.lastName || '')[0]}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{selectedKYC.userId?.firstName || selectedKYC.user?.firstName || 'User'} {selectedKYC.userId?.lastName || selectedKYC.user?.lastName || ''}</h4>
                  <p className="text-gray-400">{selectedKYC.userId?.email || selectedKYC.user?.email || 'N/A'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">{getDocumentTypeLabel(selectedKYC.documentType)}</span>
                    {getStatusBadge(selectedKYC.status)}
                  </div>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Front Document */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Front Side</label>
                  <div
                    className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setViewingImage(selectedKYC.frontImage)}
                  >
                    <img
                      src={selectedKYC.frontImage}
                      alt="Document Front"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="text-white" size={32} />
                    </div>
                  </div>
                </div>

                {/* Back Document */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Back Side</label>
                  <div
                    className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setViewingImage(selectedKYC.backImage)}
                  >
                    <img
                      src={selectedKYC.backImage}
                      alt="Document Back"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="text-white" size={32} />
                    </div>
                  </div>
                </div>

                {/* Selfie */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Selfie with Document</label>
                  <div
                    className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setViewingImage(selectedKYC.selfieImage)}
                  >
                    <img
                      src={selectedKYC.selfieImage}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="text-white" size={32} />
                    </div>
                  </div>
                </div>

                {/* Address Document */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Proof of Address</label>
                  {selectedKYC.addressDocument ? (
                    <div
                      className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setViewingImage(selectedKYC.addressDocument)}
                    >
                      <img
                        src={selectedKYC.addressDocument}
                        alt="Address Proof"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="text-white" size={32} />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-dark-700 rounded-xl flex items-center justify-center">
                      <p className="text-gray-500">Not provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedKYC.status === 'pending' && (
                <div className="space-y-4">
                  <div>
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
                      onClick={() => handleReject(selectedKYC._id)}
                    >
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(selectedKYC._id)}
                    >
                      Approve & Verify
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
            onClick={() => setViewingImage(null)}
          >
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
            <img
              src={viewingImage}
              alt="Document"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



