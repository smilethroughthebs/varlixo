'use client';

/**
 * VARLIXO - PUBLIC SUPPORT PAGE
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { 
  MessageCircle, Mail, Phone, HelpCircle, 
  ArrowRight, Clock, FileText, Users, Send 
} from 'lucide-react';

const supportOptions = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    action: 'Start Chat',
    color: 'from-primary-500 to-emerald-500',
    available: true,
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email and we\'ll respond within 24 hours',
    action: 'support@varlixo.com',
    color: 'from-blue-500 to-cyan-500',
    href: 'mailto:support@varlixo.com',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Call us Mon-Fri, 9am-6pm EST',
    action: '+1 (234) 567-890',
    color: 'from-purple-500 to-pink-500',
    href: 'tel:+1234567890',
  },
  {
    icon: Send,
    title: 'WhatsApp',
    description: 'Message us on WhatsApp for quick support',
    action: 'Chat on WhatsApp',
    color: 'from-green-500 to-green-400',
    href: 'https://wa.me/1234567890',
  },
];

const quickLinks = [
  { icon: HelpCircle, title: 'FAQ', description: 'Find answers to common questions', href: '/faq' },
  { icon: FileText, title: 'Documentation', description: 'Learn how to use Varlixo', href: '/how-it-works' },
  { icon: Users, title: 'Community', description: 'Join our Telegram community', href: 'https://t.me/varlixo' },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="text-primary-500" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              How Can We Help?
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our support team is here to assist you 24/7. Choose your preferred contact method below.
            </p>
          </motion.div>

          {/* Support Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6 mb-16"
          >
            {supportOptions.map((option, index) => (
              <Card 
                key={option.title}
                className="p-6 hover:border-primary-500/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <option.icon className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                      {option.available && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{option.description}</p>
                    {option.href ? (
                      <a 
                        href={option.href}
                        target={option.href.startsWith('http') ? '_blank' : undefined}
                        rel={option.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary-400 font-medium hover:text-primary-300 inline-flex items-center gap-1"
                      >
                        {option.action}
                        <ArrowRight size={16} />
                      </a>
                    ) : (
                      <button className="text-primary-400 font-medium hover:text-primary-300 inline-flex items-center gap-1">
                        {option.action}
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Resources</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <Link key={link.title} href={link.href}>
                  <Card className="p-6 text-center hover:border-primary-500/30 transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center mx-auto mb-4">
                      <link.icon className="text-primary-500" size={24} />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{link.title}</h3>
                    <p className="text-gray-400 text-sm">{link.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Response Times */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Expected Response Times</h2>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                    <Clock size={20} />
                    <span className="font-semibold">Live Chat</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">~2 min</p>
                  <p className="text-gray-500 text-sm">Average response time</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                    <Clock size={20} />
                    <span className="font-semibold">Email</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">~4 hours</p>
                  <p className="text-gray-500 text-sm">During business hours</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
                    <Clock size={20} />
                    <span className="font-semibold">Support Ticket</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">~24 hours</p>
                  <p className="text-gray-500 text-sm">Complex inquiries</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CTA for logged in users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400 mb-4">Already have an account?</p>
            <Link href="/dashboard/support">
              <Button size="lg" rightIcon={<ArrowRight size={20} />}>
                Go to Support Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}






