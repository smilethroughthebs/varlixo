'use client';

/**
 * VARLIXO - HOW IT WORKS PAGE
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { 
  UserPlus, Wallet, TrendingUp, DollarSign, ArrowRight, 
  Shield, Clock, CheckCircle, Zap, Gift, HelpCircle 
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in less than 2 minutes with your email. Verify your identity to unlock all features.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    icon: Wallet,
    title: 'Fund Your Wallet',
    description: 'Deposit using cryptocurrency (BTC, ETH, USDT) or gift cards. Minimum deposit from $10.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Choose Your Plan',
    description: 'Select an investment plan that matches your goals. From Starter to Elite with different returns.',
    color: 'from-primary-500 to-emerald-500',
  },
  {
    number: '04',
    icon: DollarSign,
    title: 'Earn Daily Returns',
    description: 'Watch your investment grow with daily profits credited to your account automatically.',
    color: 'from-green-500 to-emerald-500',
  },
];

const features = [
  { icon: Shield, title: 'Secure Platform', description: 'Bank-grade security for all transactions' },
  { icon: Clock, title: '24/7 Operations', description: 'Your investments work around the clock' },
  { icon: CheckCircle, title: 'Instant Deposits', description: 'Funds credited within minutes' },
  { icon: Zap, title: 'Fast Withdrawals', description: 'Get your money within 24 hours' },
  { icon: Gift, title: 'Referral Bonuses', description: 'Earn up to 15% from referrals' },
  { icon: HelpCircle, title: '24/7 Support', description: 'Always here to help you' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="pt-28 pb-20">
        {/* Hero Section */}
        <section className="px-4 mb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span 
              variants={fadeInUp}
              className="inline-block px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium mb-6"
            >
              Simple & Transparent
            </motion.span>
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              How Varlixo Works
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Start earning passive income in just 4 simple steps. No experience required.
            </motion.p>
          </motion.div>
        </section>

        {/* Steps Section */}
        <section className="px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-dark-600 to-dark-700" />
                  )}
                  
                  <Card className="relative z-10 text-center p-6 hover:border-primary-500/50 transition-all group">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <step.icon className="text-white" size={28} />
                    </div>
                    <span className="text-5xl font-bold text-dark-600 absolute top-4 right-4">{step.number}</span>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 py-20 bg-dark-800/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Varlixo?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                We provide a secure, transparent, and profitable investment experience
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:border-primary-500/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                      <feature.icon className="text-primary-500" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary-500/10 to-purple-500/5 border-primary-500/20">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of investors already earning daily profits with Varlixo. 
                Create your free account today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg" rightIcon={<ArrowRight size={20} />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="secondary" size="lg">
                    View Investment Plans
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}






