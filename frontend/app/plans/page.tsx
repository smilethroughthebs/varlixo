'use client';

/**
 * ==============================================
 * VARLIXO - INVESTMENT PLANS PAGE
 * ==============================================
 * Public page showing all available investment plans
 * with profit calculator and comparison table
 */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Shield,
  ArrowRight,
  Check,
  Zap,
  Crown,
  Gem,
  Calculator,
  ChevronDown,
  Info,
  Users,
  Award,
  Target,
  Sparkles,
  BadgeCheck,
  X,
  ArrowUpRight,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import Money from '@/app/components/ui/Money';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { investmentAPI } from '@/app/lib/api';
import { useAuthStore } from '@/app/lib/store';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

// Default plans if API fails
const defaultPlans = [
  {
    _id: '1',
    name: 'Momentum',
    slug: 'momentum',
    description: 'Quick entry plan for agile investors building momentum',
    minAmount: 50,
    maxAmount: 2999,
    dailyROI: 1.2,
    duration: 30,
    totalROI: 36,
    features: ['30-day duration', 'Daily payouts', 'Low capital required', '24/7 support', 'Auto-reinvest option'],
    isPopular: false,
    icon: 'Zap',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  {
    _id: '2',
    name: 'Velocity',
    slug: 'velocity',
    description: 'Balanced growth plan for steady wealth accumulation',
    minAmount: 3000,
    maxAmount: 19999,
    dailyROI: 2.1,
    duration: 50,
    totalROI: 105,
    features: ['50-day duration', 'Enhanced returns', 'Weekly reports', 'Priority support', 'Compound option', 'Risk management'],
    isPopular: true,
    icon: 'Crown',
    color: 'from-cyan-500 to-teal-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    _id: '3',
    name: 'Apex',
    slug: 'apex',
    description: 'Premium plan for elite investors seeking maximum wealth generation',
    minAmount: 20000,
    maxAmount: 999999,
    dailyROI: 3.5,
    duration: 70,
    totalROI: 245,
    features: ['70-day duration', 'Maximum returns', 'VIP concierge', 'Personal manager', 'Daily insights', 'Early withdrawal', 'Exclusive network'],
    isPopular: false,
    icon: 'Gem',
    color: 'from-yellow-500 to-orange-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  {
    _id: '4',
    name: 'Surge',
    slug: 'surge',
    description: 'Explosive growth opportunity for bold investors with limited slots',
    minAmount: 10000,
    maxAmount: 50000,
    dailyROI: 4.0,
    duration: 30,
    totalROI: 120,
    features: ['30-day sprint', 'Explosive returns', 'Limited availability', 'Exclusive access', 'Instant payouts', 'Premium analytics'],
    isPopular: false,
    icon: 'Star',
    color: 'from-pink-500 to-purple-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
];

const iconMap: { [key: string]: any } = {
  Zap: Zap,
  Crown: Crown,
  Gem: Gem,
  Star: Star,
};

// FAQ data
const faqs = [
  {
    question: 'How do the daily returns work?',
    answer: 'Once you activate an investment, you\'ll receive daily returns credited directly to your wallet. The returns are calculated based on your investment amount and plan ROI percentage.',
  },
  {
    question: 'When do I get my principal back?',
    answer: 'Your principal investment is returned at the end of the plan duration along with your final day\'s profit. For example, if you invest $1,000 in a 30-day plan, you get your $1,000 back on day 30.',
  },
  {
    question: 'Can I withdraw my daily profits?',
    answer: 'Yes! Daily profits are credited to your available balance and can be withdrawn at any time, subject to minimum withdrawal amounts.',
  },
  {
    question: 'What happens if I want to exit early?',
    answer: 'Elite plan holders can request early withdrawal with a small fee. Starter and Professional plans run for their full duration to maximize returns.',
  },
  {
    question: 'Is there a limit on investments?',
    answer: 'Each plan has minimum and maximum investment limits shown on the cards. You can have multiple active investments across different plans.',
  },
];

export default function PlansPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [plans, setPlans] = useState<any[]>(defaultPlans);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcAmount, setCalcAmount] = useState('5000');
  const [selectedPlan, setSelectedPlan] = useState(defaultPlans[1]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [recurringAmount6, setRecurringAmount6] = useState('500');
  const [recurringAmount12, setRecurringAmount12] = useState('1000');
  const [startingPlanType, setStartingPlanType] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Get user's country from auth store
      const userCountry = user?.country;
      
      // Add cache-busting parameter and pass country if available
      const response = await investmentAPI.getPlans(userCountry);
      console.log('API Response:', response.data);
      const apiPlans = response.data.data?.plans || response.data.plans || [];
      console.log('Parsed plans:', apiPlans);
      
      if (Array.isArray(apiPlans) && apiPlans.length > 0) {
        // Map API response to frontend format
        const mappedPlans = apiPlans.map((plan: any) => ({
          _id: plan._id,
          name: plan.name,
          slug: plan.slug,
          description: plan.description || plan.shortDescription,
          minAmount: plan.minInvestment,
          maxAmount: plan.maxInvestment,
          dailyROI: plan.dailyReturnRate,
          duration: plan.durationDays,
          totalROI: plan.totalReturnRate,
          features: plan.features || [],
          isPopular: plan.isPopular || plan.isFeatured || false,
          icon: plan.icon || 'Star',
          color: plan.color || 'from-primary-500 to-primary-600',
          bgColor: `bg-${plan.color || 'primary'}-500/10`,
          borderColor: `border-${plan.color || 'primary'}-500/30`,
        }));
        
        setPlans(mappedPlans);
        setSelectedPlan(mappedPlans[0]); // Set first plan as default
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      console.log('Using default plans');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Star;
    return Icon;
  };

  const handleStartRecurringPlan = async (planType: '6-month' | '12-month') => {
    const amountStr = planType === '6-month' ? recurringAmount6 : recurringAmount12;
    const amount = parseFloat(amountStr || '0');

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid monthly contribution amount');
      return;
    }

    try {
      setStartingPlanType(planType);
      await investmentAPI.startRecurringPlan({
        planType,
        monthlyContribution: amount,
      });
      toast.success('Recurring plan started successfully! Redirecting to dashboard...');
      // Redirect to dashboard after a short delay to see the new plan
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to start recurring plan';
      toast.error(message);
    } finally {
      setStartingPlanType(null);
    }
  };

  // Calculator results
  const calcResults = useMemo(() => {
    const amount = parseFloat(calcAmount) || 0;
    const dailyProfit = (amount * selectedPlan.dailyROI) / 100;
    const weeklyProfit = dailyProfit * 7;
    const totalProfit = dailyProfit * selectedPlan.duration;
    const totalReturn = amount + totalProfit;
    return { dailyProfit, weeklyProfit, totalProfit, totalReturn };
  }, [calcAmount, selectedPlan]);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium mb-6 border border-primary-500/20">
              <Sparkles size={16} />
              Investment Plans
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Grow Your Wealth with{' '}
              <span className="bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
                Smart Investments
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Choose a plan that matches your goals. Earn daily returns with our secure, transparent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => setShowCalculator(true)}
                leftIcon={<Calculator size={20} />}
              >
                Calculate Returns
              </Button>
              <Link href="#comparison">
                <Button variant="secondary" size="lg">
                  Compare Plans
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-16 text-sm text-gray-500"
          >
            <span className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full">
              <Shield size={16} className="text-primary-500" />
              Secured & Insured
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full">
              <Users size={16} className="text-primary-500" />
              50,000+ Investors
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full">
              <BadgeCheck size={16} className="text-primary-500" />
              Daily Payouts
            </span>
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >
            {plans.map((plan, index) => {
              const Icon = getIcon(plan.icon || 'Star');
              return (
                <motion.div
                  key={plan._id || index}
                  variants={fadeInUp}
                  className={`relative ${plan.isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg shadow-primary-500/30">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`h-full rounded-3xl border transition-all duration-300 ${
                      plan.isPopular
                        ? 'border-primary-500/50 bg-gradient-to-b from-primary-500/10 via-dark-800/50 to-dark-800/50 shadow-xl shadow-primary-500/10'
                        : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                    }`}
                  >
                    <div className="p-8">
                      {/* Plan Header */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color || 'from-primary-500 to-primary-600'} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="text-white" size={32} />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>

                      {/* ROI Display */}
                      <div className="mb-6 p-4 rounded-2xl bg-dark-700/50">
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-5xl font-bold text-white">{plan.dailyROI}%</span>
                          <span className="text-gray-400 text-lg">/day</span>
                        </div>
                        <p className="text-sm text-primary-400 font-medium">
                          {plan.totalROI}% total return over {plan.duration} days
                        </p>
                      </div>

                      {/* Plan Details */}
                      <div className="space-y-3 mb-6 p-4 rounded-xl bg-dark-900/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-2">
                            <DollarSign size={14} />
                            Min Investment
                          </span>
                          <span className="text-white font-semibold">
                            <Money valueUsd={plan.minAmount} className="text-white font-semibold" showUsdEquivalent={false} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-2">
                            <Target size={14} />
                            Max Investment
                          </span>
                          <span className="text-white font-semibold">
                            <Money valueUsd={plan.maxAmount} className="text-white font-semibold" showUsdEquivalent={false} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-2">
                            <Clock size={14} />
                            Duration
                          </span>
                          <span className="text-white font-semibold">{plan.duration} days</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2.5 mb-8">
                        {(plan.features || []).slice(0, 5).map((feature: string, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                              <Check size={12} className="text-green-400" />
                            </div>
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                        {(plan.features || []).length > 5 && (
                          <p className="text-xs text-gray-500 ml-8">
                            +{plan.features.length - 5} more features
                          </p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Link href="/auth/register">
                        <Button
                          className={`w-full group ${
                            plan.isPopular
                              ? 'bg-gradient-to-r from-primary-500 to-emerald-500 hover:from-primary-400 hover:to-emerald-400'
                              : ''
                          }`}
                          variant={plan.isPopular ? 'primary' : 'secondary'}
                          size="lg"
                        >
                          Get Started
                          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recurring Plans Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 grid md:grid-cols-2 gap-6"
          >
            {/* 6-Month Growth Plan */}
            <Card className="bg-dark-800/60 border-dark-700 hover:border-primary-500/40 transition-colors">
              <div className="p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">6-Month Growth Plan</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Build momentum with a fixed 6-month recurring contribution.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center">
                    <Calendar size={22} className="text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-dark-900/50">
                    <p className="text-gray-500">Duration</p>
                    <p className="text-white font-semibold">6 months</p>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-900/50">
                    <p className="text-gray-500">Lock</p>
                    <p className="text-white font-semibold">Withdrawal at maturity</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly contribution
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      min={1}
                      value={recurringAmount6}
                      onChange={(e) => setRecurringAmount6(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose how much you want to set aside every month.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>0 / 6 months</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dark-700 overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-primary-500 to-emerald-500" />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleStartRecurringPlan('6-month')}
                  isLoading={startingPlanType === '6-month'}
                >
                  Start 6-Month Plan
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </Card>

            {/* 1-Year Wealth Builder */}
            <Card className="bg-dark-800/60 border-dark-700 hover:border-primary-500/40 transition-colors">
              <div className="p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">1-Year Wealth Builder</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Commit for 12 months and grow a long-term portfolio position.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-primary-500 flex items-center justify-center">
                    <Target size={22} className="text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-dark-900/50">
                    <p className="text-gray-500">Duration</p>
                    <p className="text-white font-semibold">12 months</p>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-900/50">
                    <p className="text-gray-500">Lock</p>
                    <p className="text-white font-semibold">Withdrawal at maturity</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly contribution
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      min={1}
                      value={recurringAmount12}
                      onChange={(e) => setRecurringAmount12(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Set a recurring monthly amount you are comfortable with.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>0 / 12 months</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dark-700 overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-primary-500" />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleStartRecurringPlan('12-month')}
                  isLoading={startingPlanType === '12-month'}
                >
                  Start 1-Year Plan
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Profit Calculator Section */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium mb-4">
              Profit Calculator
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Calculate Your Potential Earnings
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See exactly how much you could earn with our investment plans
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-dark-800/50 border border-dark-700"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Side */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Select Plan</label>
                  <div className="grid grid-cols-3 gap-3">
                    {plans.map((plan) => (
                      <button
                        key={plan._id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedPlan._id === plan._id
                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                            : 'bg-dark-700/50 border-dark-600 text-gray-400 hover:border-dark-500'
                        } border`}
                      >
                        <p className="font-semibold text-sm">{plan.name}</p>
                        <p className="text-xs opacity-75">{plan.dailyROI}%/day</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      min={selectedPlan.minAmount}
                      max={selectedPlan.maxAmount}
                      className="w-full pl-10 pr-4 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-xl font-semibold placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Range:{' '}
                    <Money valueUsd={selectedPlan.minAmount} className="text-xs text-gray-500" showUsdEquivalent={false} /> -{' '}
                    <Money valueUsd={selectedPlan.maxAmount} className="text-xs text-gray-500" showUsdEquivalent={false} />
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[1000, 5000, 10000, 25000, 50000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCalcAmount(amount.toString())}
                      className="px-4 py-2 rounded-lg bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white text-sm transition-colors"
                    >
                      <Money valueUsd={amount} className="" showUsdEquivalent={false} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Side */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-emerald-500/5 border border-primary-500/20">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary-400" />
                  Projected Returns
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-dark-800/50">
                    <span className="text-gray-400">Daily Profit</span>
                    <span className="text-xl font-bold text-green-400">
                      +<Money
                        valueUsd={calcResults.dailyProfit}
                        className="text-xl font-bold text-green-400"
                      />
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-dark-800/50">
                    <span className="text-gray-400">Weekly Profit</span>
                    <span className="text-xl font-bold text-green-400">
                      +<Money
                        valueUsd={calcResults.weeklyProfit}
                        className="text-xl font-bold text-green-400"
                      />
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-dark-800/50">
                    <span className="text-gray-400">Total Profit ({selectedPlan.duration} days)</span>
                    <span className="text-xl font-bold text-green-400">
                      +<Money
                        valueUsd={calcResults.totalProfit}
                        className="text-xl font-bold text-green-400"
                      />
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-primary-500/20 border border-primary-500/30">
                    <span className="text-white font-medium">Total Return</span>
                    <span className="text-2xl font-bold text-white">
                      <Money
                        valueUsd={calcResults.totalReturn}
                        className="text-2xl font-bold text-white"
                      />
                    </span>
                  </div>
                </div>
                <Link href="/auth/register" className="block mt-6">
                  <Button className="w-full" size="lg">
                    Start Earning Now
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium mb-4">
              Plan Comparison
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Compare All Plans
            </h2>
            <p className="text-gray-400">
              See all features side by side to make the best choice
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan._id} className="text-center py-4 px-6">
                      <span className={`text-lg font-bold ${plan.isPopular ? 'text-primary-400' : 'text-white'}`}>
                        {plan.name}
                      </span>
                      {plan.isPopular && (
                        <span className="block text-xs text-primary-400 mt-1">Popular</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Daily ROI</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="py-4 px-6 text-center text-white font-semibold">
                      {plan.dailyROI}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Total ROI</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="py-4 px-6 text-center text-green-400 font-semibold">
                      {plan.totalROI}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Duration</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="py-4 px-6 text-center text-white">
                      {plan.duration} days
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Min Investment</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="py-4 px-6 text-center text-white">
                      <Money valueUsd={plan.minAmount} className="text-white" showUsdEquivalent={false} />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Max Investment</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="py-4 px-6 text-center text-white">
                      <Money valueUsd={plan.maxAmount} className="text-white" showUsdEquivalent={false} />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Principal Returned</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="py-4 px-6 text-center">
                      <Check size={20} className="text-green-400 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Priority Support</td>
                  {plans.map((plan, i) => (
                    <td key={plan._id} className="py-4 px-6 text-center">
                      {i > 0 ? (
                        <Check size={20} className="text-green-400 mx-auto" />
                      ) : (
                        <X size={20} className="text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Personal Advisor</td>
                  {plans.map((plan, i) => (
                    <td key={plan._id} className="py-4 px-6 text-center">
                      {i === 2 ? (
                        <Check size={20} className="text-green-400 mx-auto" />
                      ) : (
                        <X size={20} className="text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-dark-800/30">
                  <td className="py-4 px-6 text-gray-400">Early Withdrawal</td>
                  {plans.map((plan, i) => (
                    <td key={plan._id} className="py-4 px-6 text-center">
                      {i === 2 ? (
                        <Check size={20} className="text-green-400 mx-auto" />
                      ) : (
                        <X size={20} className="text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-6 px-6"></td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="py-6 px-6 text-center">
                      <Link href="/auth/register">
                        <Button variant={plan.isPopular ? 'primary' : 'secondary'} size="sm">
                          Choose Plan
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">
              Have questions? We've got answers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-dark-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-dark-800/50 transition-colors"
                >
                  <span className="font-medium text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-16 h-16 mx-auto text-primary-500 mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to Start Growing Your Wealth?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join 50,000+ investors earning daily returns with Varlixo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="px-10">
                  Create Free Account
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="px-10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCalculator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-dark-800 rounded-3xl p-8 border border-dark-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calculator size={24} className="text-primary-500" />
                  Profit Calculator
                </h3>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Plan</label>
                  <select
                    value={selectedPlan._id}
                    onChange={(e) => setSelectedPlan(plans.find(p => p._id === e.target.value) || plans[0])}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  >
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} - {plan.dailyROI}% daily
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <h4 className="text-sm font-medium text-primary-400 mb-3">Projected Returns</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Daily Profit</p>
                      <p className="text-lg font-bold text-green-400">+${calcResults.dailyProfit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weekly Profit</p>
                      <p className="text-lg font-bold text-green-400">+${calcResults.weeklyProfit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Profit</p>
                      <p className="text-lg font-bold text-green-400">+${calcResults.totalProfit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Return</p>
                      <p className="text-lg font-bold text-white">${calcResults.totalReturn.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <Link href="/auth/register" className="block">
                  <Button className="w-full" size="lg">
                    Start Investing
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
