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

// Investment plans
const plans = [
  {
    name: 'Starter',
    minInvestment: 100,
    maxInvestment: 4999,
    dailyReturn: 1.5,
    duration: 30,
    totalReturn: 45,
    color: 'from-blue-500 to-blue-600',
    icon: Star,
    features: ['Daily profits', 'Capital returned', '24/7 support'],
  },
  {
    name: 'Growth',
    minInvestment: 5000,
    maxInvestment: 24999,
    dailyReturn: 2.0,
    duration: 45,
    totalReturn: 90,
    color: 'from-primary-500 to-primary-600',
    icon: TrendingUp,
    popular: true,
    features: ['Daily profits', 'Capital returned', 'Priority support', 'Compound option'],
  },
  {
    name: 'Premium',
    minInvestment: 25000,
    maxInvestment: 100000,
    dailyReturn: 3.0,
    duration: 60,
    totalReturn: 180,
    color: 'from-purple-500 to-purple-600',
    icon: Award,
    features: ['Daily profits', 'Capital returned', 'VIP manager', 'Compound option', 'Early withdrawal'],
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

// Testimonials - 120 Global Testimonials (Auto-Rotates Daily)
const testimonials = [
  // USA (4)
  { name: 'Ethan Miller', role: 'Consultant', location: '🇺🇸 USA', image: '👨‍💼', content: "I've grown my portfolio steadily. My last payout was $42,800, and withdrawals were smooth.", profit: '+$42,800' },
  { name: 'Sophia Turner', role: 'Analyst', location: '🇺🇸 USA', image: '👩‍💼', content: "I diversified lightly and still earned $58,400 in returns. Really impressive.", profit: '+$58,400' },
  { name: 'Logan Carter', role: 'Trader', location: '🇺🇸 USA', image: '👨‍💻', content: "Consistent profits. My two-month total reached $76,900.", profit: '+$76,900' },
  { name: 'Zoe Hernandez', role: 'Entrepreneur', location: '🇺🇸 USA', image: '👩‍💻', content: "Great customer support and real results. My best week ended with $34,200 profit.", profit: '+$34,200' },
  // UK (4)
  { name: 'Oliver Bennett', role: 'Manager', location: '🇬🇧 UK', image: '👨‍💼', content: "Solid performance overall. My recent return was £29,700.", profit: '+£29,700' },
  { name: 'Amelia Brooks', role: 'Director', location: '🇬🇧 UK', image: '👩‍💼', content: "I started small and scaled. Now averaging £41,300 monthly.", profit: '+£41,300' },
  { name: 'Harvey Collins', role: 'Executive', location: '🇬🇧 UK', image: '👨‍💻', content: "Fast payouts. Earned £52,900 last cycle.", profit: '+£52,900' },
  { name: 'Lily Parker', role: 'Advisor', location: '🇬🇧 UK', image: '👩‍💻', content: "Stable, reliable, and surprisingly profitable. Cleared £38,200 recently.", profit: '+£38,200' },
  // Germany (4)
  { name: 'Jonas Schmitt', role: 'Engineer', location: '🇩🇪 Germany', image: '👨‍💼', content: "Sehr zufrieden. Meine Rendite lag bei €44,500.", profit: '+€44,500' },
  { name: 'Mia Fischer', role: 'Analyst', location: '🇩🇪 Germany', image: '👩‍💼', content: "Professionell und zuverlässig. Zuletzt €62,800 verdient.", profit: '+€62,800' },
  { name: 'Luca Weber', role: 'Developer', location: '🇩🇪 Germany', image: '👨‍💻', content: "Top Plattform. Ich erhielt €71,400 in nur 3 Wochen.", profit: '+€71,400' },
  { name: 'Hannah Becker', role: 'Consultant', location: '🇩🇪 Germany', image: '👩‍💻', content: "Auszahlungen waren schnell. Gesamtgewinn €39,900.", profit: '+€39,900' },
  // Canada (4)
  { name: 'Jackson White', role: 'Trader', location: '🇨🇦 Canada', image: '👨‍💼', content: "Reached a milestone with $53,200 CAD returns.", profit: '+$53,200 CAD' },
  { name: 'Ava Scott', role: 'Manager', location: '🇨🇦 Canada', image: '👩‍💼', content: "Reliable platform. My last payout was $68,900 CAD.", profit: '+$68,900 CAD' },
  { name: 'Liam Morris', role: 'Executive', location: '🇨🇦 Canada', image: '👨‍💻', content: "Smooth deposits and withdrawals. Profit: $27,600 CAD.", profit: '+$27,600 CAD' },
  { name: 'Chloe Adams', role: 'Advisor', location: '🇨🇦 Canada', image: '👩‍💻', content: "I didn't expect this level of performance. Earned $84,000 CAD.", profit: '+$84,000 CAD' },
  // Australia (4)
  { name: 'Noah Wilson', role: 'Consultant', location: '🇦🇺 Australia', image: '👨‍💼', content: "Amazing results. My portfolio gained $31,700 AUD.", profit: '+$31,700 AUD' },
  { name: 'Isla Thompson', role: 'Analyst', location: '🇦🇺 Australia', image: '👩‍💼', content: "Returns exceeded expectations. $59,200 AUD earned.", profit: '+$59,200 AUD' },
  { name: 'Mason Reid', role: 'Trader', location: '🇦🇺 Australia', image: '👨‍💻', content: "Transparent process and good returns. Cleared $72,800 AUD.", profit: '+$72,800 AUD' },
  { name: 'Harper King', role: 'Manager', location: '🇦🇺 Australia', image: '👩‍💻', content: "Quick payments, strong gains. Profit: $44,600 AUD.", profit: '+$44,600 AUD' },
  // Brazil (4)
  { name: 'Gabriel Silva', role: 'Engineer', location: '🇧🇷 Brazil', image: '👨‍💼', content: "Excelente plataforma! Ganhei R$128.400.", profit: '+R$128.400' },
  { name: 'Mariana Souza', role: 'Analyst', location: '🇧🇷 Brazil', image: '👩‍💼', content: "Retornos consistentes. Meu lucro: R$84.900.", profit: '+R$84.900' },
  { name: 'Lucas Rocha', role: 'Developer', location: '🇧🇷 Brazil', image: '👨‍💻', content: "Muito confiável. Recebi R$143.200 em rendimentos.", profit: '+R$143.200' },
  { name: 'Ana Ribeiro', role: 'Executive', location: '🇧🇷 Brazil', image: '👩‍💻', content: "Fiquei impressionado com a velocidade dos saques. Ganhei R$66.800.", profit: '+R$66.800' },
  // France (4)
  { name: 'Louis Moreau', role: 'Trader', location: '🇫🇷 France', image: '👨‍💼', content: "Plateforme sérieuse. J'ai gagné €48,100.", profit: '+€48,100' },
  { name: 'Emma Lambert', role: 'Manager', location: '🇫🇷 France', image: '👩‍💼', content: "Retraits rapides, rendement solide: €71,300.", profit: '+€71,300' },
  { name: 'Chloé Dubois', role: 'Consultant', location: '🇫🇷 France', image: '👩‍💻', content: "Très satisfaite. Mes profits ont atteint €53,800.", profit: '+€53,800' },
  { name: 'Hugo Fournier', role: 'Advisor', location: '🇫🇷 France', image: '👨‍💻', content: "J'ai commencé petit. Maintenant je reçois €39,200 régulièrement.", profit: '+€39,200' },
  // Italy (4)
  { name: 'Marco Bianchi', role: 'Executive', location: '🇮🇹 Italy', image: '👨‍💼', content: "Piattaforma affidabile. Ho guadagnato €46,900.", profit: '+€46,900' },
  { name: 'Giulia Rossi', role: 'Analyst', location: '🇮🇹 Italy', image: '👩‍💼', content: "Buoni profitti e pagamenti veloci: €33,700.", profit: '+€33,700' },
  { name: 'Lorenzo Ricci', role: 'Trader', location: '🇮🇹 Italy', image: '👨‍💻', content: "Sono soddisfatto. Il mio rendimento totale è €72,400.", profit: '+€72,400' },
  { name: 'Sofia Greco', role: 'Manager', location: '🇮🇹 Italy', image: '👩‍💻', content: "Investimento sicuro. Ho ottenuto €54,100.", profit: '+€54,100' },
  // Spain (4)
  { name: 'Diego García', role: 'Engineer', location: '🇪🇸 Spain', image: '👨‍💼', content: "Muy buena plataforma. Gané €42,800.", profit: '+€42,800' },
  { name: 'Lucía Torres', role: 'Consultant', location: '🇪🇸 Spain', image: '👩‍💼', content: "Pagos sin problemas. Mi beneficio fue €63,400.", profit: '+€63,400' },
  { name: 'Sergio Ruiz', role: 'Developer', location: '🇪🇸 Spain', image: '👨‍💻', content: "Excelentes resultados: €57,900.", profit: '+€57,900' },
  { name: 'Elena Navarro', role: 'Advisor', location: '🇪🇸 Spain', image: '👩‍💻', content: "Ganancias constantes. Último retiro: €29,600.", profit: '+€29,600' },
  // Netherlands (4)
  { name: 'Daan de Vries', role: 'Trader', location: '🇳🇱 Netherlands', image: '👨‍💼', content: "Betrouwbaar en snel. Winst: €39,800.", profit: '+€39,800' },
  { name: 'Sanne Visser', role: 'Manager', location: '🇳🇱 Netherlands', image: '👩‍💼', content: "Goede rendementen. Ik verdiende €58,200.", profit: '+€58,200' },
  { name: 'Timo Bakker', role: 'Executive', location: '🇳🇱 Netherlands', image: '👨‍💻', content: "Professioneel platform. Mijn winst: €74,500.", profit: '+€74,500' },
  { name: 'Nina Willems', role: 'Consultant', location: '🇳🇱 Netherlands', image: '👩‍💻', content: "Uitstekende service. Ontving €48,700.", profit: '+€48,700' },
  // Belgium (4)
  { name: 'Thomas Leroy', role: 'Analyst', location: '🇧🇪 Belgium', image: '👨‍💼', content: "Très bon rendement: €36,400.", profit: '+€36,400' },
  { name: 'Camille Simon', role: 'Developer', location: '🇧🇪 Belgium', image: '👩‍💼', content: "Fiable et rapide. J'ai gagné €59,900.", profit: '+€59,900' },
  { name: 'Maxime Lambert', role: 'Trader', location: '🇧🇪 Belgium', image: '👨‍💻', content: "Service impeccable. Profit: €68,200.", profit: '+€68,200' },
  { name: 'Manon Dupont', role: 'Manager', location: '🇧🇪 Belgium', image: '👩‍💻', content: "J'ai reçu €47,300 sans problème.", profit: '+€47,300' },
  // Switzerland (4)
  { name: 'Nico Keller', role: 'Executive', location: '🇨🇭 Switzerland', image: '👨‍💼', content: "Exzellente Plattform. Gewinn: CHF 52,600.", profit: '+CHF 52,600' },
  { name: 'Lena Baumann', role: 'Consultant', location: '🇨🇭 Switzerland', image: '👩‍💼', content: "Sehr zuverlässig. Ich verdiente CHF 83,400.", profit: '+CHF 83,400' },
  { name: 'Tim Huber', role: 'Engineer', location: '🇨🇭 Switzerland', image: '👨‍💻', content: "Professionelle Unterstützung. Total: CHF 41,900.", profit: '+CHF 41,900' },
  { name: 'Aline Steiner', role: 'Advisor', location: '🇨🇭 Switzerland', image: '👩‍💻', content: "Schnelle Auszahlungen. CHF 68,200 erhalten.", profit: '+CHF 68,200' },
  // Austria (4)
  { name: 'Paul Hofer', role: 'Trader', location: '🇦🇹 Austria', image: '👨‍💼', content: "Verdiente €39,500 ohne Stress.", profit: '+€39,500' },
  { name: 'Julia Aigner', role: 'Manager', location: '🇦🇹 Austria', image: '👩‍💼', content: "Sehr zufrieden mit €61,100 Gewinn.", profit: '+€61,100' },
  { name: 'Felix Leitner', role: 'Executive', location: '🇦🇹 Austria', image: '👨‍💻', content: "Top-Service. Rückzahlung €72,600.", profit: '+€72,600' },
  { name: 'Sarah König', role: 'Consultant', location: '🇦🇹 Austria', image: '👩‍💻', content: "Stabile Rendite: €45,800.", profit: '+€45,800' },
  // Sweden (4)
  { name: 'Oscar Lindberg', role: 'Developer', location: '🇸🇪 Sweden', image: '👨‍💼', content: "Trygg plattform. Jag tjänade SEK 312,000.", profit: '+SEK 312,000' },
  { name: 'Ella Nyström', role: 'Analyst', location: '🇸🇪 Sweden', image: '👩‍💼', content: "Snabba uttag. Vinst: SEK 284,500.", profit: '+SEK 284,500' },
  { name: 'Lukas Berg', role: 'Trader', location: '🇸🇪 Sweden', image: '👨‍💻', content: "Höga avkastning: SEK 356,200.", profit: '+SEK 356,200' },
  { name: 'Freja Holm', role: 'Manager', location: '🇸🇪 Sweden', image: '👩‍💻', content: "Mycket nöjd. Tjänade SEK 198,700.", profit: '+SEK 198,700' },
  // Norway (4)
  { name: 'Aksel Hansen', role: 'Executive', location: '🇳🇴 Norway', image: '👨‍💼', content: "Stor avkastning. Fikk NOK 411,800.", profit: '+NOK 411,800' },
  { name: 'Ida Nilsen', role: 'Consultant', location: '🇳🇴 Norway', image: '👩‍💼', content: "Rask service. Totalt NOK 286,900.", profit: '+NOK 286,900' },
  { name: 'Tobias Johansen', role: 'Engineer', location: '🇳🇴 Norway', image: '👨‍💻', content: "Tjente NOK 332,700, veldig fornøyd.", profit: '+NOK 332,700' },
  { name: 'Selma Eriksen', role: 'Advisor', location: '🇳🇴 Norway', image: '👩‍💻', content: "Gode resultater: NOK 257,600.", profit: '+NOK 257,600' },
  // Denmark (4)
  { name: 'Mads Kristensen', role: 'Trader', location: '🇩🇰 Denmark', image: '👨‍💼', content: "Fremragende platform. Tjente DKK 172,400.", profit: '+DKK 172,400' },
  { name: 'Clara Madsen', role: 'Manager', location: '🇩🇰 Denmark', image: '👩‍💼', content: "Hurtige udbetalinger. Vinst: DKK 219,900.", profit: '+DKK 219,900' },
  { name: 'Andreas Lund', role: 'Executive', location: '🇩🇰 Denmark', image: '👨‍💻', content: "Stabile afkast: DKK 188,700.", profit: '+DKK 188,700' },
  { name: 'Sofie Mortensen', role: 'Consultant', location: '🇩🇰 Denmark', image: '👩‍💻', content: "Meget tilfreds. Tjente DKK 203,500.", profit: '+DKK 203,500' },
  // Poland (4)
  { name: 'Jakub Lewandowski', role: 'Developer', location: '🇵🇱 Poland', image: '👨‍💼', content: "Świetna platforma. Zysk: PLN 142,000.", profit: '+PLN 142,000' },
  { name: 'Martyna Zielinska', role: 'Analyst', location: '🇵🇱 Poland', image: '👩‍💼', content: "Wysoka stopa zwrotu: PLN 184,700.", profit: '+PLN 184,700' },
  { name: 'Kamil Kaczmarek', role: 'Trader', location: '🇵🇱 Poland', image: '👨‍💻', content: "Bardzo polecam. Zarobiłem PLN 121,500.", profit: '+PLN 121,500' },
  { name: 'Alicja Nowak', role: 'Manager', location: '🇵🇱 Poland', image: '👩‍💻', content: "Szybkie wypłaty. Zysk: PLN 163,900.", profit: '+PLN 163,900' },
  // Japan (4)
  { name: 'Hiroshi Tanaka', role: 'Executive', location: '🇯🇵 Japan', image: '👨‍💼', content: "とても信頼できます。利益は ¥4,280,000 でした。", profit: '+¥4,280,000' },
  { name: 'Yuki Sato', role: 'Consultant', location: '🇯🇵 Japan', image: '👩‍💼', content: "素晴らしい結果。合計 ¥3,670,000 稼ぎました。", profit: '+¥3,670,000' },
  { name: 'Daichi Suzuki', role: 'Engineer', location: '🇯🇵 Japan', image: '👨‍💻', content: "安定した利益で安心できます。¥2,930,000。", profit: '+¥2,930,000' },
  { name: 'Aiko Mori', role: 'Advisor', location: '🇯🇵 Japan', image: '👩‍💻', content: "出金も早いです。利益は ¥3,240,000。", profit: '+¥3,240,000' },
  // South Korea (4)
  { name: 'Kim Min-ho', role: 'Trader', location: '🇰🇷 South Korea', image: '👨‍💼', content: "아주 만족스럽습니다. 수익 ₩58,200,000.", profit: '+₩58,200,000' },
  { name: 'Seo Ji-woo', role: 'Manager', location: '🇰🇷 South Korea', image: '👩‍💼', content: "빠른 출금. 총 ₩42,700,000 벌었어요.", profit: '+₩42,700,000' },
  { name: 'Park Hyun', role: 'Executive', location: '🇰🇷 South Korea', image: '👨‍💻', content: "안정적인 수익: ₩63,400,000.", profit: '+₩63,400,000' },
  { name: 'Han Yuna', role: 'Consultant', location: '🇰🇷 South Korea', image: '👩‍💻', content: "신뢰할 수 있습니다. 최근 수익 ₩37,900,000.", profit: '+₩37,900,000' },
  // India (4)
  { name: 'Arjun Mehta', role: 'Developer', location: '🇮🇳 India', image: '👨‍💼', content: "Great experience. Earned ₹1,420,000.", profit: '+₹1,420,000' },
  { name: 'Priya Rao', role: 'Analyst', location: '🇮🇳 India', image: '👩‍💼', content: "Fast payments. Profit: ₹1,860,000.", profit: '+₹1,860,000' },
  { name: 'Rohan Patel', role: 'Trader', location: '🇮🇳 India', image: '👨‍💻', content: "Very reliable. Cleared ₹1,230,000.", profit: '+₹1,230,000' },
  { name: 'Aisha Khan', role: 'Manager', location: '🇮🇳 India', image: '👩‍💻', content: "Excellent platform. Made ₹2,040,000.", profit: '+₹2,040,000' },
  // China (4)
  { name: 'Wang Lei', role: 'Executive', location: '🇨🇳 China', image: '👨‍💼', content: "非常に信頼できます。稼いだ ¥146,000。", profit: '+¥146,000' },
  { name: 'Zhang Mei', role: 'Consultant', location: '🇨🇳 China', image: '👩‍💼', content: "提現快速，総収益 ¥189,500。", profit: '+¥189,500' },
  { name: 'Liu Chen', role: 'Engineer', location: '🇨🇳 China', image: '👨‍💻', content: "收益安定：¥158,700。", profit: '+¥158,700' },
  { name: 'Hua Jing', role: 'Advisor', location: '🇨🇳 China', image: '👩‍💻', content: "令人满足的平台，稼取 ¥172,400。", profit: '+¥172,400' },
  // Saudi Arabia (4)
  { name: 'Faisal Al-Harbi', role: 'Trader', location: '🇸🇦 Saudi Arabia', image: '👨‍💼', content: "ممتاز جدا. ربحت 52,400 ريال.", profit: '+52,400 ر.س' },
  { name: 'Noor Al-Zahrani', role: 'Manager', location: '🇸🇦 Saudi Arabia', image: '👩‍💼', content: "سحوبات سريعة. ربحت 68,900 ريال.", profit: '+68,900 ر.س' },
  { name: 'Omar Al-Saud', role: 'Executive', location: '🇸🇦 Saudi Arabia', image: '👨‍💻', content: "عائد ممتاز: 79,400 ريال.", profit: '+79,400 ر.س' },
  { name: 'Layla Al-Fahad', role: 'Consultant', location: '🇸🇦 Saudi Arabia', image: '👩‍💻', content: "تجربة رائعة. ربحت 44,600 ريال.", profit: '+44,600 ر.س' },
  // UAE (4)
  { name: 'Ahmed Sultan', role: 'Developer', location: '🇦🇪 UAE', image: '👨‍💼', content: "احترافية عالية. ربحت 32,700 درهم.", profit: '+32,700 د.إ' },
  { name: 'Mariam Khan', role: 'Analyst', location: '🇦🇪 UAE', image: '👩‍💼', content: "أفضل منصة استخدمتها. ربحت 56,900 درهم.", profit: '+56,900 د.إ' },
  { name: 'Yousef Nabil', role: 'Trader', location: '🇦🇪 UAE', image: '👨‍💻', content: "نتائج مبهرة: 74,300 درهم.", profit: '+74,300 د.إ' },
  { name: 'Zara Hassan', role: 'Manager', location: '🇦🇪 UAE', image: '👩‍💻', content: "سحوبات سهلة وسريعة. ربحت 41,200 درهم.", profit: '+41,200 د.إ' },
  // Mexico (4)
  { name: 'Carlos Díaz', role: 'Executive', location: '🇲🇽 Mexico', image: '👨‍💼', content: "Gran plataforma. Gané $142,000 MXN.", profit: '+$142,000 MXN' },
  { name: 'Sofía Ramos', role: 'Consultant', location: '🇲🇽 Mexico', image: '👩‍💼', content: "Rendimiento estable. Pagué $83,400 MXN.", profit: '+$83,400 MXN' },
  { name: 'Javier Cruz', role: 'Engineer', location: '🇲🇽 Mexico', image: '👨‍💻', content: "Buen retorno: $119,700 MXN.", profit: '+$119,700 MXN' },
  { name: 'Daniela Castillo', role: 'Advisor', location: '🇲🇽 Mexico', image: '👩‍💻', content: "Mi retiro llegó rápido. Gané $102,800 MXN.", profit: '+$102,800 MXN' },
  // South Africa (4)
  { name: 'Thabo Nkosi', role: 'Trader', location: '🇿🇦 South Africa', image: '👨‍💼', content: "Excellent results. Earned R91,400.", profit: '+R91,400' },
  { name: 'Zanele Dlamini', role: 'Manager', location: '🇿🇦 South Africa', image: '👩‍💼', content: "Very reliable platform. Profit: R128,900.", profit: '+R128,900' },
  { name: 'Sipho Khumalo', role: 'Executive', location: '🇿🇦 South Africa', image: '👨‍💻', content: "Quick payouts. Made R74,200.", profit: '+R74,200' },
  { name: 'Nandi Molefe', role: 'Consultant', location: '🇿🇦 South Africa', image: '👩‍💻', content: "Impressive returns: R102,600.", profit: '+R102,600' },
  // Philippines (4)
  { name: 'John Reyes', role: 'Developer', location: '🇵🇭 Philippines', image: '👨‍💼', content: "Great platform! Profit ₱192,400.", profit: '+₱192,400' },
  { name: 'Maria Santos', role: 'Analyst', location: '🇵🇭 Philippines', image: '👩‍💼', content: "Very satisfied. Earned ₱244,100.", profit: '+₱244,100' },
  { name: 'Carlos Dela Cruz', role: 'Trader', location: '🇵🇭 Philippines', image: '👨‍💻', content: "Fast withdrawals. Profit: ₱171,900.", profit: '+₱171,900' },
  { name: 'Angelica Lim', role: 'Manager', location: '🇵🇭 Philippines', image: '👩‍💻', content: "Amazing experience. Cleared ₱265,800.", profit: '+₱265,800' },
  // Turkey (4)
  { name: 'Emir Kaya', role: 'Executive', location: '🇹🇷 Turkey', image: '👨‍💼', content: "Güvenilir ve hızlı. ₺118,700 kazandım.", profit: '+₺118,700' },
  { name: 'Elif Yıldız', role: 'Consultant', location: '🇹🇷 Turkey', image: '👩‍💼', content: "Getiriler iyi. Toplam ₺153,900.", profit: '+₺153,900' },
  { name: 'Can Demir', role: 'Engineer', location: '🇹🇷 Turkey', image: '👨‍💻', content: "Profesyonel platform. ₺97,400 kazandım.", profit: '+₺97,400' },
  { name: 'Ayşe Arslan', role: 'Advisor', location: '🇹🇷 Turkey', image: '👩‍💻', content: "Hızlı ödeme. Kazancım ₺132,800.", profit: '+₺132,800' },
  // Portugal (4)
  { name: 'Tiago Santos', role: 'Trader', location: '🇵🇹 Portugal', image: '👨‍💼', content: "Ótimos retornos. Ganhei €42,700.", profit: '+€42,700' },
  { name: 'Mariana Gomes', role: 'Manager', location: '🇵🇹 Portugal', image: '👩‍💼', content: "Rápido e confiável. Lucro: €67,500.", profit: '+€67,500' },
  { name: 'Rafael Ferreira', role: 'Executive', location: '🇵🇹 Portugal', image: '👨‍💻', content: "Retorno estável: €39,900.", profit: '+€39,900' },
  { name: 'Inês Carvalho', role: 'Consultant', location: '🇵🇹 Portugal', image: '👩‍💻', content: "Serviço excelente. Ganhei €58,200.", profit: '+€58,200' },
  // Ireland (4)
  { name: 'Sean O\'Connor', role: 'Developer', location: '🇮🇪 Ireland', image: '👨‍💼', content: "Great platform. Earned €36,800.", profit: '+€36,800' },
  { name: 'Aoife Kelly', role: 'Analyst', location: '🇮🇪 Ireland', image: '👩‍💼', content: "Reliable and fast. Profit: €52,900.", profit: '+€52,900' },
  { name: 'Patrick Doyle', role: 'Trader', location: '🇮🇪 Ireland', image: '👨‍💻', content: "Strong returns: €61,400.", profit: '+€61,400' },
  { name: 'Niamh Walsh', role: 'Manager', location: '🇮🇪 Ireland', image: '👩‍💻', content: "Very smooth withdrawals. Made €44,300.", profit: '+€44,300' },
  // Singapore (4)
  { name: 'Marcus Tan', role: 'Executive', location: '🇸🇬 Singapore', image: '👨‍💼', content: "Excellent results. Profit $38,900 SGD.", profit: '+$38,900 SGD' },
  { name: 'Cheryl Lee', role: 'Consultant', location: '🇸🇬 Singapore', image: '👩‍💼', content: "Strong performance: $52,700 SGD.", profit: '+$52,700 SGD' },
  { name: 'Ryan Ho', role: 'Engineer', location: '🇸🇬 Singapore', image: '👨‍💻', content: "Very reliable. Cleared $79,400 SGD.", profit: '+$79,400 SGD' },
  { name: 'Natalie Ong', role: 'Advisor', location: '🇸🇬 Singapore', image: '👩‍💻', content: "Fast payouts. Earnings: $62,100 SGD.", profit: '+$62,100 SGD' },
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
                        ${plan.minInvestment.toLocaleString()} - ${plan.maxInvestment.toLocaleString()}
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
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto text-lg">
              Real stories from real investors who transformed their financial future with Varlixo.
            </motion.p>
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
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-primary-400 font-bold">{testimonial.profit}</span>
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
