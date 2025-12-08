'use client';

/**
 * VARLIXO - DEPOSIT METHOD SELECTION
 * Choose your deposit method
 */

import Link from 'next/link';
import { ArrowLeft, Sparkles, Gift, Building2, ChevronRight, Shield, Zap, Clock } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

const depositMethods = [
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    description: 'Deposit using Bitcoin, Ethereum, USDT, Solana and more cryptocurrencies',
    icon: Sparkles,
    color: 'from-orange-500 to-yellow-500',
    href: '/dashboard/wallet/deposit/crypto',
    features: ['Instant processing', '6+ cryptocurrencies', 'Low fees'],
    minDeposit: 50,
  },
  {
    id: 'giftcard',
    name: 'Gift Cards',
    description: 'Convert your gift cards to cash - Apple, Steam, Amazon, Roblox and more',
    icon: Gift,
    color: 'from-pink-500 to-purple-500',
    href: '/dashboard/wallet/deposit/giftcard',
    features: ['15+ gift card brands', '5-30 min verification', 'Best rates'],
    minDeposit: 10,
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank transfer or wire transfer for larger deposits',
    icon: Building2,
    color: 'from-blue-500 to-cyan-500',
    href: '/dashboard/wallet/deposit/bank',
    features: ['Secure transfers', 'No limits', '1-3 business days'],
    minDeposit: 100,
  },
];

export default function DepositPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/wallet" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} />
          Back to Wallet
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Deposit Funds</h1>
        <p className="text-gray-400">Choose your preferred deposit method</p>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700">
          <Shield className="text-green-500" size={24} />
          <div>
            <p className="text-white font-medium text-sm">Secure</p>
            <p className="text-gray-500 text-xs">256-bit encryption</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700">
          <Zap className="text-yellow-500" size={24} />
          <div>
            <p className="text-white font-medium text-sm">Fast</p>
            <p className="text-gray-500 text-xs">Instant processing</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700">
          <Clock className="text-blue-500" size={24} />
          <div>
            <p className="text-white font-medium text-sm">24/7</p>
            <p className="text-gray-500 text-xs">Always available</p>
          </div>
        </div>
      </div>

      {/* Deposit Methods */}
      <div className="space-y-4">
        {depositMethods.map((method) => (
          <Link key={method.id} href={method.href}>
            <Card className="group hover:border-primary-500/50 transition-all cursor-pointer mb-4">
              <div className="flex items-start gap-6 p-2">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <method.icon className="text-white" size={32} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{method.name}</h3>
                    <span className="text-gray-500 text-sm">Min ${method.minDeposit}</span>
                  </div>
                  <p className="text-gray-400 mb-4">{method.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {method.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-300">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <ChevronRight className="text-gray-600 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-4" size={24} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div className="p-6 bg-dark-800/50 rounded-2xl border border-dark-700 text-center">
        <p className="text-gray-400 mb-2">Need help choosing a deposit method?</p>
        <Link href="/dashboard/support">
          <Button variant="ghost" size="sm">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
}







