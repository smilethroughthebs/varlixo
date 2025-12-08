'use client';

/**
 * VARLIXO - COOKIE POLICY PAGE
 */

import { motion } from 'framer-motion';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import { Cookie, Settings, BarChart3, Shield, CheckCircle } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
              <Cookie className="text-primary-500" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Cookie Policy</h1>
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
                  <Cookie size={20} className="text-primary-500" />
                  What Are Cookies?
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Cookies are small text files that are placed on your computer or mobile device when you 
                  visit our website. They help us provide you with a better experience by remembering your 
                  preferences and enabling certain functionality.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-primary-500" />
                  Types of Cookies We Use
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-dark-700/50 rounded-xl">
                    <h3 className="text-white font-semibold mb-2">Essential Cookies</h3>
                    <p className="text-gray-400 text-sm">
                      Required for the website to function properly. They enable basic features like 
                      page navigation, secure areas access, and session management.
                    </p>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-xl">
                    <h3 className="text-white font-semibold mb-2">Performance Cookies</h3>
                    <p className="text-gray-400 text-sm">
                      Help us understand how visitors interact with our website by collecting 
                      anonymous information about page visits and errors.
                    </p>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-xl">
                    <h3 className="text-white font-semibold mb-2">Functionality Cookies</h3>
                    <p className="text-gray-400 text-sm">
                      Remember your preferences such as language settings, theme choices, 
                      and login information for a personalized experience.
                    </p>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-xl">
                    <h3 className="text-white font-semibold mb-2">Marketing Cookies</h3>
                    <p className="text-gray-400 text-sm">
                      Used to track visitors across websites to display relevant advertisements. 
                      These are only used with your consent.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-green-500" />
                  Managing Cookies
                </h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  You can control and/or delete cookies as you wish. You can delete all cookies that 
                  are already on your computer and you can set most browsers to prevent them from 
                  being placed. However, if you do this, you may have to manually adjust some preferences.
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Chrome: Settings → Privacy and Security → Cookies</li>
                  <li>Firefox: Options → Privacy & Security → Cookies</li>
                  <li>Safari: Preferences → Privacy → Cookies</li>
                  <li>Edge: Settings → Privacy & Services → Cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-gray-400 leading-relaxed">
                  If you have questions about our use of cookies, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-white">Email: privacy@varlixo.com</p>
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








