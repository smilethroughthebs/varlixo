'use client';

/**
 * VARLIXO - BANK TRANSFER DEPOSIT PAGE
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CheckCircle, Copy, Building2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { walletAPI } from '@/app/lib/api';

const bankMethods = [
  { 
    id: 'bank_transfer', 
    name: 'Bank Transfer', 
    description: 'Standard bank transfer (2-5 business days)',
    icon: '🏦', 
    color: 'from-blue-600 to-blue-400', 
    minDeposit: 100,
    processingTime: '2-5 business days',
  },
  { 
    id: 'bank_wire', 
    name: 'Wire Transfer', 
    description: 'International wire transfer (1-3 business days)',
    icon: '🔄', 
    color: 'from-gray-600 to-gray-500', 
    minDeposit: 500,
    processingTime: '1-3 business days',
  },
];

export default function BankDepositPage() {
  const [step, setStep] = useState<'select' | 'amount' | 'instructions'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [depositInstructions, setDepositInstructions] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const selectedBank = bankMethods.find(m => m.id === selectedMethod);

  const handleSelectMethod = (id: string) => {
    setSelectedMethod(id);
    setStep('amount');
  };

  const handleContinue = async () => {
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    const method = bankMethods.find(m => m.id === selectedMethod);
    if (method && parseFloat(amount) < method.minDeposit) {
      toast.error(`Minimum deposit is $${method.minDeposit}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await walletAPI.createDeposit({
        amount: parseFloat(amount),
        paymentMethod: selectedMethod,
      });
      setDepositInstructions(response.data.data);
      setStep('instructions');
      toast.success('Deposit request created!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create deposit');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
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
              if (step === 'instructions') setStep('amount');
            }
          }}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          {step === 'select' ? 'Back to Deposit Methods' : 'Back'}
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Bank Transfer</h1>
        <p className="text-gray-400">
          {step === 'select' && 'Select your transfer type'}
          {step === 'amount' && 'Enter the amount you want to deposit'}
          {step === 'instructions' && 'Use these details to make your transfer'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {['Select Type', 'Enter Amount', 'Bank Details'].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = (step === 'select' && stepNum === 1) || 
                          (step === 'amount' && stepNum === 2) || 
                          (step === 'instructions' && stepNum === 3);
          const isCompleted = (step === 'amount' && stepNum === 1) || 
                             (step === 'instructions' && stepNum <= 2);
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

      {/* Step 1: Select Method */}
      {step === 'select' && (
        <div className="space-y-4">
          {bankMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleSelectMethod(method.id)}
              className="w-full group p-6 rounded-2xl border border-dark-600 bg-dark-800/50 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
            >
              <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{method.name}</h3>
                    <span className="text-gray-500 text-sm">Min ${method.minDeposit}</span>
                  </div>
                  <p className="text-gray-400 mb-3">{method.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Zap size={14} />
                    <span>Processing: {method.processingTime}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Enter Amount */}
      {step === 'amount' && selectedBank && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Selected Method */}
            <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedBank.color} flex items-center justify-center text-2xl`}>
                {selectedBank.icon}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{selectedBank.name}</p>
                <p className="text-gray-400 text-sm">Min ${selectedBank.minDeposit} • {selectedBank.processingTime}</p>
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
              {[500, 1000, 2500, 5000, 10000, 25000].map((amt) => (
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
              Get Bank Details
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Bank Instructions */}
      {step === 'instructions' && depositInstructions && (
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="p-6 text-center bg-green-500/10 border-green-500/30">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Deposit Request Created</h3>
            <p className="text-gray-400">Transfer the exact amount using the bank details below</p>
          </Card>

          {/* Amount */}
          <Card className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-1">Amount to Transfer</p>
              <p className="text-4xl font-bold text-white">
                ${depositInstructions.deposit?.amount?.toLocaleString() || amount}
              </p>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              {[
                { label: 'Bank Name', value: depositInstructions.instructions?.bankName || 'Varlixo Holdings Bank' },
                { label: 'Account Name', value: depositInstructions.instructions?.accountName || 'Varlixo Investment Ltd' },
                { label: 'Account Number', value: depositInstructions.instructions?.accountNumber || '1234567890' },
                { label: 'Routing Number', value: depositInstructions.instructions?.routingNumber || '021000021' },
                { label: 'Reference', value: depositInstructions.instructions?.reference || depositInstructions.deposit?._id },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
                  <div>
                    <p className="text-gray-500 text-sm">{item.label}</p>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.value, item.label)}
                    className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {copied === item.label ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">
                <strong>Important:</strong> {depositInstructions.instructions?.note || 'Please include the reference number in your transfer. Deposits are processed within 1-3 business days.'}
              </p>
            </div>
          </Card>

          {/* Done Button */}
          <Link href="/dashboard/wallet">
            <Button className="w-full" size="lg">
              I've Made the Transfer
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}








