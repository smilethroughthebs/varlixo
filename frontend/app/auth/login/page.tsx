'use client';

/**
 * ==============================================
 * VARLIXO - LOGIN PAGE
 * ==============================================
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { authAPI } from '@/app/lib/api';
import { useAuthStore } from '@/app/lib/store';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
  emailOtp: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [requiresEmailOtp, setRequiresEmailOtp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  // Quick mount for faster perceived loading
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit', // Only validate on submit for better performance
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const emailToUse = requiresEmailOtp ? pendingEmail : data.email;
      const passwordToUse = requiresEmailOtp ? pendingPassword : data.password;

      if (!requiresEmailOtp) {
        setPendingEmail(data.email);
        setPendingPassword(data.password);
      }

      const response = await authAPI.login({
        email: emailToUse,
        password: passwordToUse,
        twoFactorCode: data.twoFactorCode,
        emailOtp: data.emailOtp,
      });
      const result = response.data.data || response.data;

      if (result.requiresTwoFactor) {
        setRequires2FA(true);
        setRequiresEmailOtp(false);
        toast.success('Enter your 2FA code');
        setIsLoading(false);
        return;
      }

      if (result.requiresEmailOtp) {
        setRequiresEmailOtp(true);
        toast.success('Enter the 6-digit code sent to your email');
        setIsLoading(false);
        return;
      }

      // Successful login
      login(result.user, result.accessToken, result.refreshToken);
      toast.success('Welcome back!');
      
      // Redirect based on role
      if (result.user.role === 'admin' || result.user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendLoginOtp = async () => {
    const email = requiresEmailOtp ? pendingEmail : getValues('email');
    if (!email) {
      toast.error('Enter your email first');
      return;
    }
    try {
      await authAPI.resendOtp(email, 'login');
      toast.success('Login code resent');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend code';
      toast.error(message);
    }
  };

  const resendVerificationEmail = async () => {
    const email = requiresEmailOtp ? pendingEmail : getValues('email');
    if (!email) {
      toast.error('Enter your email first');
      return;
    }
    try {
      await authAPI.resendVerification(email);
      toast.success('Verification email sent');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(message);
    }
  };

  // Show instant skeleton while mounting
  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-white">Varlixo</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">
            Sign in to access your investment dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              leftIcon={<Mail size={20} />}
              error={errors.email?.message}
              disabled={requiresEmailOtp}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock size={20} />}
              error={errors.password?.message}
              disabled={requiresEmailOtp}
              {...register('password')}
            />

            {requires2FA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input
                  label="2FA Code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  leftIcon={<Shield size={20} />}
                  maxLength={6}
                  error={errors.twoFactorCode?.message}
                  {...register('twoFactorCode')}
                />
              </motion.div>
            )}

            {requiresEmailOtp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input
                  label="Email OTP"
                  type="text"
                  placeholder="Enter 6-digit code"
                  leftIcon={<Shield size={20} />}
                  maxLength={6}
                  error={errors.emailOtp?.message}
                  {...register('emailOtp')}
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={resendLoginOtp}
                    className="text-xs text-primary-500 hover:text-primary-400"
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={resendVerificationEmail}
                    className="text-xs text-primary-500 hover:text-primary-400"
                  >
                    Resend verification email
                  </button>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight size={20} />}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary-500 hover:text-primary-400 font-medium"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-800 to-dark-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-glow">
              <span className="text-6xl font-bold text-white">V</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Growing Your Wealth
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              Join thousands of investors earning daily returns with our secure platform.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
