'use client';

/**
 * VARLIXO - PRIVACY POLICY PAGE
 */

import { motion } from 'framer-motion';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import { Lock, Eye, Database, Shield, UserCheck, Globe } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PrivacyPage() {
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
              <Lock className="text-primary-500" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Privacy Policy</h1>
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
                  <Eye size={20} className="text-primary-500" />
                  Information We Collect
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Account information (name, email, phone number)</li>
                  <li>Identity verification documents (for KYC)</li>
                  <li>Financial information (wallet addresses, transaction history)</li>
                  <li>Communication data (support tickets, emails)</li>
                  <li>Device and usage information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Database size={20} className="text-primary-500" />
                  How We Use Your Information
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  We use the collected information to:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Comply with legal obligations</li>
                  <li>Improve and personalize our services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-green-500" />
                  Data Security
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, 
                  including SSL encryption, secure data storage, two-factor authentication, and regular 
                  security audits. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UserCheck size={20} className="text-primary-500" />
                  Your Rights
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data (subject to legal requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-primary-500" />
                  Cookies and Tracking
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. 
                  These help us remember your preferences, analyze site traffic, and improve our services. 
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-gray-400 leading-relaxed">
                  For privacy-related inquiries, please contact our Data Protection Officer:
                </p>
                <div className="mt-4 p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-white">Email: privacy@varlixo.com</p>
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








