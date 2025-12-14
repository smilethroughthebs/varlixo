'use client';

/**
 * ==============================================
 * VARLIXO - HOME PAGE
 * ==============================================
 * Premium investment platform landing page
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Check,
  Star,
  BarChart3,
  Lock,
  Globe,
  Wallet,
  PieChart,
  ChevronRight,
  Play,
  Award,
  Clock,
  DollarSign,
  Target,
  Sparkles,
  BadgeCheck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Headphones,
  FileCheck,
  CreditCard,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Button from './components/ui/Button';
import { Card } from './components/ui/Card';
import Money from './components/ui/Money';
import { marketAPI } from './lib/api';
import { useLanguageStore } from './lib/store';
import { getTranslation } from './lib/i18n';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

// Stats data
const stats = [
  { value: '$150M+', label: 'Total Volume', icon: DollarSign },
  { value: '50,000+', label: 'Active Investors', icon: Users },
  { value: '99.9%', label: 'Platform Uptime', icon: Target },
  { value: '24/7', label: 'Expert Support', icon: Headphones },
];

// Features data
const features = [
  {
    icon: TrendingUp,
    title: 'Exceptional Returns',
    description: 'Earn up to 3% daily returns with our AI-powered trading strategies and expert portfolio management.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description: 'Your assets are protected by 256-bit encryption, 2FA, and cold storage with $100M insurance coverage.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'Lightning Withdrawals',
    description: 'Access your profits anytime with instant processing. No waiting, no hassle, no limits.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Lucrative Referrals',
    description: 'Earn 5-10% commission on every investment made by users you refer. Unlimited earning potential.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Monitor your portfolio with live charts, detailed insights, and AI-powered market predictions.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Globe,
    title: 'Global Accessibility',
    description: 'Invest from anywhere in the world with multi-currency support and localized experiences.',
    color: 'from-cyan-500 to-teal-500',
  },
];

// Investment plans (homepage preview only – full details on /plans)
const plans = [
  {
    name: 'Starter Yield',
    minInvestment: 100,
    maxInvestment: 4999,
    dailyReturn: 7.0,
    duration: 2,
    totalReturn: 14,
    color: 'from-blue-500 to-blue-600',
    icon: Star,
    features: ['Short-term yield', 'Daily profits', 'Capital returned'],
  },
  {
    name: 'Prime Growth',
    minInvestment: 5000,
    maxInvestment: 24999,
    dailyReturn: 9.5,
    duration: 3,
    totalReturn: 28.5,
    color: 'from-primary-500 to-primary-600',
    icon: TrendingUp,
    popular: true,
    features: ['Higher daily ROI', 'Priority support', 'AI-optimized entries'],
  },
  {
    name: 'Infinity Pro',
    minInvestment: 25000,
    maxInvestment: 100000,
    dailyReturn: 18.5,
    duration: 7,
    totalReturn: 129.5,
    color: 'from-purple-500 to-purple-600',
    icon: Award,
    features: ['Aggressive strategy', 'Trader-grade analytics', 'VIP support'],
  },
];

// How it works steps
const steps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up in under 2 minutes with just your email. No lengthy verification required to get started.',
    icon: FileCheck,
  },
  {
    step: '02',
    title: 'Fund Your Wallet',
    description: 'Deposit using Bitcoin, Ethereum, USDT, or bank transfer. Instant credit with zero fees.',
    icon: CreditCard,
  },
  {
    step: '03',
    title: 'Choose a Plan',
    description: 'Select an investment plan that matches your goals. Start with as little as $100.',
    icon: Target,
  },
  {
    step: '04',
    title: 'Earn Daily Profits',
    description: 'Watch your money grow with daily returns credited directly to your wallet.',
    icon: TrendingUp,
  },
];

// Testimonials – short, trader-focused with rating info
const testimonials = [
  {
    name: 'Logan Carter',
    role: 'Pro Trader',
    location: '🇺🇸 USA',
    image: '👨‍💻',
    content: 'Varlixo mirrors my own manual strategy but automated. My last 60-day cycle closed solidly in profit.',
    profit: '+$76,900',
    rating: 4.9,
    source: 'TradingView',
  },
  {
    name: 'Mason Reid',
    role: 'Futures Trader',
    location: '🇦🇺 Australia',
    image: '👨‍💻',
    content: 'The risk controls feel like a serious trading desk, not a hype platform. Drawdowns stayed well inside my limits.',
    profit: '+$72,800 AUD',
    rating: 4.8,
    source: 'Trustpilot',
  },
  {
    name: 'Kim Min-ho',
    role: 'Quant Trader',
    location: '🇰🇷 South Korea',
    image: '👨‍💼',
    content: 'Execution is smooth and the stats are transparent. It behaves like a disciplined algo, not a black box.',
    profit: '+₩58,200,000',
    rating: 4.9,
    source: 'TradingView',
  },
  {
    name: 'Tiago Santos',
    role: 'Crypto Day Trader',
    location: '🇵🇹 Portugal',
    image: '👨‍💼',
    content: 'I use Varlixo alongside my manual trades. The equity curve has been smooth and withdrawals land on time.',
    profit: '+€42,700',
    rating: 4.7,
    source: 'CoinGecko Ratings',
  },
];

// Crypto prices mock (will be replaced with API data)
const defaultCryptos = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67234.50, change: 2.45 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3521.80, change: -1.23 },
  { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.01 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 584.20, change: 3.12 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 142.65, change: 5.67 },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [cryptos, setCryptos] = useState(defaultCryptos);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { language } = useLanguageStore();
  
  // Translation helper
  const t = (key: string) => getTranslation(language, key);

  useEffect(() => {
    setMounted(true);
    
    // Fetch live crypto prices
    const fetchCryptos = async () => {
      try {
        const response = await marketAPI.getCryptos(5);
        const data = response.data?.data?.data || response.data?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setCryptos(data.map((c: any) => ({
            id: c.id,
            symbol: c.symbol?.toUpperCase(),
            name: c.name,
            price: c.current_price || c.price,
            change: c.price_change_percentage_24h || c.change || 0,
          })));
        }
      } catch (error) {
        // Use default data
      }
    };
    
    fetchCryptos();
    const interval = setInterval(fetchCryptos, 60000);
    
    // Auto-rotate testimonials (24 hours = 86400000ms)
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 86400000);
    
    return () => {
      clearInterval(interval);
      clearInterval(testimonialInterval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Trust Badge */}
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium backdrop-blur-sm">
                <BadgeCheck size={18} className="text-primary-400" />
                {t('hero.badge')}
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
            >
              {t('hero.title')}{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary-400 via-emerald-400 to-primary-500 bg-clip-text text-transparent">
                  {t('hero.titleHighlight')}
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link href="/auth/register">
                <Button size="lg" className="group px-8 py-4 text-lg">
                  {t('hero.cta')}
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
                  <Play size={20} className="mr-2" />
                  {t('hero.secondary')}
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Shield size={16} className="text-primary-500" />
                SSL Secured
              </span>
              <span className="flex items-center gap-2">
                <Lock size={16} className="text-primary-500" />
                256-bit Encryption
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-primary-500" />
                Verified Platform
              </span>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-6 rounded-2xl bg-dark-800/50 border border-dark-700 backdrop-blur-sm text-center hover:border-primary-500/30 transition-colors">
                  <stat.icon size={24} className="mx-auto mb-3 text-primary-500" />
                  <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Crypto Ticker */}
      <section className="py-4 bg-dark-800/50 border-y border-dark-700 overflow-hidden">
        <div className="flex animate-marquee">
          {[...cryptos, ...cryptos].map((crypto, index) => (
            <div
              key={`${crypto.id}-${index}`}
              className="flex items-center gap-3 px-8 border-r border-dark-700"
            >
              <span className="text-white font-semibold">{crypto.symbol}</span>
              <span className="text-gray-400">${crypto.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`flex items-center gap-1 text-sm ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {crypto.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(crypto.change || 0).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-4">
              Simple Process
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto text-lg">
              Start earning in four simple steps. No experience required.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                )}
                <div className="relative p-8 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-primary-500/30 transition-all duration-300 group">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-dark-700 flex items-center justify-center mb-6 mt-4 group-hover:bg-primary-500/10 transition-colors">
                    <step.icon size={32} className="text-primary-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
              Why Varlixo
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              Built for Modern Investors
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto text-lg">
              Experience the difference with our cutting-edge investment platform designed for maximum returns.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full p-8 hover:border-primary-500/30 transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                    <div className="w-full h-full rounded-2xl bg-dark-800 flex items-center justify-center group-hover:bg-transparent transition-colors">
                      <feature.icon size={28} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Investment Plans Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              Investment Plans
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              Choose Your Growth Path
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto text-lg">
              Flexible plans designed for every investor. Start small, think big.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {plans.map((plan, index) => {
              const PlanIcon = plan.icon;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <div
                    className={`relative h-full p-8 rounded-3xl bg-dark-800/50 border transition-all duration-300 hover:scale-[1.02] ${
                      plan.popular ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                      <PlanIcon size={32} className="text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-white">{plan.dailyReturn}%</span>
                      <span className="text-gray-400 text-lg"> /day</span>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-dark-700/50 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Investment Range</span>
                      </div>
                      <p className="text-white font-semibold">
                        <Money valueUsd={plan.minInvestment} className="text-white font-semibold" showUsdEquivalent={false} /> -{' '}
                        <Money valueUsd={plan.maxInvestment} className="text-white font-semibold" showUsdEquivalent={false} />
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white font-medium">{plan.duration} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Return</span>
                        <span className="text-primary-400 font-medium">{plan.totalReturn}%</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <Check size={12} className="text-primary-500" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/auth/register">
                      <Button
                        variant={plan.popular ? 'primary' : 'secondary'}
                        className="w-full"
                        size="lg"
                      >
                        Get Started
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Link href="/plans">
              <Button variant="ghost" size="lg">
                View All Investment Plans
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-4">
              Testimonials
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              Trusted by Thousands
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto text-lg mb-4">
              Real stories from real investors who transformed their financial future with Varlixo.
            </motion.p>

            {/* Ratings summary (no app stores) */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-400"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-700/70 border border-dark-600">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} className="fill-yellow-400" />
                  <span className="font-semibold">4.9 / 5</span>
                </div>
                <span className="text-gray-500">on TradingView</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-700/70 border border-dark-600">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} className="fill-yellow-400" />
                  <span className="font-semibold">4.8 / 5</span>
                </div>
                <span className="text-gray-500">on Trustpilot</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-700/70 border border-dark-600">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} className="fill-yellow-400" />
                  <span className="font-semibold">4.7 / 5</span>
                </div>
                <span className="text-gray-500">on CoinGecko Ratings</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`p-8 rounded-3xl bg-dark-800/50 border transition-all duration-500 ${
                  activeTestimonial === index ? 'border-primary-500 scale-105' : 'border-dark-700'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    <p className="text-gray-600 text-xs">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {testimonial.rating.toFixed(1)} / 5 · {testimonial.source}
                    </p>
                  </div>
                  <span className="text-primary-400 font-bold text-sm sm:text-base">{testimonial.profit}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Risk Disclosure */}
      <section className="py-12 bg-dark-900 border-y border-dark-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
            <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-yellow-500 font-semibold mb-2">Risk Disclosure</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Investing involves risk, including potential loss of principal. Past performance does not guarantee future results. 
                Please invest responsibly and only invest funds you can afford to lose. Varlixo does not provide financial advice. 
                Consider consulting with a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <Sparkles className="w-16 h-16 mx-auto text-primary-500 mb-6" />
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold text-white mb-6"
            >
              Ready to Start Growing Your Wealth?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              Join over 50,000 investors who are already earning daily returns with Varlixo. 
              Your financial freedom journey starts with one click.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="px-10 py-4 text-lg group">
                  Create Free Account
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="px-10 py-4 text-lg">
                  <Headphones size={20} className="mr-2" />
                  Talk to Us
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Marquee Animation CSS */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
