'use client';

/**
 * ==============================================
 * VARLIXO - REGISTER PAGE
 * ==============================================
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, ArrowRight, Check, Gift, Calendar, Globe, Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import PasswordStrength from '@/app/components/ui/PasswordStrength';
import { authAPI, referralAPI } from '@/app/lib/api';

// Country data with dial codes
const countries = [
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { code: 'AE', name: 'UAE', dialCode: '+971' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
];

// Options for dropdowns
const occupationOptions = [
  'Employed', 'Self-employed', 'Business Owner', 'Student', 'Retired', 'Unemployed', 'Other'
];

const incomeRanges = [
  'Under $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000 - $250,000', 
  '$250,000 - $500,000', '$500,000 - $1,000,000', 'Over $1,000,000'
];

const sourceOfFundsOptions = [
  'Salary', 'Business', 'Savings', 'Investment Returns', 'Inheritance', 'Gift', 'Other'
];

const investmentExperienceOptions = [
  'None', 'Beginner', 'Intermediate', 'Pro'
];

// Validation schema
const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    country: z.string().min(1, 'Country is required'),
    occupation: z.string().optional(),
    annualIncomeRange: z.string().optional(),
    sourceOfFunds: z.string().optional(),
    investmentExperience: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
    marketingOptIn: z.boolean().optional(),
  })
  .refine((data) => {
    const dob = new Date(data.dateOfBirth);
    if (Number.isNaN(dob.getTime())) return false;
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    return age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
  }, {
    message: 'You must be at least 18 years old',
    path: ['dateOfBirth'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [referrer, setReferrer] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to US
  const [phoneDialCode, setPhoneDialCode] = useState(countries[0].dialCode);

  // Quick mount for faster perceived loading
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle country change
  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setPhoneDialCode(country.dialCode);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit', // Only validate on submit for better performance
    defaultValues: {
      agreeTerms: false,
    },
  });

  // Check for referral code in URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setValue('referralCode', ref);
      validateReferralCode(ref);
    }
  }, [searchParams, setValue]);

  const validateReferralCode = async (code: string) => {
    try {
      const response = await referralAPI.validateCode(code);
      if (response.data.data.valid) {
        setReferrer(response.data.data.referrer.firstName);
      }
    } catch (error) {
      // Invalid code - silently ignore
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const phoneRaw = (data.phone || '').trim();
      const normalizedPhone =
        phoneRaw.length === 0
          ? undefined
          : phoneRaw.startsWith('+')
            ? phoneRaw
            : `${phoneDialCode}${phoneRaw.replace(/\D/g, '')}`;

      await authAPI.register({
        ...data,
        phone: normalizedPhone,
      });
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/auth/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
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
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-800 to-dark-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Your Investment Journey
            </h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Join Varlixo and gain access to premium investment opportunities with industry-leading returns.
            </p>

            <div className="space-y-4">
              {[
                'Up to 15% monthly returns',
                'Bank-grade security',
                'Instant withdrawals',
                '24/7 customer support',
                'Referral rewards program',
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Check size={14} className="text-primary-500" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md py-8"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-white">Varlixo</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 mb-8">
            Start your investment journey in minutes
          </p>

          {/* Referral Banner */}
          {referrer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Gift className="text-primary-500" size={24} />
                <div>
                  <p className="text-white font-medium">Referral Bonus Active!</p>
                  <p className="text-sm text-gray-400">
                    Referred by <span className="text-primary-400">{referrer}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                leftIcon={<User size={20} />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              leftIcon={<Mail size={20} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder={`${phoneDialCode} 234 567 8900`}
              leftIcon={<Phone size={20} />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className="w-full pl-10 pr-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-sm text-error mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <select
                    {...register('country')}
                    onChange={(e) => {
                      register('country').onChange(e);
                      handleCountryChange(e.target.value);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.country && (
                  <p className="text-sm text-error mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Occupation (Optional)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <select
                    {...register('occupation')}
                    className="w-full pl-10 pr-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Select occupation</option>
                    {occupationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Annual Income Range (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <select
                    {...register('annualIncomeRange')}
                    className="w-full pl-10 pr-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Select income range</option>
                    {incomeRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source of Funds (Optional)
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <select
                    {...register('sourceOfFunds')}
                    className="w-full pl-10 pr-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Select source</option>
                    {sourceOfFundsOptions.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Investment Experience (Optional)
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <select
                    {...register('investmentExperience')}
                    className="w-full pl-10 pr-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Select experience</option>
                    {investmentExperienceOptions.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                leftIcon={<Lock size={20} />}
                error={errors.password?.message}
                {...register('password', {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              <PasswordStrength password={passwordValue} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              leftIcon={<Lock size={20} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Input
              label="Referral Code (Optional)"
              placeholder="Enter referral code"
              leftIcon={<Gift size={20} />}
              error={errors.referralCode?.message}
              {...register('referralCode')}
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                {...register('agreeTerms')}
              />
              <span className="text-sm text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-500 hover:text-primary-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-500 hover:text-primary-400">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-sm text-error">{errors.agreeTerms.message}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                {...register('marketingOptIn')}
              />
              <span className="text-sm text-gray-400">
                I would like to receive marketing emails and updates
              </span>
            </label>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight size={20} />}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary-500 hover:text-primary-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
