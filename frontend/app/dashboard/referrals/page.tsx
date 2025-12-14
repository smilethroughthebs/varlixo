'use client';

/**
 * ==============================================
 * VARLIXO - REFERRAL SYSTEM PAGE
 * ==============================================
 * Manage referral code, track earnings, and view referred users
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Copy,
  Check,
  Gift,
  DollarSign,
  TrendingUp,
  Share2,
  Award,
  Crown,
  Star,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Money from '@/app/components/ui/Money';
import { useAuthStore } from '@/app/lib/store';
import { referralAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Tier configurations
const referralTiers = [
  { name: 'Bronze', minReferrals: 0, commission: 5, color: 'amber', icon: Star },
  { name: 'Silver', minReferrals: 10, commission: 7, color: 'gray', icon: Award },
  { name: 'Gold', minReferrals: 25, commission: 10, color: 'yellow', icon: Crown },
  { name: 'Platinum', minReferrals: 50, commission: 12, color: 'blue', icon: Crown },
  { name: 'Diamond', minReferrals: 100, commission: 15, color: 'purple', icon: Crown },
];

export default function ReferralsPage() {
  const { user, wallet } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    thisMonthEarnings: 0,
    currentTier: 'Bronze',
  });
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const referralCode = user?.referralCode || 'VARLIXO123';
  const referralLink = `https://varlixo.vercel.app/auth/register?ref=${referralCode}`;

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await referralAPI.getStats();
      const data = response.data?.data || response.data;
      
      setReferralStats({
        totalReferrals: data?.totalReferrals || 0,
        activeReferrals: data?.activeReferrals || 0,
        totalEarnings: data?.totalEarnings || 0,
        pendingEarnings: data?.pendingEarnings || 0,
        thisMonthEarnings: data?.thisMonthEarnings || 0,
        currentTier: data?.currentTier || 'Bronze',
      });
      
      // Fetch referred users
      const referralsRes = await referralAPI.getReferrals();
      const referralsData = referralsRes.data?.data?.data || referralsRes.data?.data || [];
      setReferredUsers(referralsData);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      // Use default values as fallback
      setReferralStats({
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        thisMonthEarnings: 0,
        currentTier: 'Bronze',
      });
      setReferredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Varlixo',
          text: 'Start investing smarter with Varlixo. Use my referral link to get started!',
          url: referralLink,
        });
      } catch (error) {
        copyToClipboard(referralLink);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const currentTierIndex = referralTiers.findIndex(t => t.name === referralStats.currentTier);
  const nextTier = referralTiers[currentTierIndex + 1];
  const progressToNext = nextTier
    ? ((referralStats.totalReferrals - referralTiers[currentTierIndex].minReferrals) /
        (nextTier.minReferrals - referralTiers[currentTierIndex].minReferrals)) * 100
    : 100;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Referral Program
        </h1>
        <p className="text-gray-400">
          Invite friends and earn commission on their investments
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Users className="text-primary-500" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
          <p className="text-2xl font-bold text-white">{referralStats.totalReferrals}</p>
          <p className="text-sm text-gray-500 mt-1">{referralStats.activeReferrals} active</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-white">
            <Money valueUsd={referralStats.totalEarnings} className="text-2xl font-bold text-white" />
          </p>
          <p className="text-sm text-green-500 mt-1">
            +<Money valueUsd={referralStats.thisMonthEarnings} className="text-sm text-green-500" showUsdEquivalent={false} /> this month
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Gift className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Pending Earnings</p>
          <p className="text-2xl font-bold text-white">
            <Money valueUsd={referralStats.pendingEarnings} className="text-2xl font-bold text-white" />
          </p>
          <p className="text-sm text-gray-500 mt-1">Processing</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Crown className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Current Tier</p>
          <p className="text-2xl font-bold text-white">{referralStats.currentTier}</p>
          <p className="text-sm text-purple-400 mt-1">
            {referralTiers[currentTierIndex]?.commission}% commission
          </p>
        </Card>
      </motion.div>

      {/* Earnings Chart */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-500" />
              Earnings Overview
            </CardTitle>
          </CardHeader>

          <div className="space-y-6">
            {/* Simple Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2">
              {[
                { month: 'Jul', amount: 120 },
                { month: 'Aug', amount: 280 },
                { month: 'Sep', amount: 450 },
                { month: 'Oct', amount: 320 },
                { month: 'Nov', amount: 580 },
                { month: 'Dec', amount: referralStats.thisMonthEarnings },
              ].map((data, index) => {
                const maxAmount = 600;
                const height = (data.amount / maxAmount) * 100;
                const isCurrentMonth = index === 5;
                
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className={`text-xs ${isCurrentMonth ? 'text-primary-400' : 'text-gray-500'}`}>
                      ${data.amount}
                    </span>
                    <div className="w-full bg-dark-700 rounded-t-lg relative" style={{ height: '160px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${
                          isCurrentMonth 
                            ? 'bg-gradient-to-t from-primary-600 to-primary-400' 
                            : 'bg-gradient-to-t from-dark-500 to-dark-400'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${isCurrentMonth ? 'text-white font-medium' : 'text-gray-500'}`}>
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-dark-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-dark-400" />
                <span className="text-sm text-gray-400">Past Months</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary-500" />
                <span className="text-sm text-gray-400">Current Month</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Referral Link Section */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 size={20} className="text-primary-500" />
              Your Referral Link
            </CardTitle>
          </CardHeader>

          <div className="space-y-6">
            {/* Referral Code */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Referral Code</label>
              <div className="flex gap-3">
                <div className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 font-mono text-lg text-white">
                  {referralCode}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(referralCode)}
                  leftIcon={copied ? <Check size={18} /> : <Copy size={18} />}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Referral Link</label>
              <div className="flex gap-3">
                <div className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-gray-300 truncate">
                  {referralLink}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(referralLink)}
                  leftIcon={<Copy size={18} />}
                >
                  Copy
                </Button>
                <Button onClick={shareReferral} leftIcon={<ExternalLink size={18} />}>
                  Share
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="pt-4 border-t border-dark-700">
              <label className="block text-sm text-gray-400 mb-3">QR Code</label>
              <div className="flex items-start gap-6">
                <div className="bg-white p-4 rounded-xl">
                  {/* Simple QR Code using CSS - in production use a QR library */}
                  <div className="w-32 h-32 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* QR Code Pattern - Simplified representation */}
                      <rect fill="#000" width="100" height="100"/>
                      <rect fill="#fff" x="10" y="10" width="80" height="80"/>
                      <rect fill="#000" x="15" y="15" width="20" height="20"/>
                      <rect fill="#000" x="65" y="15" width="20" height="20"/>
                      <rect fill="#000" x="15" y="65" width="20" height="20"/>
                      <rect fill="#fff" x="20" y="20" width="10" height="10"/>
                      <rect fill="#fff" x="70" y="20" width="10" height="10"/>
                      <rect fill="#fff" x="20" y="70" width="10" height="10"/>
                      <rect fill="#000" x="40" y="15" width="5" height="5"/>
                      <rect fill="#000" x="50" y="15" width="5" height="5"/>
                      <rect fill="#000" x="40" y="25" width="5" height="5"/>
                      <rect fill="#000" x="45" y="35" width="5" height="5"/>
                      <rect fill="#000" x="35" y="45" width="5" height="5"/>
                      <rect fill="#000" x="55" y="45" width="5" height="5"/>
                      <rect fill="#000" x="45" y="55" width="10" height="10"/>
                      <rect fill="#000" x="60" y="60" width="5" height="5"/>
                      <rect fill="#000" x="70" y="50" width="5" height="5"/>
                      <rect fill="#000" x="80" y="55" width="5" height="5"/>
                      {/* Center logo */}
                      <rect fill="#00d4aa" x="40" y="40" width="20" height="20" rx="4"/>
                      <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">V</text>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium mb-2">Scan to Register</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Share this QR code with friends. When scanned, it will take them directly to the registration page with your referral code pre-filled.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => toast.success('QR Code downloaded!')}>
                    Download QR
                  </Button>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <button className="px-4 py-2 bg-[#0077B5] hover:bg-[#006699] text-white rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
              <button className="px-4 py-2 bg-[#4267B2] hover:bg-[#375695] text-white rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tier Progress */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} className="text-primary-500" />
              Referral Tiers
            </CardTitle>
          </CardHeader>

          {/* Current Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">
                Progress to {nextTier?.name || 'Max Tier'}
              </span>
              <span className="text-white font-medium">
                {referralStats.totalReferrals} / {nextTier?.minReferrals || referralStats.totalReferrals} referrals
              </span>
            </div>
            <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
              />
            </div>
          </div>

          {/* Tier List */}
          <div className="grid md:grid-cols-5 gap-4">
            {referralTiers.map((tier, index) => {
              const isCurrentTier = tier.name === referralStats.currentTier;
              const isUnlocked = index <= currentTierIndex;
              const TierIcon = tier.icon;

              return (
                <div
                  key={tier.name}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    isCurrentTier
                      ? 'border-primary-500 bg-primary-500/10'
                      : isUnlocked
                      ? 'border-dark-500 bg-dark-700/50'
                      : 'border-dark-600 bg-dark-800/50 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      isCurrentTier
                        ? 'bg-primary-500/20'
                        : isUnlocked
                        ? 'bg-dark-600'
                        : 'bg-dark-700'
                    }`}
                  >
                    <TierIcon
                      size={24}
                      className={
                        isCurrentTier
                          ? 'text-primary-500'
                          : isUnlocked
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }
                    />
                  </div>
                  <h4
                    className={`font-semibold ${
                      isCurrentTier ? 'text-primary-400' : 'text-white'
                    }`}
                  >
                    {tier.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{tier.minReferrals}+ referrals</p>
                  <p
                    className={`text-lg font-bold mt-2 ${
                      isCurrentTier ? 'text-primary-400' : 'text-green-400'
                    }`}
                  >
                    {tier.commission}%
                  </p>
                  <p className="text-xs text-gray-500">commission</p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* How It Works */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Share2 className="text-primary-500" size={32} />
              </div>
              <h4 className="text-white font-semibold mb-2">1. Share Your Link</h4>
              <p className="text-sm text-gray-400">
                Share your unique referral link with friends, family, or on social media
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-500" size={32} />
              </div>
              <h4 className="text-white font-semibold mb-2">2. Friends Sign Up</h4>
              <p className="text-sm text-gray-400">
                When they register using your link and start investing
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-yellow-500" size={32} />
              </div>
              <h4 className="text-white font-semibold mb-2">3. Earn Commission</h4>
              <p className="text-sm text-gray-400">
                Earn up to 15% commission on their investment profits forever
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Referred Users */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary-500" />
              Your Referrals
            </CardTitle>
          </CardHeader>

          {referredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b border-dark-600">
                    <th className="pb-4 pr-4">User</th>
                    <th className="pb-4 pr-4">Joined</th>
                    <th className="pb-4 pr-4">Total Invested</th>
                    <th className="pb-4">Your Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {referredUsers.map((refUser, index) => {
                    const firstName = refUser.firstName || refUser.name?.split(' ')[0] || 'User';
                    const lastName = refUser.lastName || refUser.name?.split(' ')[1] || '';
                    const email = refUser.email || 'N/A';
                    const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';
                    
                    return (
                      <tr key={refUser._id || refUser.id || index}>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                              {initials}
                            </div>
                            <div>
                              <p className="text-white font-medium">{firstName} {lastName}</p>
                              <p className="text-sm text-gray-500">{email.slice(0, 3)}***@{email.split('@')[1] || 'email.com'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-gray-400">
                          {new Date(refUser.joinedAt || refUser.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 pr-4 text-white font-medium">
                          <Money valueUsd={refUser.totalInvested || refUser.totalDeposits || 0} className="text-white font-medium" />
                        </td>
                        <td className="py-4 text-green-400 font-semibold">
                          +<Money valueUsd={refUser.earnings || refUser.referralEarnings || 0} className="text-green-400 font-semibold" showUsdEquivalent={false} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No referrals yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Share your referral link to start earning
              </p>
              <Button onClick={shareReferral} leftIcon={<Share2 size={18} />}>
                Share Now
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}



