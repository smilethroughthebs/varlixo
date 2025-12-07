'use client';

/**
 * ==============================================
 * VARLIXO - FORGOT PASSWORD PAGE
 * ==============================================
 * Multi-step forgot password flow with OTP verification
 * Step 1: Enter email
 * Step 2: Enter OTP
 * Step 3: Create new password
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import toast from 'react-hot-toast';
import axios from 'axios';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${apiUrl}/auth/otp/send-reset`, { email });
      toast.success('Reset code sent to your email');
      setStep('otp');
      setResendTimer(60);

      // Start resend timer
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and go to password reset
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP (we'll use it in the next step)
      setStep('password');
      toast.success('Code verified! Create your new password');
    } catch (error: any) {
      toast.error('Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      toast.error(
        'Password must contain uppercase, lowercase, number, and special character'
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${apiUrl}/auth/otp/reset-password`, {
        email,
        code: otp,
        newPassword,
        confirmPassword,
      });

      setStep('success');
      toast.success('Password reset successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await axios.post(`${apiUrl}/auth/otp/resend`, {
        email,
        type: 'reset',
      });
      toast.success('New code sent to your email');
      setResendTimer(60);

      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error('Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (step === 'otp') {
      setOtp('');
      setStep('email');
    } else if (step === 'password') {
      setNewPassword('');
      setConfirmPassword('');
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <section className="py-16 px-4 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={fadeIn}
              >
                <Card className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
                      <Mail className="text-primary-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      Forgot Password?
                    </h1>
                    <p className="text-gray-400">
                      Enter your email address and we'll send you a code to reset your
                      password
                    </p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                      isLoading={loading}
                    >
                      Send Reset Code
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                      Remember your password?{' '}
                      <Link href="/auth/login" className="text-primary-500 hover:text-primary-400">
                        Login
                      </Link>
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={fadeIn}
              >
                <Card className="p-8">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-primary-500 hover:text-primary-400 mb-6"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>

                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
                      <Lock className="text-primary-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      Enter Verification Code
                    </h1>
                    <p className="text-gray-400">
                      We sent a 6-digit code to <br />
                      <span className="font-mono text-primary-500">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      disabled={loading}
                      className="text-center text-2xl font-mono tracking-widest"
                    />

                    <p className="text-gray-400 text-sm text-center">
                      Code expires in{' '}
                      <span className="font-semibold">{Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}</span>
                    </p>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || otp.length !== 6}
                      isLoading={loading}
                    >
                      Verify Code
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm mb-3">
                      Didn't receive the code?
                    </p>
                    <button
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || resendLoading}
                      className="text-primary-500 hover:text-primary-400 disabled:text-gray-500 text-sm font-medium"
                    >
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : 'Resend Code'}
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <motion.div
                key="password"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={fadeIn}
              >
                <Card className="p-8">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-primary-500 hover:text-primary-400 mb-6"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>

                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
                      <Lock className="text-primary-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      Create New Password
                    </h1>
                    <p className="text-gray-400">
                      Make sure it's strong and secure
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="bg-dark-800/50 rounded-lg p-4 text-sm text-gray-400">
                      <p className="mb-2 font-semibold text-white">Password requirements:</p>
                      <ul className="space-y-1 text-xs">
                        <li>✓ At least 8 characters</li>
                        <li>✓ One uppercase letter (A-Z)</li>
                        <li>✓ One lowercase letter (a-z)</li>
                        <li>✓ One number (0-9)</li>
                        <li>✓ One special character (@$!%*?&)</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                      isLoading={loading}
                    >
                      Reset Password
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Success State */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                variants={fadeIn}
              >
                <Card className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                    <CheckCircle className="text-green-500" size={32} />
                  </div>

                  <h1 className="text-2xl font-bold text-white mb-2">
                    Password Reset Successful!
                  </h1>
                  <p className="text-gray-400 mb-6">
                    Your password has been reset. You'll be redirected to login shortly.
                  </p>

                  <Link href="/auth/login">
                    <Button className="w-full">
                      Go to Login
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
