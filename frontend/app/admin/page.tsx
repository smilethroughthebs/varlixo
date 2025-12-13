'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN LOGIN PAGE
 * ==============================================
 * Secure admin login with enhanced security features
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Fingerprint,
  Globe,
  Server,
  CheckCircle,
  Activity,
} from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { useAuthStore } from '@/app/lib/store';
import { authAPI } from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [requires2FA, setRequires2FA] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin')) {
      router.push('/admin/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  // Lock timer countdown
  useEffect(() => {
    if (lockTimer > 0) {
      const timer = setTimeout(() => setLockTimer(lockTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [lockTimer, isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error(`Too many attempts. Try again in ${lockTimer}s`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const loginData: any = {
        email: formData.email,
        password: formData.password,
      };
      
      if (formData.twoFactorCode) {
        loginData.twoFactorCode = formData.twoFactorCode;
      }
      
      const response = await authAPI.login(loginData);

      const data = response.data.data || response.data;

      if (data.requiresTwoFactor) {
        setRequires2FA(true);
        toast.success('Enter your 2FA code');
        setIsLoading(false);
        return;
      }

      const { user: userData, accessToken, refreshToken } = data;

      // Check if user is admin
      if (userData.role !== 'admin' && userData.role !== 'super_admin') {
        setError('Access denied. Administrator privileges required.');
        setLoginAttempts(prev => prev + 1);
        
        if (loginAttempts >= 2) {
          setIsLocked(true);
          setLockTimer(30);
        }
        return;
      }

      login(userData, accessToken, refreshToken);
      toast.success('Welcome back, Administrator!');
      router.push('/admin/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
      setLoginAttempts(prev => prev + 1);
      
      if (loginAttempts >= 2) {
        setIsLocked(true);
        setLockTimer(30);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get current time for display
  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#0a0a12] flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/30"
            >
              <Shield className="text-white" size={40} />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-gray-400">Secure access for administrators</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                    {loginAttempts > 0 && !isLocked && (
                      <p className="text-red-400/70 text-xs mt-1">
                        {3 - loginAttempts} attempt(s) remaining
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Lock Warning */}
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3"
                >
                  <Lock className="text-yellow-500" size={18} />
                  <p className="text-yellow-400 text-sm">
                    Account locked. Try again in <span className="font-bold">{lockTimer}s</span>
                  </p>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@varlixo.com"
                    required
                    disabled={isLocked}
                    className="w-full pl-12 pr-4 py-4 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    required
                    disabled={isLocked}
                    className="w-full pl-12 pr-12 py-4 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* 2FA Field */}
              {requires2FA && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Two-Factor Authentication Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="text"
                      value={formData.twoFactorCode}
                      onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                      placeholder="000000"
                      maxLength={6}
                      disabled={isLocked}
                      className="w-full pl-12 pr-4 py-4 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-lg font-semibold"
                isLoading={isLoading}
                disabled={isLocked}
              >
                {isLocked ? `Locked (${lockTimer}s)` : 'Access Admin Panel'}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-dark-600">
              <div className="flex items-center gap-3 p-3 bg-dark-700/30 rounded-xl">
                <Fingerprint size={20} className="text-red-500" />
                <div>
                  <p className="text-xs text-gray-400">
                    This is a restricted area. All login attempts are monitored and logged.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Site */}
          <div className="text-center mt-8">
            <a
              href="/"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              ← Return to main site
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Security Info Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-900 to-[#0f0f1a] items-center justify-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative max-w-md">
          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-400 text-sm font-medium">Secure Connection</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Platform Administration Center
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 mb-8"
          >
            Access comprehensive platform controls, user management, transaction monitoring, and system analytics.
          </motion.p>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {[
              { icon: Shield, text: 'Multi-factor Authentication' },
              { icon: Activity, text: 'Real-time Activity Monitoring' },
              { icon: Server, text: 'System Health Dashboard' },
              { icon: Globe, text: 'IP Logging & Geolocation' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-xl bg-dark-700/50 flex items-center justify-center">
                  <item.icon size={18} className="text-red-500" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-10 p-4 bg-dark-800/30 border border-dark-700 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">System Status</span>
              <span className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={14} />
                All Systems Operational
              </span>
            </div>
            <div className="text-xs text-gray-500">{currentTime}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
