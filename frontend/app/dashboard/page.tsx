'use client';

/**
 * ==============================================
 * VARLIXO - DASHBOARD HOME PAGE
 * ==============================================
 * Premium user dashboard with portfolio overview
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Target,
  Gift,
  CreditCard,
  Send,
  PiggyBank,
  BarChart3,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Bell,
  ChevronRight,
  Zap,
  Shield,
  Star,
  Calendar,
  DollarSign,
  Activity,
  TrendingDown,
  Sparkles,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Money from '@/app/components/ui/Money';
import { useAuthStore } from '@/app/lib/store';
import { walletAPI, investmentAPI, marketAPI, referralAPI, authAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// Quick actions data
const quickActions = [
  { label: 'Deposit', icon: Plus, href: '/dashboard/wallet/deposit', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Withdraw', icon: ArrowUpRight, href: '/dashboard/wallet?action=withdraw', color: 'from-blue-500 to-blue-600' },
  { label: 'Invest', icon: TrendingUp, href: '/dashboard/investments', color: 'from-purple-500 to-purple-600' },
  { label: 'Referral', icon: Gift, href: '/dashboard/referrals', color: 'from-yellow-500 to-orange-500' },
];

export default function DashboardPage() {
  const { user, wallet } = useAuthStore();
  const [investmentSummary, setInvestmentSummary] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [cryptoPrices, setCryptoPrices] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recurringPlans, setRecurringPlans] = useState<any[]>([]);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, transactionsRes, cryptoRes, recurringRes] = await Promise.all([
        investmentAPI.getSummary().catch(() => ({ data: { data: null } })),
        walletAPI.getTransactions({ limit: 5 }).catch(() => ({ data: { data: [] } })),
        marketAPI.getCryptos(5).catch(() => ({ data: { data: [] } })),
        investmentAPI.getMyRecurringPlans().catch(() => ({ data: { data: { plans: [] } } })),
      ]);

      // Try to get referral stats
      try {
        const refRes = await referralAPI.getStats();
        setReferralStats(refRes.data?.data || null);
      } catch {
        setReferralStats(null);
      }

      const summaryPayload = summaryRes?.data;
      const summary =
        summaryPayload?.data?.summary ||
        summaryPayload?.data ||
        summaryPayload?.summary ||
        summaryPayload;
      setInvestmentSummary(summary || null);
      setRecentTransactions(transactionsRes.data.data?.data || transactionsRes.data.data || []);
      const cryptoData = cryptoRes.data.data?.data || cryptoRes.data.data || [];
      setCryptoPrices(Array.isArray(cryptoData) ? cryptoData : []);
      const recurringData = recurringRes.data.data?.plans || recurringRes.data.plans || [];
      setRecurringPlans(Array.isArray(recurringData) ? recurringData : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handlePayRecurringInstallment = async (planId: string) => {
    try {
      setPayingPlanId(planId);
      await investmentAPI.payRecurringInstallment(planId);
      toast.success('Monthly installment paid successfully');
      await fetchDashboardData();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to pay monthly installment';
      toast.error(message);
    } finally {
      setPayingPlanId(null);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    try {
      await authAPI.resendVerification(user.email);
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const copyReferralCode = () => {
    const code = user?.referralCode || 'VARLIXO';
    navigator.clipboard.writeText(`https://varlixo.vercel.app/auth/register?ref=${code}`);
    toast.success('Referral link copied!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'pending':
        return <Clock size={14} className="text-yellow-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <AlertCircle size={14} className="text-gray-500" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight size={18} className="text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight size={18} className="text-red-500" />;
      case 'profit':
        return <TrendingUp size={18} className="text-primary-500" />;
      case 'referral':
        return <Gift size={18} className="text-yellow-500" />;
      default:
        return <Wallet size={18} className="text-gray-500" />;
    }
  };

  // Calculate total balance
  const totalBalance = (wallet?.mainBalance || 0) + (wallet?.pendingBalance || 0) + (wallet?.lockedBalance || 0);

  const activeRecurringCount = Array.isArray(recurringPlans)
    ? recurringPlans.filter((p: any) => p?.status === 'active' || p?.status === 'missed').length
    : 0;
  const totalActivePlans = (investmentSummary?.activeInvestments || 0) + activeRecurringCount;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6 pb-8"
    >
      {/* Header Section */}
      <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
            {getGreeting()}, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-400">
            Here's your portfolio overview
          </p>
          {!user?.emailVerified && (
            <div className="mt-3 inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs sm:text-sm text-yellow-100">
              <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span>Your email is not verified. Some features may be limited.</span>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="mt-1 sm:mt-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500 text-dark-900 font-medium hover:bg-yellow-400 transition-colors"
                >
                  Resend verification email
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2.5 rounded-xl bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-all"
            title={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-all disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <Link href="/dashboard/wallet/deposit">
            <Button leftIcon={<Plus size={18} />}>
              Add Funds
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Portfolio Summary Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="col-span-2 lg:col-span-1">
          <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary-500/20 via-primary-600/10 to-transparent border-primary-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Wallet className="text-white" size={24} />
                </div>
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  <Activity size={12} />
                  Active
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Balance</p>
              <p className="text-3xl font-bold text-white mb-3">
                {showBalance ? (
                  <Money valueUsd={totalBalance} className="text-3xl font-bold text-white" />
                ) : (
                  '••••••'
                )}
              </p>
              {/* Double Balance Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Available Balance</span>
                  <span className="text-primary-400 font-medium">
                    {showBalance ? (
                      <Money valueUsd={wallet?.mainBalance || 0} className="text-primary-400 font-medium" />
                    ) : (
                      '••••••'
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Locked Balance</span>
                  <span className="text-orange-400 font-medium">
                    {showBalance ? (
                      <Money valueUsd={wallet?.lockedBalance || 0} className="text-orange-400 font-medium" />
                    ) : (
                      '••••••'
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Accrued Profit</span>
                  <span className="text-green-400 font-medium">
                    {showBalance ? (
                      <Money valueUsd={wallet?.pendingBalance || 0} className="text-green-400 font-medium" />
                    ) : (
                      '••••••'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Total Earnings */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="text-green-500" size={22} />
              </div>
              <span className="flex items-center gap-0.5 text-xs text-green-400">
                <ArrowUpRight size={12} />
                +12.5%
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Profit</p>
            <p className="text-2xl font-bold text-white">
              {showBalance ? (
                <Money
                  valueUsd={investmentSummary?.totalProfit ?? investmentSummary?.totalEarnings ?? wallet?.totalEarnings ?? 0}
                  className="text-2xl font-bold text-white"
                />
              ) : (
                '••••••'
              )}
            </p>
          </div>
        </Card>

        {/* Active Investments */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <PiggyBank className="text-purple-500" size={22} />
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                {totalActivePlans} active
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Invested</p>
            <p className="text-2xl font-bold text-white">
              {showBalance ? (
                <Money valueUsd={investmentSummary?.totalInvested || 0} className="text-2xl font-bold text-white" />
              ) : (
                '••••••'
              )}
            </p>
          </div>
        </Card>

        {/* Recurring Plans */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="text-blue-500" size={22} />
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                {recurringPlans.length} active
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Recurring Plans</p>
            <p className="text-2xl font-bold text-white">
              {recurringPlans.length}
            </p>
          </div>
        </Card>

        {/* Referral Earnings */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Gift className="text-yellow-500" size={22} />
              </div>
              <span className="text-xs text-gray-400">
                {referralStats?.totalReferrals || 0} referrals
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Referral Earnings</p>
            <p className="text-2xl font-bold text-white">
              {showBalance ? (
                <Money valueUsd={wallet?.referralEarnings || 0} className="text-2xl font-bold text-white" />
              ) : (
                '••••••'
              )}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-dark-600 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:shadow-lg transition-shadow`}>
                  <action.icon size={24} className="text-white" />
                </div>
                <p className="text-white font-medium">{action.label}</p>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  Quick access <ChevronRight size={14} />
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Chart Placeholder */}
          <motion.div variants={fadeInUp}>
            <Card className="p-0 overflow-hidden">
              <div className="p-6 border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
                    <p className="text-gray-500 text-sm">Your earnings over time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-500/20 text-primary-400">7D</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-400 hover:bg-dark-700">30D</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-400 hover:bg-dark-700">90D</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-400 hover:bg-dark-700">ALL</button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Chart Area - Visual representation */}
                <div className="relative h-48">
                  <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
                    {[35, 45, 40, 55, 65, 58, 72, 68, 80, 75, 85, 90, 82, 95].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                        className="flex-1 bg-gradient-to-t from-primary-500/30 to-primary-500/80 rounded-t-sm"
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-dark-600" />
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
                  <div>
                    <p className="text-gray-500 text-sm">Total Returns</p>
                    <p className="text-2xl font-bold text-white">
                      {showBalance ? (
                        <Money valueUsd={wallet?.totalEarnings || 0} className="text-2xl font-bold text-white" />
                      ) : (
                        '••••••'
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Growth Rate</p>
                    <p className="text-xl font-bold text-green-400 flex items-center justify-end gap-1">
                      <ArrowUpRight size={20} />
                      +{investmentSummary?.activeInvestments ? '2.5' : '0'}% daily
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recurring Investments */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    Recurring Investments
                  </CardTitle>
                  <p className="text-gray-500 text-sm">Your monthly contribution plans</p>
                </div>
                <Link
                  href="/dashboard/investments"
                  className="text-primary-500 hover:text-primary-400 text-sm flex items-center gap-1 font-medium"
                >
                  Manage <ArrowRight size={16} />
                </Link>
              </CardHeader>

              {recurringPlans.length > 0 ? (
                <div className="space-y-3">
                  {recurringPlans.map((plan: any) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium capitalize">{plan.planType}</p>
                          <p className="text-gray-500 text-sm">
                            <Money valueUsd={plan.monthlyContribution || 0} className="text-gray-500 text-sm" showUsdEquivalent={false} /> / month
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.status === 'active'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : plan.status === 'matured'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-400">
                          <div>
                            Contributed:{' '}
                            <Money valueUsd={plan.totalContributed || 0} className="text-sm text-gray-400" showUsdEquivalent={false} />
                          </div>
                          <div>
                            Portfolio:{' '}
                            <Money valueUsd={plan.portfolioValue || 0} className="text-sm text-gray-400" showUsdEquivalent={false} />
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          <div>{plan.monthsCompleted || 0} / {plan.monthsRequired || 0} months</div>
                          <div>{plan.progress || 0}% complete</div>
                        </div>
                      </div>
                      {plan.status === 'active' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handlePayRecurringInstallment(plan.id)}
                          isLoading={payingPlanId === plan.id}
                          className="w-full"
                        >
                          Make Monthly Payment
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar size={32} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 mb-1">No recurring plans yet</p>
                  <p className="text-gray-600 text-sm mb-4">Start a recurring investment to build wealth steadily</p>
                  <Link href="/plans">
                    <Button variant="secondary" size="sm">
                      <Plus size={16} className="mr-2" />
                      Start Recurring Plan
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <p className="text-gray-500 text-sm">Your latest transactions</p>
                </div>
                <Link
                  href="/dashboard/transactions"
                  className="text-primary-500 hover:text-primary-400 text-sm flex items-center gap-1 font-medium"
                >
                  View All <ArrowRight size={16} />
                </Link>
              </CardHeader>

              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((tx: any, index: number) => (
                    <motion.div
                      key={tx._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{tx.description || tx.type}</p>
                          <p className="text-gray-500 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral'
                              ? 'text-green-400'
                              : tx.type === 'withdrawal'
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {(tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral') ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                          {showBalance ? (
                            <Money valueUsd={tx.amount || 0} className="" />
                          ) : (
                            '••••••'
                          )}
                        </p>
                        <span className={`text-xs ${getStatusIcon(tx.status).props.className?.includes('green') ? 'text-green-400' : getStatusIcon(tx.status).props.className?.includes('yellow') ? 'text-yellow-400' : getStatusIcon(tx.status).props.className?.includes('red') ? 'text-red-400' : 'text-gray-400'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Wallet size={32} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 mb-1">No transactions yet</p>
                  <p className="text-gray-600 text-sm mb-4">Start by making your first deposit</p>
                  <Link href="/dashboard/wallet/deposit">
                    <Button variant="secondary" size="sm">
                      <Plus size={16} className="mr-2" />
                      Make Deposit
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Account Status */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={18} className="text-primary-500" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.emailVerified ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                      {user?.emailVerified ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
                    </div>
                    <span className="text-gray-300 text-sm">Email Verified</span>
                  </div>
                  <span className={`text-xs font-medium ${user?.emailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user?.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.kycStatus === 'approved' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                      {user?.kycStatus === 'approved' ? <BadgeCheck size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
                    </div>
                    <span className="text-gray-300 text-sm">KYC Status</span>
                  </div>
                  <span className={`text-xs font-medium capitalize ${user?.kycStatus === 'approved' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user?.kycStatus || 'Not Started'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.twoFactorEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                      {user?.twoFactorEnabled ? <Shield size={16} className="text-green-500" /> : <Shield size={16} className="text-gray-500" />}
                    </div>
                    <span className="text-gray-300 text-sm">2FA Security</span>
                  </div>
                  <span className={`text-xs font-medium ${user?.twoFactorEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {(!user?.emailVerified || user?.kycStatus !== 'approved') && (
                  <Link href="/dashboard/settings" className="block">
                    <Button variant="secondary" size="sm" className="w-full">
                      Complete Verification
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Referral Card */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Gift size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Invite & Earn</h3>
                  <p className="text-gray-400 text-sm">Get 5% on referrals</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/50 flex items-center justify-between mb-4">
                <code className="text-primary-400 text-sm font-mono">
                  {user?.referralCode || 'VARLIXO'}
                </code>
                <button
                  onClick={copyReferralCode}
                  className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-dark-800/50">
                  <p className="text-2xl font-bold text-white">{referralStats?.totalReferrals || 0}</p>
                  <p className="text-xs text-gray-500">Total Referrals</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-800/50">
                  <p className="text-2xl font-bold text-yellow-400">
                    {showBalance ? (
                      <Money valueUsd={wallet?.referralEarnings || 0} className="text-2xl font-bold text-yellow-400" />
                    ) : (
                      '••••••'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Earned</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Market Overview */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary-500" />
                  Live Market
                </CardTitle>
                <Link
                  href="/dashboard/market"
                  className="text-gray-500 hover:text-primary-400 transition-colors"
                >
                  <ExternalLink size={16} />
                </Link>
              </CardHeader>

              <div className="space-y-3">
                {Array.isArray(cryptoPrices) && cryptoPrices.length > 0 ? (
                  cryptoPrices.slice(0, 4).map((crypto: any) => (
                    <div
                      key={crypto.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {crypto.image ? (
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <DollarSign size={16} className="text-primary-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">{crypto.symbol?.toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{crypto.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium text-sm">
                          <Money valueUsd={crypto.current_price || crypto.price || 0} className="text-white font-medium text-sm" showUsdEquivalent={false} />
                        </p>
                        <p
                          className={`text-xs flex items-center justify-end gap-0.5 ${
                            (crypto.price_change_percentage_24h || crypto.change || 0) >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {(crypto.price_change_percentage_24h || crypto.change || 0) >= 0 ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownRight size={12} />
                          )}
                          {Math.abs(crypto.price_change_percentage_24h || crypto.change || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <BarChart3 size={32} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading market data...</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-blue-500/10 border-primary-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ready to grow your wealth?</h3>
                <p className="text-gray-400">Start earning up to 3% daily returns with our investment plans.</p>
              </div>
            </div>
            <Link href="/dashboard/investments">
              <Button size="lg" className="whitespace-nowrap">
                Explore Plans
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
