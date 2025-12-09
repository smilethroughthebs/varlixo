'use client';

/**
 * VARLIXO - CRYPTO DEPOSIT PAGE
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { walletAPI } from '@/app/lib/api';

const cryptoMethods = [
  { id: 'crypto_btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: 'from-orange-500 to-yellow-500', minDeposit: 50 },
  { id: 'crypto_eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: 'from-purple-500 to-blue-500', minDeposit: 50 },
  { id: 'crypto_usdt', name: 'USDT (TRC20)', symbol: 'USDT', icon: '₮', color: 'from-green-500 to-emerald-500', minDeposit: 50 },
  { id: 'crypto_usdc', name: 'USDC', symbol: 'USDC', icon: '◈', color: 'from-blue-500 to-cyan-500', minDeposit: 50 },
  { id: 'crypto_bnb', name: 'BNB', symbol: 'BNB', icon: '◆', color: 'from-yellow-500 to-orange-400', minDeposit: 50 },
  { id: 'crypto_sol', name: 'Solana', symbol: 'SOL', icon: '◎', color: 'from-purple-600 to-pink-500', minDeposit: 50 },
];

export default function CryptoDepositPage() {
  const [step, setStep] = useState<'select' | 'amount' | 'payment'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [depositInstructions, setDepositInstructions] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [currentDepositId, setCurrentDepositId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const selectedCrypto = cryptoMethods.find(m => m.id === selectedMethod);

  const handleSelectCrypto = (id: string) => {
    setSelectedMethod(id);
    setStep('amount');
  };

  const handleContinue = async () => {
    if (!amount || !selectedMethod) {
      toast.error('Please enter an amount');
      return;
    }

    const crypto = cryptoMethods.find(m => m.id === selectedMethod);
    if (crypto && parseFloat(amount) < crypto.minDeposit) {
      toast.error(`Minimum deposit is $${crypto.minDeposit}`);
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
      setStep('payment');
      toast.success('Deposit request created!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create deposit');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
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
      toast.success('Receipt uploaded. This will help speed up approval.');
      setProofFile(null);
      setReferenceNumber('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload receipt');
    } finally {
      setIsUploadingProof(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href={step === 'select' ? '/dashboard/wallet/deposit' : '#'}
          onClick={(e) => {
            if (step !== 'select') {
              e.preventDefault();
              if (step === 'amount') setStep('select');
              if (step === 'payment') setStep('amount');
            }
          }}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          {step === 'select' ? 'Back to Deposit Methods' : 'Back'}
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Cryptocurrency Deposit</h1>
        <p className="text-gray-400">
          {step === 'select' && 'Select the cryptocurrency you want to deposit'}
          {step === 'amount' && 'Enter the amount you want to deposit'}
          {step === 'payment' && 'Complete your payment using the details below'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {['Select Crypto', 'Enter Amount', 'Make Payment'].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = (step === 'select' && stepNum === 1) || 
                          (step === 'amount' && stepNum === 2) || 
                          (step === 'payment' && stepNum === 3);
          const isCompleted = (step === 'amount' && stepNum === 1) || 
                             (step === 'payment' && stepNum <= 2);
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

      {/* Step 1: Select Crypto */}
      {step === 'select' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cryptoMethods.map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => handleSelectCrypto(crypto.id)}
              className="group p-5 rounded-2xl border border-dark-600 bg-dark-800/50 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${crypto.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {crypto.icon}
              </div>
              <p className="text-white font-semibold text-lg">{crypto.name}</p>
              <p className="text-gray-500 text-sm">{crypto.symbol}</p>
              <p className="text-gray-600 text-xs mt-2">Min ${crypto.minDeposit}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Enter Amount */}
      {step === 'amount' && selectedCrypto && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Selected Crypto */}
            <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCrypto.color} flex items-center justify-center text-2xl`}>
                {selectedCrypto.icon}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{selectedCrypto.name}</p>
                <p className="text-gray-400 text-sm">Minimum: ${selectedCrypto.minDeposit}</p>
              </div>
              <button 
                onClick={() => setStep('select')}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Change
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deposit Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2">
              {[100, 250, 500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    amount === amt.toString()
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
                  }`}
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <Button
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={!amount || isLoading}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Payment Instructions */}
      {step === 'payment' && depositInstructions && (
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="p-6 text-center bg-green-500/10 border-green-500/30">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Deposit Request Created</h3>
            <p className="text-gray-400">Send exactly the amount below to complete your deposit</p>
          </Card>

          {/* Amount to Send */}
          <Card className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-1">Amount to Deposit</p>
              <p className="text-4xl font-bold text-white">
                ${depositInstructions.deposit?.amount?.toLocaleString() || amount}
              </p>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Send {depositInstructions.instructions?.currency || selectedCrypto?.name} to:
              </label>
              <div className="flex items-center gap-2 p-4 bg-dark-700 rounded-xl border border-dark-600">
                <code className="text-white text-sm flex-1 break-all font-mono">
                  {depositInstructions.instructions?.address}
                </code>
                <button
                  onClick={() => copyToClipboard(depositInstructions.instructions?.address)}
                  className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* QR Code - Using QR Server API */}
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden">
                {depositInstructions.instructions?.address ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(depositInstructions.instructions.address)}`}
                    alt="Wallet QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode size={140} className="text-dark-900" />
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-yellow-400 font-medium mb-1">Important</p>
                  <p className="text-yellow-400/80 text-sm">
                    {depositInstructions.instructions?.note || 'Only send the exact cryptocurrency to this address. Sending any other token may result in permanent loss.'}
                  </p>
                </div>
              </div>
            </div>
          
            {/* Upload Receipt (Optional) */}
            <div className="mt-6 space-y-4">
              <h4 className="text-white font-semibold text-sm">Upload Receipt (Optional)</h4>
              <p className="text-xs text-gray-400">
                After you send the crypto, you can upload a screenshot or receipt of your transaction. This helps our
                team confirm your payment faster.
              </p>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Receipt file</label>
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
                label="Reference / Note (optional)"
                placeholder="Enter transaction hash or any note"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
              <Button
                className="w-full"
                variant="secondary"
                size="lg"
                isLoading={isUploadingProof}
                onClick={handleUploadProof}
              >
                Upload Receipt for Faster Approval
              </Button>
              <p className="text-xs text-gray-500">
                You can also upload or update your receipt later from your wallet deposits list.
              </p>
            </div>
          </Card>

          {/* Done Button */}
          <Link href="/dashboard/wallet">
            <Button className="w-full" size="lg">
              I've Made the Payment
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

