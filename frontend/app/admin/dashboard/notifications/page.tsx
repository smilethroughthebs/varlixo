'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN NOTIFICATIONS PAGE
 * ==============================================
 * View and manage admin notifications
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Users,
  DollarSign,
  Shield,
  TrendingUp,
  Check,
  Trash2,
} from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Mock admin notifications
const mockNotifications = [
  {
    id: '1',
    type: 'urgent',
    title: 'New Withdrawal Request',
    message: 'User John Doe requested withdrawal of $15,000. Requires approval.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    icon: DollarSign,
    action: '/admin/dashboard/withdrawals',
  },
  {
    id: '2',
    type: 'warning',
    title: 'KYC Verification Pending',
    message: '5 new KYC submissions awaiting review.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    icon: Shield,
    action: '/admin/dashboard/kyc',
  },
  {
    id: '3',
    type: 'info',
    title: 'New User Registration',
    message: '12 new users registered in the last 24 hours.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    icon: Users,
  },
  {
    id: '4',
    type: 'success',
    title: 'High Value Investment',
    message: 'User invested $50,000 in Infinity Pro plan.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    icon: TrendingUp,
  },
  {
    id: '5',
    type: 'urgent',
    title: 'System Alert',
    message: 'Database backup completed successfully.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    icon: AlertTriangle,
  },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.type === 'urgent' && !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.type === 'urgent';
    return true;
  });

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'success':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="text-primary-500" />
            Admin Notifications
          </h1>
          <p className="text-gray-400 mt-1">
            {urgentCount > 0 && (
              <span className="text-red-400 font-semibold">{urgentCount} urgent · </span>
            )}
            {unreadCount} unread notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} leftIcon={<Check size={18} />}>
            Mark all as read
          </Button>
        )}
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
        <button
          onClick={() => setFilter('urgent')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'urgent'
              ? 'bg-red-500 text-white'
              : 'bg-dark-800 text-gray-400 hover:text-white'
          }`}
        >
          Urgent ({urgentCount})
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
                  !notification.read ? 'bg-dark-800/80' : ''
                } ${getTypeColor(notification.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{notification.title}</h3>
                          {notification.type === 'urgent' && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-gray-600 text-xs">{formatTime(notification.timestamp)}</p>
                          {notification.action && (
                            <a
                              href={notification.action}
                              className="text-primary-400 text-xs hover:text-primary-300 font-medium"
                            >
                              View Details →
                            </a>
                          )}
                        </div>
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
