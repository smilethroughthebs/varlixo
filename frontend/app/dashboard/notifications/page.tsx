'use client';

/**
 * ==============================================
 * VARLIXO - USER NOTIFICATIONS PAGE
 * ==============================================
 * View and manage user notifications
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign,
  Settings,
  Trash2,
  Check,
} from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Mock notifications - replace with API call
const mockNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'Investment Activated',
    message: 'Your investment of $5,000 in Prime Growth plan has been activated successfully.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    icon: TrendingUp,
  },
  {
    id: '2',
    type: 'info',
    title: 'Daily Profit Credited',
    message: 'You received $475 as daily profit from your Elite Advance investment.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    icon: DollarSign,
  },
  {
    id: '3',
    type: 'success',
    title: 'Deposit Approved',
    message: 'Your deposit of $10,000 has been approved and credited to your wallet.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    icon: CheckCircle,
  },
  {
    id: '4',
    type: 'warning',
    title: 'KYC Verification Required',
    message: 'Complete your KYC verification to unlock higher investment limits.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    icon: AlertCircle,
  },
  {
    id: '5',
    type: 'info',
    title: 'New Investment Plan Available',
    message: 'Check out our new Flash Promo plan with 25% returns every 12 hours!',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    icon: Info,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success('Marked as read');
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400 bg-green-500/10';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'error':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-blue-400 bg-blue-500/10';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="text-primary-500" />
            Notifications
          </h1>
          <p className="text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={markAllAsRead} leftIcon={<Check size={18} />}>
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" onClick={clearAll} leftIcon={<Trash2 size={18} />}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400 text-lg">No notifications</p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:border-primary-500/50 ${
                  !notification.read ? 'bg-dark-800/80 border-primary-500/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{notification.title}</h3>
                        <p className="text-gray-400 text-sm">{notification.message}</p>
                        <p className="text-gray-600 text-xs mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
