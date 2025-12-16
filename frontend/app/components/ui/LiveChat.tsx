'use client';

/**
 * ==============================================
 * VARLIXO - LIVE CHAT WIDGET
 * ==============================================
 * Floating chat bubble with expandable chat window
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Minus,
  Paperclip,
  Smile,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/app/lib/store';
import { createSupportChatSocket, getAccessToken } from '@/app/lib/supportChatSocket';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  typing?: boolean;
}

type SupportSocketMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderKind: 'user' | 'admin';
  text: string;
  createdAt: string | Date;
};

const quickReplies = [
  'How do I deposit?',
  'Withdrawal process',
  'Investment plans',
  'KYC verification',
  'Contact support',
];

// Smart chat responses
const getBotResponse = (msg: string): string => {
  const lower = msg.toLowerCase();
  
  // Greetings
  if (lower.match(/^(hi|hello|hey|good\s*(morning|afternoon|evening))/i)) {
    const greetings = [
      'Hey there! 👋 Welcome to Varlixo support! How can I help you today?',
      'Hello! 😊 I\'m here to help. What can I assist you with?',
      'Hi! 🌟 Thanks for reaching out. What would you like to know?',
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Deposit questions
  if (lower.match(/deposit|add\s*money|fund|pay/i)) {
    return 'To make a deposit:\n\n1️⃣ Go to Dashboard → Wallet\n2️⃣ Click "Deposit"\n3️⃣ Choose: BTC, ETH, or USDT\n4️⃣ Copy the wallet address\n5️⃣ Send from your exchange/wallet\n\n⏱️ Processing: 10-30 minutes\n💰 Minimum: $100\n\nNeed help with a specific step?';
  }
  
  // Withdrawal questions
  if (lower.match(/withdraw|cash\s*out|payout|get\s*my\s*money/i)) {
    return 'Withdrawal process:\n\n1️⃣ Go to Dashboard → Wallet\n2️⃣ Click "Withdraw"\n3️⃣ Enter amount & address\n4️⃣ Confirm with 2FA\n\n⏱️ Crypto: 1-24 hours\n💰 Minimum: $50\n✨ Daily profits withdrawable anytime!\n\nAny questions about withdrawals?';
  }
  
  // Investment/plans
  if (lower.match(/invest|plan|return|profit|earn|roi/i)) {
    return 'Our investment plans:\n\n🥉 **Starter**: 1.5%/day (30 days)\nMin $100 | ~45% total return\n\n🥈 **Professional**: 2.5%/day (45 days)\nMin $5,000 | ~112% total return\n\n🥇 **Elite**: 3%/day (60 days)\nMin $25,000 | ~180% total return\n\n✅ Principal returned at end!\n\nWant me to calculate specific returns?';
  }
  
  // KYC
  if (lower.match(/kyc|verify|verification|identity|document/i)) {
    return 'KYC verification:\n\n📄 **Required:**\n• Government ID (passport/license)\n• Selfie with your ID\n\n⏱️ **Processing:** 24-48 hours\n\n✅ **Benefits:**\n• Higher limits\n• Faster withdrawals\n• Priority support\n\nStart at Dashboard → KYC!';
  }
  
  // Safety/security
  if (lower.match(/safe|secure|trust|legit|scam/i)) {
    return 'Your security is our priority! 🔒\n\n• 256-bit SSL encryption\n• 2FA authentication\n• Cold storage (95% of funds)\n• $100M insurance\n• 50,000+ happy investors\n\nWe\'ve been operating for 4+ years with 99.9% uptime. Your funds are safe!';
  }
  
  // Support/help
  if (lower.match(/support|help|contact|speak|agent|human/i)) {
    return 'Contact options:\n\n📧 Email: support@varlixo.com\n📱 WhatsApp: +1 (888) 123-4567\n💬 Live Chat: You\'re here!\n🎫 Tickets: Dashboard → Support\n\n⏱️ Response: Usually within 2 hours!\n\nHow else can I help?';
  }
  
  // Thank you
  if (lower.match(/thank|thanks|appreciate/i)) {
    return 'You\'re welcome! 😊 Happy to help! Let me know if you have any other questions. I\'m here 24/7! 🌟';
  }
  
  // Goodbye
  if (lower.match(/bye|goodbye|later/i)) {
    return 'Goodbye! 👋 Thanks for chatting. Come back anytime you need help. Happy investing! 📈';
  }
  
  // Default smart response
  return `Thanks for your message about "${msg.slice(0, 30)}${msg.length > 30 ? '...' : ''}"\n\nI can help you with:\n• 💰 Deposits & Withdrawals\n• 📈 Investment Plans\n• 🔐 KYC Verification\n• 🛡️ Security Questions\n\nOr type "support" to contact our team directly!`;
};

export default function LiveChat() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! 👋 Welcome to Varlixo! I\'m your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<(text?: string) => void>(() => undefined);

  const socketRef = useRef<ReturnType<typeof createSupportChatSocket> | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const getResponse = (userMessage: string): string => {
    return getBotResponse(userMessage);
  };

  const shouldUseSupportChat =
    isAuthenticated &&
    !!user &&
    user.role !== 'admin' &&
    user.role !== 'super_admin' &&
    !!getAccessToken();

  const ensureSupportConversation = (initialMessage?: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (conversationIdRef.current) {
      if (initialMessage) {
        socket.emit('support:message', {
          conversationId: conversationIdRef.current,
          text: initialMessage,
        });
      }
      return;
    }

    socket.emit('support:client_start', { message: initialMessage });
  };

  const handleSend = (text?: string) => {
    const rawText = (text ?? input).trim();
    if (!rawText) return;

    if (shouldUseSupportChat && socketRef.current) {
      setInput('');

      ensureSupportConversation(rawText);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: rawText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(rawText),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1500);
  };

  useEffect(() => {
    sendRef.current = handleSend;
  }, [input, shouldUseSupportChat]);

  useEffect(() => {
    if (!shouldUseSupportChat) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      conversationIdRef.current = null;
      return;
    }

    const socket = createSupportChatSocket();
    socketRef.current = socket;

    const onConnect = () => {
      socket.emit('support:client_start', {});
    };

    const onConversation = (data: { conversationId?: string }) => {
      if (data?.conversationId) {
        conversationIdRef.current = data.conversationId;
      }
    };

    const onMessages = (data: SupportSocketMessage[]) => {
      if (!Array.isArray(data)) return;

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const mapped: Message[] = data
          .filter((m) => !existingIds.has(m.id))
          .map((m) => ({
            id: m.id,
            text: m.text,
            sender: m.senderKind === 'admin' ? 'agent' : 'user',
            timestamp: new Date(m.createdAt),
          }));

        return [...prev, ...mapped].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    };

    const onMessage = (m: SupportSocketMessage) => {
      if (!m?.id) return;

      setMessages((prev) => {
        const exists = prev.some((x) => x.id === m.id);
        if (exists) return prev;

        const msg: Message = {
          id: m.id,
          text: m.text,
          sender: m.senderKind === 'admin' ? 'agent' : 'user',
          timestamp: new Date(m.createdAt),
        };

        return [...prev, msg].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    };

    socket.on('connect', onConnect);
    socket.on('support:conversation', onConversation);
    socket.on('support:messages', onMessages);
    socket.on('support:message', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('support:conversation', onConversation);
      socket.off('support:messages', onMessages);
      socket.off('support:message', onMessage);
      socket.disconnect();
      socketRef.current = null;
      conversationIdRef.current = null;
    };
  }, [shouldUseSupportChat]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      setIsOpen(true);
      setIsMinimized(false);

      const customEvent = event as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message;
      if (message) {
        sendRef.current(message);
      }
    };

    window.addEventListener('varlixo:open-livechat', onOpen);
    return () => window.removeEventListener('varlixo:open-livechat', onOpen);
  }, []);

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg shadow-primary-500/30 flex items-center justify-center text-white z-50 group"
          >
            <MessageCircle size={22} className="sm:hidden" />
            <MessageCircle size={28} className="hidden sm:block" />
            {/* Pulse animation */}
            <span className="absolute w-full h-full rounded-full bg-primary-500 animate-ping opacity-30" />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : 'min(500px, 70vh)',
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-[380px] bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Varlixo Support</h3>
                  <p className="text-white/70 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Minus size={18} className="text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900/50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender === 'user'
                              ? 'bg-primary-500'
                              : message.sender === 'agent'
                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                : 'bg-dark-700'
                          }`}
                        >
                          {message.sender === 'user' ? (
                            <User size={14} className="text-white" />
                          ) : message.sender === 'agent' ? (
                            <Sparkles size={14} className="text-white" />
                          ) : (
                            <Bot size={14} className="text-primary-400" />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : message.sender === 'agent'
                                ? 'bg-red-500/10 text-gray-100 border border-red-500/20 rounded-bl-md'
                                : 'bg-dark-700 text-gray-200 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-white/60' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center">
                        <Bot size={14} className="text-primary-400" />
                      </div>
                      <div className="bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 border-t border-dark-700 bg-dark-800">
                    <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => handleSend(reply)}
                          className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 text-xs rounded-full transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-dark-700 bg-dark-800">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
                      <Paperclip size={20} />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:text-gray-600 text-white rounded-xl transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

