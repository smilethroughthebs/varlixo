'use client';

/**
 * ==============================================
 * VARLIXO - WALLET PAGE
 * ==============================================
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  QrCode,
  Building2,
  Bitcoin,
  Clock,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useAuthStore } from '@/app/lib/store';
import { walletAPI } from '@/app/lib/api';

const paymentMethods = [
  { id: 'crypto_btc', name: 'Bitcoin', icon: '₿', color: 'orange' },
  { id: 'crypto_eth', name: 'Ethereum', icon: 'Ξ', color: 'purple' },
  { id: 'crypto_usdt', name: 'USDT', icon: '₮', color: 'green' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', color: 'blue' },
];

export default function WalletPage() {
  const searchParams = useSearchParams();
  const { wallet } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [depositInstructions, setDepositInstructions] = useState<any>(null);
  const [currentDepositId, setCurrentDepositId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Withdrawal form
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    paymentMethod: '',
    walletAddress: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'deposit' || action === 'withdraw') {
      setActiveTab(action);
      setShowModal(true);
    }
    fetchTransactions();
  }, [searchParams]);

  const fetchTransactions = async () => {
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        walletAPI.getDeposits({ limit: 10 }),
        walletAPI.getWithdrawals({ limit: 10 }),
      ]);
      setDeposits(depositsRes.data.data.data || []);
      setWithdrawals(withdrawalsRes.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleUploadProof = async () => {
    if (!currentDepositId) {
      toast.error('No deposit found to attach proof to');
      return;
    }
    if (!proofFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('depositId', currentDepositId);
    formData.append('file', proofFile);
    if (referenceNumber) {
      formData.append('referenceNumber', referenceNumber);
    }

    setIsUploadingProof(true);
    try {
      await walletAPI.uploadDepositProof(formData);
      toast.success('Proof uploaded successfully. Your deposit is being processed.');
      setShowModal(false);
      setDepositInstructions(null);
      setCurrentDepositId(null);
      setProofFile(null);
      setReferenceNumber('');
      fetchTransactions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload proof');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !selectedMethod) {
      toast.error('Please enter amount and select payment method');
      return;
    }

    setIsLoading(true);
    try {
      const response = await walletAPI.createDeposit({
        amount: parseFloat(amount),
        paymentMethod: selectedMethod,
      });

      const payload = response.data.data || response.data;
      setDepositInstructions(payload);
      setCurrentDepositId(payload?.deposit?.id || payload?.deposit?._id || null);
      setProofFile(null);
      setReferenceNumber('');
      toast.success('Deposit request created!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create deposit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalData.amount || !withdrawalData.paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await walletAPI.createWithdrawal({
        amount: parseFloat(withdrawalData.amount),
        paymentMethod: withdrawalData.paymentMethod,
        walletAddress: withdrawalData.walletAddress,
        bankName: withdrawalData.bankName,
        accountNumber: withdrawalData.accountNumber,
        accountName: withdrawalData.accountName,
      });

      toast.success('Withdrawal request submitted!');
      setShowModal(false);
      setWithdrawalData({
        amount: '',
        paymentMethod: '',
        walletAddress: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
      });
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast.success('Address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      processing: 'bg-blue-500/20 text-blue-500',
      completed: 'bg-green-500/20 text-green-500',
      failed: 'bg-red-500/20 text-red-500',
      rejected: 'bg-red-500/20 text-red-500',
      cancelled: 'bg-gray-500/20 text-gray-500',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-gray-400">Manage your funds, deposits, and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center">
              <Wallet className="text-primary-500" size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available Balance</p>
              <p className="text-3xl font-bold text-white">
                ${(wallet?.mainBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="text-yellow-500" size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-3xl font-bold text-white">
                ${(wallet?.pendingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold text-white">
                ${(wallet?.totalEarnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          size="lg"
          leftIcon={<ArrowDownLeft size={20} />}
          onClick={() => {
            setActiveTab('deposit');
            setShowModal(true);
            setDepositInstructions(null);
            setSelectedMethod(null);
            setAmount('');
          }}
        >
          Deposit
        </Button>
        <Button
          variant="secondary"
          size="lg"
          leftIcon={<ArrowUpRight size={20} />}
          onClick={() => {
            setActiveTab('withdraw');
            setShowModal(true);
          }}
        >
          Withdraw
        </Button>
      </div>

      {/* Transaction History */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Deposits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          
          {deposits.length > 0 ? (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div
                  key={deposit._id}
                  className="flex items-center justify-between p-4 bg-dark-800 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <ArrowDownLeft className="text-green-500" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">${deposit.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(deposit.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No deposits yet</p>
            </div>
          )}
        </Card>

        {/* Withdrawals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
          </CardHeader>
          
          {withdrawals.length > 0 ? (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="flex items-center justify-between p-4 bg-dark-800 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <ArrowUpRight className="text-red-500" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">${withdrawal.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No withdrawals yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 border border-dark-600 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {activeTab === 'deposit' ? (
                depositInstructions ? (
                  // Deposit Instructions
                  <div className="space-y-6">
                    <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                      <p className="text-primary-400 text-sm mb-2">Deposit Amount</p>
                      <p className="text-2xl font-bold text-white">
                        ${depositInstructions.deposit.amount.toLocaleString()}
                      </p>
                    </div>

                    {depositInstructions.instructions.type === 'crypto' && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">
                            {depositInstructions.instructions.currency} Address
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-dark-700 rounded-xl border border-dark-600">
                            <code className="text-white text-sm flex-1 break-all">
                              {depositInstructions.instructions.address}
                            </code>
                            <button
                              onClick={() => copyToClipboard(depositInstructions.instructions.address)}
                              className="p-2 text-gray-400 hover:text-primary-500"
                            >
                              {copiedAddress ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">
                          {depositInstructions.instructions.note}
                        </p>
                      </>
                    )}

                    {depositInstructions.instructions.type === 'bank' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Bank Name</p>
                            <p className="text-white">{depositInstructions.instructions.bankName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Account Number</p>
                            <p className="text-white">{depositInstructions.instructions.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Account Name</p>
                            <p className="text-white">{depositInstructions.instructions.accountName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Swift Code</p>
                            <p className="text-white">{depositInstructions.instructions.swiftCode}</p>
                          </div>
                        </div>
                        <p className="text-sm text-yellow-500">
                          {depositInstructions.instructions.note}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Upload Proof of Payment</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-300 hover:file:bg-primary-500/30"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setProofFile(file);
                          }}
                        />
                      </div>

                      <Input
                        label="Reference Number (optional)"
                        placeholder="Enter bank or transaction reference"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                      />

                      <Button
                        className="w-full"
                        isLoading={isUploadingProof}
                        onClick={handleUploadProof}
                      >
                        Submit Proof
                      </Button>

                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          setShowModal(false);
                          setDepositInstructions(null);
                          setCurrentDepositId(null);
                          setProofFile(null);
                          setReferenceNumber('');
                          fetchTransactions();
                        }}
                      >
                        I'll Upload Proof Later
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Deposit Form
                  <div className="space-y-6">
                    <Input
                      label="Amount (USD)"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      leftIcon={<span className="text-gray-500">$</span>}
                    />

                    <div>
                      <label className="block text-sm text-gray-400 mb-3">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-4 rounded-xl border transition-all ${
                              selectedMethod === method.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                            }`}
                          >
                            <span className="text-2xl mb-2 block">{method.icon}</span>
                            <p className="text-sm text-white">{method.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      isLoading={isLoading}
                      onClick={handleDeposit}
                    >
                      Continue
                    </Button>
                  </div>
                )
              ) : (
                // Withdrawal Form
                <div className="space-y-6">
                  <div className="p-4 bg-dark-700 rounded-xl">
                    <p className="text-gray-400 text-sm">Available Balance</p>
                    <p className="text-2xl font-bold text-white">
                      ${(wallet?.mainBalance || 0).toLocaleString()}
                    </p>
                  </div>

                  <Input
                    label="Amount (USD)"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                    leftIcon={<span className="text-gray-500">$</span>}
                  />

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">
                      Withdrawal Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setWithdrawalData({ ...withdrawalData, paymentMethod: method.id })}
                          className={`p-4 rounded-xl border transition-all ${
                            withdrawalData.paymentMethod === method.id
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                          }`}
                        >
                          <span className="text-2xl mb-2 block">{method.icon}</span>
                          <p className="text-sm text-white">{method.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {withdrawalData.paymentMethod?.startsWith('crypto') && (
                    <Input
                      label="Wallet Address"
                      placeholder="Enter your wallet address"
                      value={withdrawalData.walletAddress}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, walletAddress: e.target.value })}
                    />
                  )}

                  {withdrawalData.paymentMethod === 'bank_transfer' && (
                    <>
                      <Input
                        label="Bank Name"
                        placeholder="Enter bank name"
                        value={withdrawalData.bankName}
                        onChange={(e) => setWithdrawalData({ ...withdrawalData, bankName: e.target.value })}
                      />
                      <Input
                        label="Account Number"
                        placeholder="Enter account number"
                        value={withdrawalData.accountNumber}
                        onChange={(e) => setWithdrawalData({ ...withdrawalData, accountNumber: e.target.value })}
                      />
                      <Input
                        label="Account Holder Name"
                        placeholder="Enter account holder name"
                        value={withdrawalData.accountName}
                        onChange={(e) => setWithdrawalData({ ...withdrawalData, accountName: e.target.value })}
                      />
                    </>
                  )}

                  <Button
                    className="w-full"
                    isLoading={isLoading}
                    onClick={handleWithdrawal}
                  >
                    Submit Withdrawal
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


