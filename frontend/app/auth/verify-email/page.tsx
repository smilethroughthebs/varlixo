'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { authAPI } from '@/app/lib/api';
import Button from '@/app/components/ui/Button';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email, please wait...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully. You can now log in to your account.');
        // Optional auto-redirect after a short delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || 'Verification link is invalid or has expired.';
        setStatus('error');
        setMessage(apiMessage);
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-800 border border-dark-700 rounded-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          {status === 'loading' && <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-12 h-12 text-emerald-500" />}
          {status === 'error' && <AlertTriangle className="w-12 h-12 text-yellow-500" />}
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && 'Email Verified'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="text-gray-400 mb-8 text-sm leading-relaxed">{message}</p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/auth/login')} className="w-full">
            Go to Login
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
