'use client';

/**
 * ==============================================
 * VARLIXO - KYC VERIFICATION PAGE
 * ==============================================
 * Allows users to submit identity documents for verification
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Download,
  ZoomIn,
  Home,
  RefreshCw,
  User,
  Camera,
  CreditCard,
  AlertTriangle,
  Trash2,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { useAuthStore } from '@/app/lib/store';
import { kycAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Document types for KYC
const documentTypes = [
  {
    id: 'passport',
    name: 'Passport',
    icon: CreditCard,
    description: 'Valid government-issued passport',
  },
  {
    id: 'national_id',
    name: 'National ID',
    icon: User,
    description: 'Government-issued national identity card',
  },
  {
    id: 'drivers_license',
    name: "Driver's License",
    icon: CreditCard,
    description: 'Valid driver\'s license with photo',
  },
];

const addressTypes = [
  {
    id: 'utility_bill',
    name: 'Utility Bill',
    description: 'Recent utility bill (less than 3 months)',
  },
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    description: 'Recent bank statement (less than 3 months)',
  },
  {
    id: 'tax_document',
    name: 'Tax Document',
    description: 'Official tax document with your address',
  },
];

// KYC status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string; icon: any; text: string }> = {
    verified: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, text: 'Verified' },
    pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock, text: 'Pending Review' },
    rejected: { color: 'bg-red-500/20 text-red-400', icon: XCircle, text: 'Rejected' },
    not_submitted: { color: 'bg-gray-500/20 text-gray-400', icon: AlertTriangle, text: 'Not Submitted' },
  };

  const config = configs[status] || configs.not_submitted;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
      <Icon size={16} />
      {config.text}
    </span>
  );
};

// Document upload component
const DocumentUpload = ({
  type,
  title,
  description,
  existingDoc,
  onUpload,
  onRemove,
  isUploading,
}: {
  type: string;
  title: string;
  description: string;
  existingDoc?: any;
  onUpload: (file: File, type: string) => void;
  onRemove: (type: string) => void;
  isUploading: boolean;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onUpload(file, type);
    }
  }, [onUpload, type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading || existingDoc?.status === 'verified',
  });

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        {existingDoc && <StatusBadge status={existingDoc.status} />}
      </div>

      {existingDoc?.status === 'verified' ? (
        <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <CheckCircle className="text-green-500" size={24} />
          <div>
            <p className="text-green-400 font-medium">Document Verified</p>
            <p className="text-sm text-gray-400">
              Verified on {new Date(existingDoc.verifiedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : existingDoc?.status === 'pending' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Clock className="text-yellow-500" size={24} />
            <div className="flex-1">
              <p className="text-yellow-400 font-medium">Under Review</p>
              <p className="text-sm text-gray-400">
                Submitted on {new Date(existingDoc.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onRemove(type)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
          {/* Expected Verification Time */}
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-700/50 rounded-lg text-sm">
            <Clock size={14} className="text-gray-500" />
            <span className="text-gray-400">Expected verification: </span>
            <span className="text-white font-medium">24-48 hours</span>
          </div>
        </div>
      ) : existingDoc?.status === 'rejected' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <XCircle className="text-red-500" size={24} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Document Rejected</p>
              <p className="text-sm text-gray-400">{existingDoc.rejectionReason}</p>
            </div>
          </div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-700'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-gray-300 mb-1">Re-upload your document</p>
            <p className="text-sm text-gray-500">PNG, JPG or PDF (max 10MB)</p>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-700'
          }`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
              <p className="text-primary-400 text-sm">Click or drag to replace</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-300 mb-1">
                {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-gray-500">PNG, JPG or PDF (max 10MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function KYCPage() {
  const { user } = useAuthStore();
  const [kycStatus, setKycStatus] = useState({
    overall: 'not_submitted', // not_submitted, pending, verified, rejected
    identityDoc: null as any,
    addressDoc: null as any,
    selfie: null as any,
  });
  const [kycFormData, setKycFormData] = useState({
    documentType: 'passport',
    documentNumber: '',
    issuingCountry: 'US',
    fullNameOnDocument: '',
    dateOfBirthOnDocument: '',
    addressOnDocument: '',
  });
  const [addressDocType, setAddressDocType] = useState('utility_bill');
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<any>(null);

  useEffect(() => {
    // Fetch KYC status from API
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await kycAPI.getStatus();
      const data = response.data;
      
      console.log('=== KYC Status Debug ===');
      console.log('Full Response:', data);
      console.log('KYC Status from backend:', data.kycStatus);
      console.log('Success flag:', data.success);
      console.log('Documents found:', data.documents?.length || 0);
      
      if (data.success) {
        // Handle different KYC status values from backend
        let kycStatus = data.kycStatus;
        console.log('Original KYC Status:', kycStatus);
        
        if (kycStatus === 'approved' || kycStatus === 'verified') {
          kycStatus = 'verified';
        }
        
        console.log('Mapped KYC Status:', kycStatus);
        
        setKycStatus({
          overall: kycStatus || 'not_submitted',
          identityDoc: data.documents?.find((d: any) => d.documentType.includes('passport') || d.documentType.includes('national_id') || d.documentType.includes('drivers_license')) || null,
          addressDoc: data.documents?.find((d: any) => d.documentType.includes('utility') || d.documentType.includes('bank') || d.documentType.includes('tax')) || null,
          selfie: data.documents?.find((d: any) => d.documentType.includes('selfie')) || null,
        });
        
        console.log('Final KYC State Set:', {
          overall: kycStatus || 'not_submitted',
          hasDocuments: (data.documents?.length || 0) > 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
      // Fallback: refresh the entire page
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpload = async (file: File, documentType: string) => {
    setIsUploading(true);
    try {
      setUploadedFiles(prev => ({ ...prev, [documentType]: file }));
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (documentType: string) => {
    try {
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[documentType];
        return newFiles;
      });
      toast.success('Document removed');
    } catch (error) {
      toast.error('Failed to remove document');
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append('documentType', kycFormData.documentType);
      formData.append('issuingCountry', kycFormData.issuingCountry);
      formData.append('fullNameOnDocument', kycFormData.fullNameOnDocument || `${user?.firstName} ${user?.lastName}`);
      
      if (kycFormData.documentNumber) {
        formData.append('documentNumber', kycFormData.documentNumber);
      }
      
      if (kycFormData.dateOfBirthOnDocument) {
        formData.append('dateOfBirthOnDocument', kycFormData.dateOfBirthOnDocument);
      }
      
      if (kycFormData.addressOnDocument) {
        formData.append('addressOnDocument', kycFormData.addressOnDocument);
      }
      
      // Add uploaded files
      const frontFile = uploadedFiles[`${kycFormData.documentType}_front`];
      const backFile = uploadedFiles[`${kycFormData.documentType}_back`];
      const selfieFile = uploadedFiles['selfie'];
      
      if (!frontFile) {
        toast.error('Please upload the front side of your document');
        setIsUploading(false);
        return;
      }
      
      formData.append('frontImage', frontFile);
      
      if (backFile) {
        formData.append('backImage', backFile);
      }
      
      if (selfieFile) {
        formData.append('selfieImage', selfieFile);
      }
      
      const response = await kycAPI.submit(formData);
      
      if (response.data.success) {
        toast.success('KYC submitted for review');
        setKycStatus({ ...kycStatus, overall: 'pending' });
        fetchKYCStatus();
      }
    } catch (error: any) {
      console.error('KYC submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          KYC Verification
        </h1>
        <p className="text-gray-400">
          Complete your identity verification to unlock all platform features
        </p>
      </motion.div>

      {/* Overall Status */}
      <motion.div variants={fadeInUp}>
        <Card className={`${
          kycStatus.overall === 'verified'
            ? 'border-green-500/30 bg-green-500/5'
            : kycStatus.overall === 'pending'
            ? 'border-yellow-500/30 bg-yellow-500/5'
            : kycStatus.overall === 'rejected'
            ? 'border-red-500/30 bg-red-500/5'
            : ''
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                kycStatus.overall === 'verified'
                  ? 'bg-green-500/20'
                  : kycStatus.overall === 'pending'
                  ? 'bg-yellow-500/20'
                  : kycStatus.overall === 'rejected'
                  ? 'bg-red-500/20'
                  : 'bg-primary-500/20'
              }`}>
                <Shield size={32} className={
                  kycStatus.overall === 'verified'
                    ? 'text-green-500'
                    : kycStatus.overall === 'pending'
                    ? 'text-yellow-500'
                    : kycStatus.overall === 'rejected'
                    ? 'text-red-500'
                    : 'text-primary-500'
                } />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Verification Status</h3>
                  <button
                    onClick={fetchKYCStatus}
                    disabled={isRefreshing}
                    className="px-3 py-1 text-sm bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                <StatusBadge status={kycStatus.overall} />
              </div>
            </div>

            {kycStatus.overall === 'verified' && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={20} />
                <span className="font-medium">Full Access Enabled</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Benefits of Verification */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info size={20} className="text-primary-500" />
              Why Verify?
            </CardTitle>
          </CardHeader>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <h4 className="text-white font-medium mb-1">Higher Limits</h4>
              <p className="text-sm text-gray-400">Increase withdrawal limits up to $100,000/day</p>
            </div>
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center mb-3">
                <Shield className="text-primary-500" size={20} />
              </div>
              <h4 className="text-white font-medium mb-1">Enhanced Security</h4>
              <p className="text-sm text-gray-400">Protect your account with verified identity</p>
            </div>
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3">
                <CreditCard className="text-purple-500" size={20} />
              </div>
              <h4 className="text-white font-medium mb-1">Bank Transfers</h4>
              <p className="text-sm text-gray-400">Enable direct bank deposits and withdrawals</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'Identity Document' },
            { num: 2, label: 'Proof of Address' },
            { num: 3, label: 'Selfie Verification' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s.num
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-500'
                  }`}
                >
                  {kycStatus[
                    s.num === 1 ? 'identityDoc' : s.num === 2 ? 'addressDoc' : 'selfie'
                  ]?.status === 'verified' ? (
                    <CheckCircle size={20} />
                  ) : (
                    s.num
                  )}
                </div>
                <span className={`text-sm mt-2 ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`w-24 md:w-32 h-1 mx-2 rounded transition-all ${
                    step > s.num ? 'bg-primary-500' : 'bg-dark-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Identity Document</CardTitle>
              </CardHeader>

              {/* Document Type Selection */}
              <div className="mb-6">
                <p className="text-gray-400 mb-4">Select your document type:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {documentTypes.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setKycFormData(prev => ({ ...prev, documentType: doc.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        kycFormData.documentType === doc.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      <doc.icon
                        size={24}
                        className={kycFormData.documentType === doc.id ? 'text-primary-500' : 'text-gray-400'}
                      />
                      <h4 className="text-white font-medium mt-2">{doc.name}</h4>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Details Form */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={kycFormData.documentNumber}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="Enter document number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Issuing Country
                  </label>
                  <input
                    type="text"
                    value={kycFormData.issuingCountry}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, issuingCountry: e.target.value }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="US"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name on Document
                  </label>
                  <input
                    type="text"
                    value={kycFormData.fullNameOnDocument}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, fullNameOnDocument: e.target.value }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder={`${user?.firstName} ${user?.lastName}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Date of Birth on Document
                  </label>
                  <input
                    type="date"
                    value={kycFormData.dateOfBirthOnDocument}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, dateOfBirthOnDocument: e.target.value }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Front Side Upload */}
              <div className="space-y-6">
                <DocumentUpload
                  type={`${kycFormData.documentType}_front`}
                  title="Front Side"
                  description="Upload a clear photo of the front side of your document"
                  existingDoc={kycStatus.identityDoc?.front}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                  isUploading={isUploading}
                />

                {/* Back Side Upload */}
                <DocumentUpload
                  type={`${kycFormData.documentType}_back`}
                  title="Back Side"
                  description="Upload a clear photo of the back side of your document"
                  existingDoc={kycStatus.identityDoc?.back}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                  isUploading={isUploading}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)}>
                  Continue to Address Verification
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Proof of Address</CardTitle>
              </CardHeader>

              {/* Address Document Type Selection */}
              <div className="mb-6">
                <p className="text-gray-400 mb-4">Select your document type:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {addressTypes.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setAddressDocType(doc.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        addressDocType === doc.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      <Home
                        size={24}
                        className={addressDocType === doc.id ? 'text-primary-500' : 'text-gray-400'}
                      />
                      <h4 className="text-white font-medium mt-2">{doc.name}</h4>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <DocumentUpload
                type={addressDocType}
                title="Proof of Address Document"
                description="Upload a document showing your current address (issued within last 3 months)"
                existingDoc={kycStatus.addressDoc}
                onUpload={handleUpload}
                onRemove={handleRemove}
                isUploading={isUploading}
              />

              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue to Selfie Verification
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Selfie Verification</CardTitle>
              </CardHeader>

              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto bg-dark-700 rounded-full flex items-center justify-center mb-4 border-4 border-dashed border-dark-500">
                  <Camera size={48} className="text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">
                  Take a selfie while holding your ID document next to your face
                </p>
                <ul className="text-sm text-gray-500 space-y-2 max-w-md mx-auto text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    Make sure your face is clearly visible
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    Hold your ID document next to your face
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    Ensure good lighting and no shadows
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    All text on the document should be readable
                  </li>
                </ul>
              </div>

              <DocumentUpload
                type="selfie"
                title="Selfie with ID"
                description="Upload a photo of yourself holding your identity document"
                existingDoc={kycStatus.selfie}
                onUpload={handleUpload}
                onRemove={handleRemove}
                isUploading={isUploading}
              />

              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} isLoading={isUploading}>
                  Submit for Verification
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Section */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-dark-700/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="text-primary-500" size={20} />
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-gray-400 mb-4">
                If you're having trouble with the verification process or your documents were rejected,
                our support team is here to help.
              </p>
              <Button variant="ghost" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}



