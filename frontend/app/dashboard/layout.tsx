'use client';

/**
 * ==============================================
 * VARLIXO - DASHBOARD LAYOUT
 * ==============================================
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  History,
  Users,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Bot,
  ArrowLeftRight,
  Calculator,
  Coins,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useUIStore } from '@/app/lib/store';
import { authAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/dashboard/investments', icon: TrendingUp, label: 'Investments' },
  { href: '/dashboard/transactions', icon: History, label: 'Transactions' },
  { href: '/dashboard/advisor', icon: Bot, label: 'AI Advisor', badge: 'NEW' },
  { href: '/dashboard/converter', icon: ArrowLeftRight, label: 'Crypto Converter' },
  { href: '/dashboard/referrals', icon: Users, label: 'Referrals' },
  { href: '/dashboard/kyc', icon: Shield, label: 'KYC Verification' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { href: '/dashboard/support', icon: HelpCircle, label: 'Support' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, wallet, isAuthenticated, logout, setUser, setWallet } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        const data = response.data.data;
        setUser(data.user);
        setWallet(data.wallet);
      } catch (error) {
        logout();
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 h-screen transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full w-72 bg-dark-800 border-r border-dark-700 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-dark-700">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold text-white">Varlixo</span>
            </Link>
          </div>

          {/* Balance Card */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-xl p-4 border border-primary-500/20">
              <p className="text-sm text-gray-400 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-white">
                ${(wallet?.mainBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">Pending</p>
                  <p className="text-yellow-500">${(wallet?.pendingBalance || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Earnings</p>
                  <p className="text-green-500">${(wallet?.totalEarnings || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            <ul className="space-y-1">
              {sidebarLinks.map((link: any) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-primary-500/10 text-primary-500 border-l-2 border-primary-500'
                          : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                      )}
                    >
                      <link.icon size={20} />
                      <span className="font-medium flex-1">{link.label}</span>
                      {link.badge && (
                        <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-dark-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-error/10 hover:text-error transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={clsx('transition-all duration-300', sidebarOpen ? 'lg:ml-72' : 'lg:ml-0')}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left - Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-white lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Logo */}
            <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
            </Link>

            {/* Right - Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications (bell links to notifications page) */}
              <Link href="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={clsx(
                      'text-gray-400 transition-transform hidden md:block',
                      isProfileOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-2">
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings size={18} />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}



