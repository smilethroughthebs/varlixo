'use client';

/**
 * VARLIXO - RISK DISCLOSURE PAGE
 */

import { motion } from 'framer-motion';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import { AlertTriangle, TrendingDown, DollarSign, Shield, Clock, HelpCircle } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-yellow-500" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Risk Disclosure</h1>
            <p className="text-gray-400">Please read this important information carefully</p>
          </motion.div>

          {/* Important Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-yellow-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">Important Warning</h3>
                  <p className="text-gray-300">
                    Cryptocurrency investments are speculative and involve a high degree of risk. 
                    You may lose some or all of your investment. Never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingDown size={20} className="text-red-500" />
                  Market Volatility Risk
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Cryptocurrency markets are highly volatile. Prices can fluctuate significantly in very short 
                  periods, sometimes within minutes or hours. This volatility can result in substantial gains 
                  but also substantial losses. Historical performance is not indicative of future results.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-primary-500" />
                  Investment Risk
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  By using our investment services, you acknowledge and accept that:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>You may lose some or all of your invested capital</li>
                  <li>Past performance does not guarantee future returns</li>
                  <li>Investment plans have varying risk levels</li>
                  <li>Returns are not guaranteed and may vary</li>
                  <li>You are solely responsible for your investment decisions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-primary-500" />
                  Regulatory Risk
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Cryptocurrency regulations vary by jurisdiction and are subject to change. Changes in laws 
                  or regulations may adversely affect the use, transfer, exchange, and value of cryptocurrencies. 
                  It is your responsibility to ensure compliance with your local laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-primary-500" />
                  Liquidity Risk
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  There may be circumstances where withdrawals or transactions are delayed due to market 
                  conditions, technical issues, or regulatory requirements. We strive to process all 
                  transactions promptly, but delays may occur.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <HelpCircle size={20} className="text-primary-500" />
                  Recommendations
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  We strongly recommend that you:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Only invest funds you can afford to lose</li>
                  <li>Diversify your investments across multiple assets</li>
                  <li>Conduct your own research before investing</li>
                  <li>Consult with a qualified financial advisor</li>
                  <li>Understand the specific risks of each investment plan</li>
                  <li>Monitor your investments regularly</li>
                </ul>
              </section>

              <section className="pt-4 border-t border-dark-600">
                <p className="text-gray-500 text-sm">
                  By using Varlixo's services, you confirm that you have read, understood, and accept 
                  the risks associated with cryptocurrency investments. This disclosure does not cover 
                  all possible risks and you should carefully consider your own circumstances.
                </p>
              </section>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}








