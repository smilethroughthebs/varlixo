'use client';

/**
 * VARLIXO - WITHDRAWAL PAGE
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CheckCircle, AlertCircle, Clock, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useAuthStore } from '@/app/lib/store';
import { walletAPI } from '@/app/lib/api';

const withdrawMethods = [
  // Crypto
  { id: 'crypto_btc', name: 'Bitcoin', icon: '₿', category: 'crypto', color: 'from-orange-500 to-yellow-500', fee: 2.50, time: '1-24 hours' },
  { id: 'crypto_eth', name: 'Ethereum', icon: 'Ξ', category: 'crypto', color: 'from-purple-500 to-blue-500', fee: 2.50, time: '1-24 hours' },
  { id: 'crypto_usdt', name: 'USDT (TRC20)', icon: '₮', category: 'crypto', color: 'from-green-500 to-emerald-500', fee: 1.00, time: '1-24 hours' },
  { id: 'crypto_usdc', name: 'USDC', icon: '◈', category: 'crypto', color: 'from-blue-500 to-cyan-500', fee: 2.50, time: '1-24 hours' },
  { id: 'crypto_sol', name: 'Solana', icon: '◎', category: 'crypto', color: 'from-purple-600 to-pink-500', fee: 0.50, time: '1-24 hours' },
  // Bank
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', category: 'bank', color: 'from-blue-600 to-blue-400', fee: 5.00, time: '2-5 business days' },
  { id: 'bank_wire', name: 'Wire Transfer', icon: '🔄', category: 'bank', color: 'from-gray-600 to-gray-500', fee: 25.00, time: '1-3 business days' },
];

export default function WithdrawPage() {
  const { wallet } = useAuthStore();
  const [step, setStep] = useState<'method' | 'details' | 'confirm' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [walletAddress, setWalletAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');

  const selectedWithdrawMethod = withdrawMethods.find(m => m.id === selectedMethod);
  const fee = selectedWithdrawMethod?.fee || 0;
  const netAmount = parseFloat(amount || '0') - fee;

  const handleSelectMethod = (id: string) => {
    setSelectedMethod(id);
    setStep('details');
  };

  const validateDetails = () => {
    if (!amount || parseFloat(amount) < 50) {
      toast.error('Minimum withdrawal is $50');
      return false;
    }
    if (parseFloat(amount) > (wallet?.mainBalance || 0)) {
      toast.error('Insufficient balance');
      return false;
    }
    if (selectedMethod?.startsWith('crypto_') && !walletAddress) {
      toast.error('Please enter your wallet address');
      return false;
    }
    if (selectedMethod?.startsWith('bank_')) {
      if (!bankName || !accountNumber || !accountName) {
        toast.error('Please fill in all bank details');
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (validateDetails()) {
      setStep('confirm');
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      await walletAPI.createWithdrawal({
        amount: parseFloat(amount),
        paymentMethod: selectedMethod,
        walletAddress,
        bankName,
        accountNumber,
        accountName,
        routingNumber,
        swiftCode,
      });
      setStep('success');
      toast.success('Withdrawal request submitted!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href={step === 'method' ? '/dashboard/wallet' : '#'}
          onClick={(e) => {
            if (step !== 'method' && step !== 'success') {
              e.preventDefault();
              if (step === 'details') setStep('method');
              if (step === 'confirm') setStep('details');
            }
          }}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          {step === 'method' ? 'Back to Wallet' : 'Back'}
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-gray-400">
          {step === 'method' && 'Select your withdrawal method'}
          {step === 'details' && 'Enter withdrawal details'}
          {step === 'confirm' && 'Review and confirm your withdrawal'}
          {step === 'success' && 'Withdrawal request submitted'}
        </p>
      </div>

      {/* Balance Card */}
      {step !== 'success' && (
        <Card className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Wallet className="text-primary-500" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                ${(wallet?.mainBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Steps */}
      {step !== 'success' && (
        <div className="flex items-center gap-2">
          {['Select Method', 'Enter Details', 'Confirm'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = (step === 'method' && stepNum === 1) || 
                            (step === 'details' && stepNum === 2) || 
                            (step === 'confirm' && stepNum === 3);
            const isCompleted = (step === 'details' && stepNum === 1) || 
                               (step === 'confirm' && stepNum <= 2);
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-primary-500 text-white' : 
                  'bg-dark-700 text-gray-500'
                }`}>
                  {isCompleted ? <Check size={16} /> : stepNum}
                </div>
                <span className={`text-sm hidden sm:block ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                  {label}
                </span>
                {idx < 2 && <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-dark-700'}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Step 1: Select Method */}
      {step === 'method' && (
        <div className="space-y-6">
          {/* Crypto */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Cryptocurrency</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {withdrawMethods.filter(m => m.category === 'crypto').map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method.id)}
                  className="group p-4 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <p className="text-white font-medium">{method.name}</p>
                  <p className="text-gray-500 text-xs">Fee: ${method.fee}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bank */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Bank Transfer</h3>
            <div className="grid grid-cols-2 gap-3">
              {withdrawMethods.filter(m => m.category === 'bank').map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method.id)}
                  className="group p-4 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <p className="text-white font-medium">{method.name}</p>
                  <p className="text-gray-500 text-xs">Fee: ${method.fee} • {method.time}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Enter Details */}
      {step === 'details' && selectedWithdrawMethod && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Selected Method */}
            <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedWithdrawMethod.color} flex items-center justify-center text-2xl`}>
                {selectedWithdrawMethod.icon}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{selectedWithdrawMethod.name}</p>
                <p className="text-gray-400 text-sm">Fee: ${selectedWithdrawMethod.fee} • {selectedWithdrawMethod.time}</p>
              </div>
              <button 
                onClick={() => setStep('method')}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Change
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Withdrawal Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">$</span>
                <input
                  type="number"
                  placeholder="Minimum $50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Crypto Wallet Address */}
            {selectedMethod?.startsWith('crypto_') && (
              <Input
                label={`${selectedWithdrawMethod.name} Wallet Address`}
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            )}

            {/* Bank Details */}
            {selectedMethod?.startsWith('bank_') && (
              <>
                <Input
                  label="Bank Name"
                  placeholder="Enter your bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Account Number"
                    placeholder="Account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                  <Input
                    label="Routing Number"
                    placeholder="Routing number"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                  />
                </div>
                <Input
                  label="Account Holder Name"
                  placeholder="Name on the account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
                {selectedMethod === 'bank_wire' && (
                  <Input
                    label="SWIFT Code"
                    placeholder="SWIFT/BIC code"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                  />
                )}
              </>
            )}

            {/* Fee Preview */}
            {amount && parseFloat(amount) >= 50 && (
              <div className="p-4 bg-dark-700/50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Withdrawal Amount</span>
                  <span className="text-white">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing Fee</span>
                  <span className="text-yellow-400">-${fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-dark-600 pt-2 flex justify-between">
                  <span className="text-white font-medium">You'll Receive</span>
                  <span className="text-green-400 font-bold text-lg">${netAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                  <Clock size={12} />
                  <span>Processing time: {selectedWithdrawMethod.time}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setStep('method')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                size="lg"
                disabled={!amount}
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedWithdrawMethod && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Withdrawal</h3>
              <p className="text-gray-400">Please review the details below</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-gray-400">Method</span>
                <span className="text-white font-medium">{selectedWithdrawMethod.name}</span>
              </div>
              <div className="flex justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-medium">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-gray-400">Fee</span>
                <span className="text-yellow-400">-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-white font-medium">You'll Receive</span>
                <span className="text-green-400 font-bold text-xl">${netAmount.toLocaleString()}</span>
              </div>
              {selectedMethod?.startsWith('crypto_') && (
                <div className="p-3 bg-dark-700 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
                  <p className="text-white text-sm break-all">{walletAddress}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
              <p className="text-yellow-400 text-sm">
                ⚠️ Please double-check your withdrawal details. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setStep('details')}
              >
                Back
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setStep('method')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                isLoading={isLoading}
                disabled={isLoading}
                onClick={handleWithdraw}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Withdrawal Submitted!</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Your withdrawal request has been submitted and is being processed. 
            You'll receive a notification once it's complete.
          </p>
          
          <div className="p-4 bg-dark-700/50 rounded-xl mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Amount</span>
              <span className="text-white font-semibold">${netAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Processing Time</span>
              <span className="text-white">{selectedWithdrawMethod?.time}</span>
            </div>
          </div>

          <Link href="/dashboard/wallet">
            <Button className="w-full" size="lg">
              Back to Wallet
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}







