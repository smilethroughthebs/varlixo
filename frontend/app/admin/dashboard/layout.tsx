'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN DASHBOARD LAYOUT
 * ==============================================
 * Protected layout for admin panel with sidebar navigation
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Shield,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Search,
  Activity,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/app/lib/store';
import toast from 'react-hot-toast';

const adminLinks = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/dashboard/users', icon: Users, label: 'Users' },
  { href: '/admin/dashboard/deposits', icon: ArrowDownRight, label: 'Deposits' },
  { href: '/admin/dashboard/withdrawals', icon: ArrowUpRight, label: 'Withdrawals' },
  { href: '/admin/dashboard/kyc', icon: Shield, label: 'KYC Requests' },
  { href: '/admin/dashboard/investments', icon: TrendingUp, label: 'Investments' },
  { href: '/admin/dashboard/plans', icon: Activity, label: 'Investment Plans' },
  { href: '/admin/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { href: '/admin/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin authentication - allow both 'admin' and 'super_admin' roles
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    
    if (!isAuthenticated || !isAdmin) {
      router.push('/admin');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, user?.role]); // Only depend on role, not entire user object

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="h-full bg-dark-900 border-r border-dark-700 flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-dark-700">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              {sidebarOpen && (
                <div>
                  <span className="text-lg font-bold text-white">Varlixo</span>
                  <span className="text-xs text-red-400 block">Admin Panel</span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-red-500/10 text-red-500'
                          : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                      )}
                    >
                      <link.icon size={20} />
                      {sidebarOpen && <span className="font-medium">{link.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-4 border-t border-dark-700 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx('transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-20')}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-dark-950/80 backdrop-blur-xl border-b border-dark-700">
          <div className="flex items-center justify-between px-6 h-16">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search users, transactions..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
                <Activity className="text-green-500" size={16} />
                <span className="text-sm text-green-400">System Online</span>
              </div>

              {/* Notifications */}
              <Link href="/admin/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                    A
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-white">Admin</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={clsx('text-gray-400 transition-transform', isProfileOpen && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-2">
                        <Link
                          href="/admin/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        >
                          <Settings size={18} />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}



