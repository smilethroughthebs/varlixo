'use client';

/**
 * VARLIXO - TERMS OF SERVICE PAGE
 */

import { motion } from 'framer-motion';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import { Scale, FileText, Shield, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TermsPage() {
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
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
              <Scale className="text-primary-500" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: December 5, 2024</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-primary-500" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  By accessing or using Varlixo's services, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our platform. These terms apply to all 
                  users, including investors, visitors, and any other individuals who access or use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-primary-500" />
                  2. Services Description
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Varlixo provides cryptocurrency investment services, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Investment plan subscriptions with daily returns</li>
                  <li>Cryptocurrency deposit and withdrawal services</li>
                  <li>Referral program with commission earnings</li>
                  <li>Account management and portfolio tracking</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-500" />
                  3. Risk Disclosure
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Investment in cryptocurrency involves substantial risk and may result in partial or total loss 
                  of your investment. Past performance does not guarantee future results. You should only invest 
                  funds that you can afford to lose. Varlixo does not provide financial advice, and you should 
                  consult with a qualified financial advisor before making investment decisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  4. Account Registration
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  To use our services, you must:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Be at least 18 years of age</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Complete KYC verification when required</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-primary-500" />
                  5. Deposits and Withdrawals
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  All deposits are processed within 1-24 hours upon confirmation. Withdrawals are processed 
                  within 1-5 business days depending on the payment method. Minimum deposit and withdrawal 
                  amounts apply as specified on the platform. Network fees and processing fees may apply.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">6. Prohibited Activities</h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Users are prohibited from:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Using the platform for money laundering or illegal activities</li>
                  <li>Creating multiple accounts to abuse promotions</li>
                  <li>Attempting to hack, disrupt, or manipulate the platform</li>
                  <li>Providing false information or fraudulent documents</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">7. Contact Information</h2>
                <p className="text-gray-400 leading-relaxed">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-white">Email: legal@varlixo.com</p>
                  <p className="text-white">Support: support@varlixo.com</p>
                </div>
              </section>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}






