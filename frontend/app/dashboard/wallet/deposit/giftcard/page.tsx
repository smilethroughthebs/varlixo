'use client';

/**
 * VARLIXO - GIFT CARD DEPOSIT PAGE
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { walletAPI } from '@/app/lib/api';

const giftCardMethods = [
  { id: 'giftcard_apple', name: 'Apple Gift Card', icon: '🍎', color: 'from-gray-600 to-gray-800', minDeposit: 25, popular: true },
  { id: 'giftcard_google', name: 'Google Play', icon: '▶️', color: 'from-green-600 to-blue-500', minDeposit: 25 },
  { id: 'giftcard_amazon', name: 'Amazon', icon: '📦', color: 'from-orange-500 to-yellow-500', minDeposit: 25, popular: true },
  { id: 'giftcard_steam', name: 'Steam', icon: '🎮', color: 'from-blue-800 to-blue-600', minDeposit: 20 },
  { id: 'giftcard_xbox', name: 'Xbox', icon: '🎯', color: 'from-green-600 to-green-400', minDeposit: 25 },
  { id: 'giftcard_playstation', name: 'PlayStation', icon: '🎲', color: 'from-blue-700 to-blue-500', minDeposit: 25 },
  { id: 'giftcard_roblox', name: 'Roblox', icon: '🟥', color: 'from-red-600 to-red-400', minDeposit: 10, popular: true },
  { id: 'giftcard_spotify', name: 'Spotify', icon: '🎵', color: 'from-green-500 to-green-400', minDeposit: 10 },
  { id: 'giftcard_netflix', name: 'Netflix', icon: '🎬', color: 'from-red-700 to-red-500', minDeposit: 15 },
  { id: 'giftcard_itunes', name: 'iTunes', icon: '🎧', color: 'from-pink-600 to-purple-500', minDeposit: 15 },
  { id: 'giftcard_ebay', name: 'eBay', icon: '🛒', color: 'from-blue-600 to-yellow-500', minDeposit: 25 },
  { id: 'giftcard_walmart', name: 'Walmart', icon: '🏪', color: 'from-blue-600 to-blue-400', minDeposit: 25 },
  { id: 'giftcard_target', name: 'Target', icon: '🎯', color: 'from-red-600 to-red-500', minDeposit: 25 },
  { id: 'giftcard_visa', name: 'Visa Gift Card', icon: '💳', color: 'from-blue-700 to-blue-500', minDeposit: 50, popular: true },
  { id: 'giftcard_mastercard', name: 'Mastercard Gift', icon: '💳', color: 'from-orange-600 to-red-500', minDeposit: 50 },
  { id: 'giftcard_razer', name: 'Razer Gold', icon: '🐍', color: 'from-green-500 to-green-300', minDeposit: 10 },
];

export default function GiftCardDepositPage() {
  const [step, setStep] = useState<'select' | 'details' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardPin, setGiftCardPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const selectedCard = giftCardMethods.find(m => m.id === selectedMethod);

  const handleSelectCard = (id: string) => {
    setSelectedMethod(id);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!amount || !giftCardCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    const card = giftCardMethods.find(m => m.id === selectedMethod);
    if (card && parseFloat(amount) < card.minDeposit) {
      toast.error(`Minimum deposit is $${card.minDeposit}`);
      return;
    }

    setIsLoading(true);
    try {
      // Backend CreateDepositDto only accepts amount, paymentMethod, cryptoCurrency, and userNote.
      // We encode the gift card code and PIN into userNote so admins can see it.
      const userNoteParts = [
        `Code: ${giftCardCode.trim()}`,
        giftCardPin.trim() ? `PIN: ${giftCardPin.trim()}` : null,
      ].filter(Boolean);

      const response = await walletAPI.createDeposit({
        amount: parseFloat(amount),
        paymentMethod: selectedMethod,
        userNote: userNoteParts.join(' | '),
      });

      const payload = response.data.data || response.data;
      const depositId = payload?.deposit?.id || payload?.deposit?._id || null;

      // Optional proof upload for faster verification
      if (depositId && proofFile) {
        const formData = new FormData();
        formData.append('depositId', depositId);
        formData.append('file', proofFile);
        setIsUploadingProof(true);
        try {
          await walletAPI.uploadDepositProof(formData);
        } catch (error: any) {
          // Don't block success if proof upload fails
          console.error('Failed to upload gift card proof:', error?.response?.data || error);
        } finally {
          setIsUploadingProof(false);
        }
      }

      setStep('success');
      setProofFile(null);
      toast.success('Gift card submitted for verification!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit gift card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href={step === 'select' ? '/dashboard/wallet/deposit' : '#'}
          onClick={(e) => {
            if (step !== 'select') {
              e.preventDefault();
              setStep('select');
            }
          }}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          {step === 'select' ? 'Back to Deposit Methods' : 'Back to Gift Cards'}
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Gift Card Deposit</h1>
        <p className="text-gray-400">
          {step === 'select' && 'Select the gift card brand you want to redeem'}
          {step === 'details' && 'Enter your gift card details'}
          {step === 'success' && 'Your gift card is being verified'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {['Select Card', 'Enter Details', 'Verification'].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = (step === 'select' && stepNum === 1) || 
                          (step === 'details' && stepNum === 2) || 
                          (step === 'success' && stepNum === 3);
          const isCompleted = (step === 'details' && stepNum === 1) || 
                             (step === 'success' && stepNum <= 2);
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

      {/* Step 1: Select Gift Card */}
      {step === 'select' && (
        <div className="space-y-6">
          {/* Popular Cards */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Popular</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {giftCardMethods.filter(m => m.popular).map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card.id)}
                  className="group p-4 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <p className="text-white font-medium">{card.name}</p>
                  <p className="text-gray-500 text-xs">Min ${card.minDeposit}</p>
                </button>
              ))}
            </div>
          </div>

          {/* All Cards */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">All Gift Cards</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {giftCardMethods.filter(m => !m.popular).map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card.id)}
                  className="group p-4 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <p className="text-white font-medium text-sm">{card.name}</p>
                  <p className="text-gray-500 text-xs">Min ${card.minDeposit}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Enter Details */}
      {step === 'details' && selectedCard && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Selected Card */}
            <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedCard.color} flex items-center justify-center text-3xl`}>
                {selectedCard.icon}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">{selectedCard.name}</p>
                <p className="text-gray-400 text-sm">Minimum: ${selectedCard.minDeposit}</p>
              </div>
              <button 
                onClick={() => setStep('select')}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Change
              </button>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-blue-400 font-medium mb-1">How it works</p>
                  <p className="text-blue-400/80 text-sm">
                    Enter your gift card code and PIN. Our team will verify the card within 5-30 minutes. 
                    Once verified, the amount will be credited to your wallet.
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gift Card Value (USD)
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

            {/* Gift Card Code */}
            <Input
              label="Gift Card Code *"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value)}
            />

            {/* Gift Card PIN */}
            <Input
              label="PIN (if applicable)"
              placeholder="Enter PIN if required"
              value={giftCardPin}
              onChange={(e) => setGiftCardPin(e.target.value)}
            />

            {/* Card Photo Upload (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Upload Card Photo (optional)
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Take a clear photo of the card front (and back if needed). This can speed up manual verification.
              </p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-300 hover:file:bg-primary-500/30"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProofFile(file);
                }}
              />
              {proofFile && (
                <p className="text-xs text-gray-400">
                  Selected: {proofFile.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              size="lg"
              isLoading={isLoading || isUploadingProof}
              disabled={!amount || !giftCardCode || isLoading}
              onClick={handleSubmit}
            >
              Submit Gift Card
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <div className="space-y-6">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Gift Card Submitted!</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Your gift card is being verified. This usually takes 5-30 minutes. 
              You'll receive a notification once the funds are credited to your wallet.
            </p>
            
            <div className="p-4 bg-dark-700/50 rounded-xl mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Card Type</span>
                <span className="text-white">{selectedCard?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-semibold">${parseFloat(amount).toLocaleString()}</span>
              </div>
            </div>

            <Link href="/dashboard/wallet">
              <Button className="w-full" size="lg">
                Back to Wallet
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}







