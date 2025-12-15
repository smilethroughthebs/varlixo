'use client';

/**
 * ==============================================
 * VARLIXO - SUPPORT PAGE
 * ==============================================
 * Contact support, submit tickets, and access help resources
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Paperclip,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useAuthStore } from '@/app/lib/store';
import toast from 'react-hot-toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// FAQ data
const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Creating an account is simple. Click the "Register" button, fill in your email, create a strong password, and verify your email. You can then complete KYC to unlock all features.',
      },
      {
        q: 'What is KYC and why is it required?',
        a: 'KYC (Know Your Customer) is a verification process that helps us ensure the security of your account and comply with regulations. It involves verifying your identity with government-issued documents.',
      },
      {
        q: 'How long does account verification take?',
        a: 'Typically, KYC verification is completed within 24-48 hours. In some cases, it may take up to 72 hours during high volume periods.',
      },
    ],
  },
  {
    category: 'Deposits & Withdrawals',
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept major cryptocurrencies (Bitcoin, Ethereum, USDT) and bank transfers. Crypto deposits are instant, while bank transfers may take 1-3 business days.',
      },
      {
        q: 'What is the minimum deposit amount?',
        a: 'The minimum deposit is $100 for crypto and $500 for bank transfers. There is no maximum limit for verified accounts.',
      },
      {
        q: 'How long do withdrawals take?',
        a: 'Crypto withdrawals are processed within 24 hours. Bank transfers take 2-5 business days depending on your bank.',
      },
      {
        q: 'Are there any withdrawal fees?',
        a: 'We charge a small network fee for crypto withdrawals. Bank transfers are free for amounts over $1,000.',
      },
    ],
  },
  {
    category: 'Investments',
    questions: [
      {
        q: 'How do investment plans work?',
        a: 'Our investment plans generate daily returns based on the plan you choose. Returns are automatically credited to your wallet daily.',
      },
      {
        q: 'Can I withdraw my investment early?',
        a: 'Early withdrawal is possible but may incur a fee depending on the plan terms. Contact support for assistance.',
      },
      {
        q: 'What is the expected ROI?',
        a: 'Returns vary by plan, ranging from 1% to 5% daily. Higher tier plans offer better returns with longer lock periods.',
      },
    ],
  },
  {
    category: 'Security',
    questions: [
      {
        q: 'Is my investment safe?',
        a: 'We employ bank-level security including 2FA, encryption, and cold storage for crypto assets. Your funds are protected by multiple security layers.',
      },
      {
        q: 'How do I enable 2FA?',
        a: 'Go to Settings > Security > Two-Factor Authentication. You can use either email codes or an authenticator app like Google Authenticator.',
      },
      {
        q: 'What if I lose access to my account?',
        a: 'Use the "Forgot Password" feature to reset your password. If you lose 2FA access, contact support with your KYC documents for account recovery.',
      },
    ],
  },
];

// Ticket categories
const ticketCategories = [
  'Account Issues',
  'Deposits & Withdrawals',
  'Investments',
  'KYC Verification',
  'Technical Support',
  'Other',
];

// Ticket status badge
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string; icon: any; text: string }> = {
    open: { color: 'bg-blue-500/20 text-blue-400', icon: AlertCircle, text: 'Open' },
    in_progress: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock, text: 'In Progress' },
    resolved: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, text: 'Resolved' },
    closed: { color: 'bg-gray-500/20 text-gray-400', icon: XCircle, text: 'Closed' },
  };

  const config = configs[status] || configs.open;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

export default function SupportPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'new'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    category: '',
    subject: '',
    message: '',
    attachments: [] as File[],
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const openLiveChat = (message?: string) => {
    window.dispatchEvent(new CustomEvent('varlixo:open-livechat', { detail: { message } }));
  };

  const fetchTickets = async () => {
    try {
      // Tickets will be loaded from API when implemented
      // const response = await supportAPI.getTickets();
      // setTickets(response.data.data || []);
      setTickets([]);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
    }
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.category || !newTicket.subject || !newTicket.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // const formData = new FormData();
      // formData.append('category', newTicket.category);
      // formData.append('subject', newTicket.subject);
      // formData.append('message', newTicket.message);
      // newTicket.attachments.forEach(file => formData.append('attachments', file));
      // await supportAPI.createTicket(formData);

      toast.success('Ticket submitted successfully');
      setActiveTab('tickets');
      setNewTicket({ category: '', subject: '', message: '', attachments: [] });
      fetchTickets();
    } catch (error) {
      toast.error('Failed to submit ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (ticketId: string, message: string) => {
    try {
      // await supportAPI.replyToTicket(ticketId, message);
      toast.success('Reply sent');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const filteredFaq = searchQuery
    ? faqCategories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.questions.length > 0)
    : faqCategories;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Help & Support
        </h1>
        <p className="text-gray-400">
          Find answers to common questions or get in touch with our support team
        </p>
      </motion.div>

      {/* Quick Contact Cards */}
      <motion.div variants={fadeInUp} className="grid md:grid-cols-4 gap-4">
        <a
          href="https://wa.me/18881234567?text=Hello%2C%20I%20need%20help%20with%20my%20Varlixo%20account"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card className="hover:border-green-500/50 transition-colors cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-500">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">WhatsApp</h3>
                <p className="text-sm text-gray-400 mb-2">Quick messaging</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online Now
                </p>
              </div>
            </div>
          </Card>
        </a>

        <Card
          className="hover:border-primary-500/50 transition-colors cursor-pointer"
          onClick={() => openLiveChat()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openLiveChat();
            }
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <MessageCircle className="text-primary-500" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-gray-400 mb-2">In-app support</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online 24/7
              </p>
            </div>
          </div>
        </Card>

        <a href="mailto:support@varlixo.com">
          <Card className="hover:border-blue-500/50 transition-colors cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Mail className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Email</h3>
                <p className="text-sm text-gray-400 mb-2">support@varlixo.com</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  Within 24h
                </p>
              </div>
            </div>
          </Card>
        </a>

        <a href="tel:+18881234567">
          <Card className="hover:border-purple-500/50 transition-colors cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Phone className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Phone</h3>
                <p className="text-sm text-gray-400 mb-2">+1 (888) 123-4567</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  9am-6pm EST
                </p>
              </div>
            </div>
          </Card>
        </a>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={fadeInUp}>
        <div className="flex gap-2 border-b border-dark-700 pb-4">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'faq'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <HelpCircle size={18} className="inline mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <FileText size={18} className="inline mr-2" />
            My Tickets
            {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary-500/30 rounded-full text-xs">
                {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <Plus size={18} className="inline mr-2" />
            New Ticket
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'faq' && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* FAQ Categories */}
            {filteredFaq.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>

                <div className="space-y-2">
                  {category.questions.map((faq, index) => {
                    const faqKey = `${category.category}-${index}`;
                    const isExpanded = expandedFaq === faqKey;

                    return (
                      <div
                        key={index}
                        className="border border-dark-600 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : faqKey)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-700 transition-colors"
                        >
                          <span className="text-white font-medium pr-4">{faq.q}</span>
                          {isExpanded ? (
                            <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                          )}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-gray-400 border-t border-dark-600">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <Button size="sm" onClick={() => setActiveTab('new')} leftIcon={<Plus size={16} />}>
                  New Ticket
                </Button>
              </CardHeader>

              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'border-primary-500 bg-primary-500/5'
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                      onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-500 text-sm">{ticket.id}</span>
                            <StatusBadge status={ticket.status} />
                          </div>
                          <h4 className="text-white font-medium">{ticket.subject}</h4>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{ticket.category}</p>

                      {/* Expanded Ticket Details */}
                      <AnimatePresence>
                        {selectedTicket?.id === ticket.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-dark-600 overflow-hidden"
                          >
                            {/* Messages */}
                            <div className="space-y-4 mb-4">
                              {ticket.messages.map((msg: any, index: number) => (
                                <div
                                  key={index}
                                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-xl ${
                                      msg.sender === 'user'
                                        ? 'bg-primary-500/20 text-white'
                                        : 'bg-dark-700 text-gray-300'
                                    }`}
                                  >
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(msg.time).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Reply Form */}
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Type your reply..."
                                  className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                      handleReply(ticket.id, (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                                <Button size="sm" leftIcon={<Send size={16} />}>
                                  Send
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No support tickets</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Create a ticket to get help from our team
                  </p>
                  <Button onClick={() => setActiveTab('new')} leftIcon={<Plus size={18} />}>
                    Create Ticket
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Ticket</CardTitle>
              </CardHeader>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category *
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value="">Select a category</option>
                    {ticketCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Attachments (optional)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newTicket.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg"
                      >
                        <Paperclip size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <button
                          onClick={() =>
                            setNewTicket({
                              ...newTicket,
                              attachments: newTicket.attachments.filter((_, i) => i !== index),
                            })
                          }
                          className="text-gray-500 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-dark-600 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors">
                    <Paperclip size={20} className="text-gray-400" />
                    <span className="text-gray-400">Add attachments</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setNewTicket({ ...newTicket, attachments: [...newTicket.attachments, ...files] });
                      }}
                    />
                  </label>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setActiveTab('tickets')}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitTicket}
                    isLoading={isLoading}
                    leftIcon={<Send size={18} />}
                  >
                    Submit Ticket
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



