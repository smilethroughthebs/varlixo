'use client';

/**
 * ==============================================
 * VARLIXO - INVESTMENTS PAGE
 * ==============================================
 * View investment plans and manage active investments
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Crown,
  Diamond,
  ArrowRight,
  Info,
  Calculator,
  X,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { useAuthStore } from '@/app/lib/store';
import { investmentAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Investment plans
const investmentPlans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Star,
    minAmount: 100,
    maxAmount: 999,
    dailyReturn: 1.5,
    duration: 30,
    totalReturn: 45,
    color: 'from-blue-500 to-blue-600',
    features: ['Daily profits', 'Principal returned', 'Instant activation'],
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: Zap,
    minAmount: 1000,
    maxAmount: 4999,
    dailyReturn: 2.0,
    duration: 45,
    totalReturn: 90,
    color: 'from-gray-400 to-gray-500',
    features: ['Daily profits', 'Principal returned', 'Priority support', 'Compound option'],
    popular: false,
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: Crown,
    minAmount: 5000,
    maxAmount: 24999,
    dailyReturn: 2.5,
    duration: 60,
    totalReturn: 150,
    color: 'from-yellow-500 to-yellow-600',
    features: ['Daily profits', 'Principal returned', 'VIP support', 'Compound option', 'Early withdrawal'],
    popular: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: Diamond,
    minAmount: 25000,
    maxAmount: 100000,
    dailyReturn: 3.0,
    duration: 90,
    totalReturn: 270,
    color: 'from-purple-500 to-purple-600',
    features: ['Daily profits', 'Principal returned', 'Dedicated manager', 'Compound option', 'Flexible withdrawal', 'Bonus rewards'],
  },
];

export default function InvestmentsPage() {
  const { wallet } = useAuthStore();
  const [plans, setPlans] = useState<any[]>(investmentPlans);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [recurringPlans, setRecurringPlans] = useState<any[]>([]);
  const [investmentSummary, setInvestmentSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcAmount, setCalcAmount] = useState('1000');
  const [calcPlan, setCalcPlan] = useState(investmentPlans[2]); // Gold plan default

  useEffect(() => {
    fetchPlans();
    fetchInvestments();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await investmentAPI.getPlans();
      const apiPlans = response.data.data?.plans || response.data.plans || [];
      
      if (Array.isArray(apiPlans) && apiPlans.length > 0) {
        // Map API plans to dashboard format, using Mongo _id as id
        const mappedPlans = apiPlans.map((plan: any, index: number) => ({
          id: plan._id,
          slug: plan.slug,
          name: plan.name,
          icon: [Star, Zap, Crown, Diamond][index % 4],
          minAmount: plan.minInvestment,
          maxAmount: plan.maxInvestment,
          dailyReturn: plan.dailyReturnRate,
          duration: plan.durationDays,
          totalReturn: plan.totalReturnRate,
          color: plan.color || 'from-primary-500 to-primary-600',
          features: plan.features || [],
          popular: plan.isPopular || plan.isFeatured || false,
        }));
        setPlans(mappedPlans);
        setCalcPlan(mappedPlans[0]);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchInvestments = async () => {
    setIsLoading(true);
    try {
      const [investmentsRes, summaryRes, recurringRes] = await Promise.all([
        investmentAPI.getMyInvestments(),
        investmentAPI.getSummary(),
        investmentAPI.getMyRecurringPlans().catch(() => ({ data: { data: { plans: [] } } })),
      ]);
      
      setActiveInvestments(investmentsRes.data.data || []);
      setInvestmentSummary(summaryRes.data.data?.summary || null);
      const recurringData = recurringRes.data.data?.plans || recurringRes.data.plans || [];
      setRecurringPlans(Array.isArray(recurringData) ? recurringData : []);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      setActiveInvestments([]);
      setInvestmentSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!selectedPlan) return;
    
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount < selectedPlan.minAmount || amount > selectedPlan.maxAmount) {
      toast.error(`Amount must be between $${selectedPlan.minAmount} and $${selectedPlan.maxAmount}`);
      return;
    }

    if (amount > (wallet?.mainBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await investmentAPI.createInvestment({
        planId: selectedPlan.id,
        amount,
      });
      toast.success('Investment activated successfully!');
      setSelectedPlan(null);
      setInvestAmount('');
      fetchInvestments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to activate investment');
    }
  };

  const calculateProfit = (amount: number, plan: typeof investmentPlans[0]) => {
    const dailyProfit = (amount * plan.dailyReturn) / 100;
    const totalProfit = dailyProfit * plan.duration;
    const totalReturn = amount + totalProfit;
    return { dailyProfit, totalProfit, totalReturn };
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Investments
          </h1>
          <p className="text-gray-400">
            Grow your wealth with our investment plans
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowCalculator(true)}
          leftIcon={<Calculator size={18} />}
        >
          Profit Calculator
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <TrendingUp className="text-primary-500" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-400">Total Invested</p>
          <p className="text-xl font-bold text-white">
            ${(investmentSummary?.totalInvested || 0).toLocaleString()}
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Wallet className="text-green-500" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-400">Total Profit</p>
          <p className="text-xl font-bold text-green-400">
            +${(investmentSummary?.totalProfit || 0).toLocaleString()}
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="text-yellow-500" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-400">Active Plans</p>
          <p className="text-xl font-bold text-white">
            {investmentSummary?.activeInvestments || 0}
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="text-purple-500" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-400">Expected Return</p>
          <p className="text-xl font-bold text-white">
            ${(investmentSummary?.expectedReturn || 0).toLocaleString()}
          </p>
        </Card>
      </motion.div>

      {/* Available Plans */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-xl font-bold text-white mb-6">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const { dailyProfit, totalProfit, totalReturn } = calculateProfit(plan.minAmount, plan);

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'border-primary-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <PlanIcon className="text-white" size={28} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Daily Return</span>
                    <span className="text-green-400 font-semibold">{plan.dailyReturn}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{plan.duration} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Return</span>
                    <span className="text-primary-400 font-semibold">{plan.totalReturn}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Investment Range</span>
                    <span className="text-white">${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle size={14} className="text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => setSelectedPlan(plan)}
                  variant={plan.popular ? 'primary' : 'secondary'}
                >
                  Invest Now
                </Button>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-500" />
                Active Investments
              </CardTitle>
            </CardHeader>

            <div className="space-y-4">
              {activeInvestments.map((investment) => (
                <div
                  key={investment._id}
                  className="p-4 bg-dark-700/50 rounded-xl border border-dark-600"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{investment.planName} Plan</h4>
                        <p className="text-sm text-gray-400">
                          Started {new Date(investment.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${investment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-400">
                        +{investment.dailyReturn}% daily
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-dark-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Earned So Far</p>
                      <p className="text-lg font-semibold text-green-400">
                        +${investment.totalReturn.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-dark-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Days Remaining</p>
                      <p className="text-lg font-semibold text-white">
                        {investment.daysRemaining}
                      </p>
                    </div>
                    <div className="p-3 bg-dark-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">End Date</p>
                      <p className="text-lg font-semibold text-white">
                        {new Date(investment.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{investment.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${investment.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recurring Investments */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" />
              Recurring Investments
            </CardTitle>
          </CardHeader>

          {recurringPlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-4">
              {recurringPlans.map((plan: any, index: number) => {
                const label = plan.planType === '12-month' ? '1-Year Wealth Builder' : '6-Month Growth Plan';
                return (
                  <motion.div
                    key={plan.id || index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-dark-800/60 border border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{plan.planType}</p>
                        <h4 className="font-semibold text-white text-sm mt-0.5">{label}</h4>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full capitalize bg-dark-900/70 text-gray-300">
                        {plan.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">
                      ${ (plan.totalContributed || 0).toLocaleString() }
                    </p>
                    <div className="text-xs text-gray-400 mb-2 flex items-center justify-between">
                      <span>Monthly contribution</span>
                      <span className="text-primary-400 font-medium">
                        ${ (plan.monthlyContribution || 0).toLocaleString() }
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3 flex items-center justify-between">
                      <span>Portfolio value</span>
                      <span className="text-emerald-400 font-medium">
                        ${ (plan.portfolioValue || 0).toLocaleString() }
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>
                          {plan.monthsCompleted || 0} / {plan.monthsRequired || 0} months
                        </span>
                        <span>{plan.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${plan.progress || 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-primary-500 to-emerald-500"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">
                      Next payment: {plan.nextPaymentDate ? new Date(plan.nextPaymentDate).toLocaleDateString() : '—'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Maturity: {plan.maturityDate ? new Date(plan.maturityDate).toLocaleDateString() : '—'}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <Calendar size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No recurring plans yet</p>
              <p className="text-gray-600 text-sm mb-4">Start a 6-month or 12-month recurring investment to build wealth steadily</p>
              <Button onClick={() => window.open('/plans', '_blank')} variant="secondary">
                Start Recurring Plan
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Investment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-dark-800 rounded-2xl p-6 border border-dark-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Invest in {selectedPlan.name}</h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-dark-700 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Available Balance</span>
                    <span className="text-white font-semibold">
                      ${(wallet?.mainBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min - Max Investment</span>
                    <span className="text-white">
                      ${selectedPlan.minAmount.toLocaleString()} - ${selectedPlan.maxAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      placeholder={selectedPlan.minAmount.toString()}
                      className="w-full pl-8 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                {investAmount && parseFloat(investAmount) >= selectedPlan.minAmount && (
                  <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                    <h4 className="text-sm font-medium text-primary-400 mb-3">Expected Returns</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Daily Profit</span>
                        <span className="text-green-400">
                          +${((parseFloat(investAmount) * selectedPlan.dailyReturn) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Profit ({selectedPlan.duration} days)</span>
                        <span className="text-green-400">
                          +${(((parseFloat(investAmount) * selectedPlan.dailyReturn) / 100) * selectedPlan.duration).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-dark-600 pt-2 mt-2">
                        <span className="text-gray-400">Total Return</span>
                        <span className="text-white font-semibold">
                          ${(parseFloat(investAmount) + ((parseFloat(investAmount) * selectedPlan.dailyReturn) / 100) * selectedPlan.duration).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full" onClick={handleInvest}>
                Confirm Investment
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profit Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowCalculator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-dark-800 rounded-2xl p-6 border border-dark-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Profit Calculator</h3>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Plan</label>
                  <select
                    value={calcPlan.id}
                    onChange={(e) => setCalcPlan(plans.find(p => p.id === e.target.value)!)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.dailyReturn}% daily
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {calcAmount && parseFloat(calcAmount) > 0 && (
                <div className="p-6 bg-gradient-to-br from-primary-500/10 to-primary-600/5 border border-primary-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-white mb-4">Projected Returns</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-800/50 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Daily Profit</p>
                      <p className="text-xl font-bold text-green-400">
                        +${((parseFloat(calcAmount) * calcPlan.dailyReturn) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Weekly Profit</p>
                      <p className="text-xl font-bold text-green-400">
                        +${(((parseFloat(calcAmount) * calcPlan.dailyReturn) / 100) * 7).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Total Profit</p>
                      <p className="text-xl font-bold text-green-400">
                        +${(((parseFloat(calcAmount) * calcPlan.dailyReturn) / 100) * calcPlan.duration).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Total Return</p>
                      <p className="text-xl font-bold text-white">
                        ${(parseFloat(calcAmount) + ((parseFloat(calcAmount) * calcPlan.dailyReturn) / 100) * calcPlan.duration).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Returns are calculated over {calcPlan.duration} days at {calcPlan.dailyReturn}% daily
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



