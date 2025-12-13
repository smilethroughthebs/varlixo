'use client';

/**
 * ==============================================
 * VARLIXO - PROFILE SETTINGS PAGE
 * ==============================================
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ethers } from 'ethers';
import bs58 from 'bs58';
import {
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Shield,
  Bell,
  Sun,
  Moon,
  Save,
  Camera,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useAuthStore, useLanguageStore } from '@/app/lib/store';
import { languages } from '@/app/lib/i18n';
import { authAPI, walletAPI } from '@/app/lib/api';

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

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  occupation: z.string().optional(),
  annualIncomeRange: z.string().optional(),
  sourceOfFunds: z.string().optional(),
  investmentExperience: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [is2faBusy, setIs2faBusy] = useState(false);
  const [show2faPanel, setShow2faPanel] = useState(false);
  const [twoFaQr, setTwoFaQr] = useState<string | null>(null);
  const [twoFaSecret, setTwoFaSecret] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to US
  const [phoneDialCode, setPhoneDialCode] = useState(countries[0].dialCode);
  const [linkedWallets, setLinkedWallets] = useState<any[]>([]);
  const [walletsBusy, setWalletsBusy] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      country: user?.country || '',
      occupation: user?.occupation || '',
      annualIncomeRange: user?.annualIncomeRange || '',
      sourceOfFunds: user?.sourceOfFunds || '',
      investmentExperience: user?.investmentExperience || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      // In production, call API to update profile
      updateUser(data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLinkedWallets = async () => {
    try {
      const res = await walletAPI.listLinkedWallets();
      const data = res.data.data || res.data;
      setLinkedWallets(data.wallets || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadLinkedWallets();
    }
  }, [activeTab]);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const connectEvmWallet = async () => {
    const anyWindow = window as any;
    if (!anyWindow?.ethereum) {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

      if (isMobile) {
        const dappUrl = window.location.href.replace(/^https?:\/\//, '');
        const deepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        toast.error('MetaMask not detected in this browser. Opening in MetaMask...');
        window.location.href = deepLink;
        return;
      }

      toast.error(
        'MetaMask not found. Install the MetaMask browser extension, or open this site inside the MetaMask app browser.',
      );
      return;
    }

    setWalletsBusy(true);
    try {
      const provider = new ethers.providers.Web3Provider(anyWindow.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const nonceRes = await walletAPI.requestLinkedWalletNonce({
        chain: 'evm',
        address,
      });
      const nonceData = nonceRes.data.data || nonceRes.data;

      if (nonceData.verified) {
        toast.success('Wallet already linked');
        await loadLinkedWallets();
        return;
      }

      const message = nonceData.message;
      const signature = await signer.signMessage(message);

      await walletAPI.verifyLinkedWallet({
        chain: 'evm',
        address,
        signature,
      });

      toast.success('EVM wallet linked');
      await loadLinkedWallets();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to link EVM wallet');
    } finally {
      setWalletsBusy(false);
    }
  };

  const connectSolanaWallet = async () => {
    const anyWindow = window as any;
    const solana = anyWindow?.solana;
    if (!solana) {
      toast.error('Solana wallet not found. Please install Phantom.');
      return;
    }

    if (!solana?.isPhantom) {
      toast.error('Please use Phantom wallet for Solana connection.');
      return;
    }

    setWalletsBusy(true);
    try {
      await solana.connect();
      const address = solana.publicKey?.toString();
      if (!address) {
        throw new Error('Unable to read Solana public key');
      }

      const nonceRes = await walletAPI.requestLinkedWalletNonce({
        chain: 'solana',
        address,
      });
      const nonceData = nonceRes.data.data || nonceRes.data;

      if (nonceData.verified) {
        toast.success('Wallet already linked');
        await loadLinkedWallets();
        return;
      }

      const message = nonceData.message;
      const messageBytes = new TextEncoder().encode(message);

      if (!solana.signMessage) {
        throw new Error('This wallet does not support message signing');
      }

      const signed = await solana.signMessage(messageBytes, 'utf8');
      const sigBytes = signed?.signature || signed;
      const signature = bs58.encode(sigBytes);

      await walletAPI.verifyLinkedWallet({
        chain: 'solana',
        address,
        signature,
      });

      toast.success('Solana wallet linked');
      await loadLinkedWallets();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to link Solana wallet');
    } finally {
      setWalletsBusy(false);
    }
  };

  const removeLinkedWallet = async (id: string) => {
    setWalletsBusy(true);
    try {
      await walletAPI.removeLinkedWallet(id);
      toast.success('Wallet removed');
      await loadLinkedWallets();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove wallet');
    } finally {
      setWalletsBusy(false);
    }
  };

  const handleStart2FA = async () => {
    if (user?.twoFactorEnabled) {
      setShow2faPanel((prev) => !prev);
      return;
    }

    setIs2faBusy(true);
    try {
      const response = await authAPI.setup2FA();
      const result = response.data.data || response.data;
      setTwoFaQr(result.qrCode);
      setTwoFaSecret(result.secret);
      setShow2faPanel(true);
      toast.success('Scan the QR code with your authenticator app and enter the 6-digit code.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to start 2FA setup';
      toast.error(message);
    } finally {
      setIs2faBusy(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFaCode || twoFaCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIs2faBusy(true);
    try {
      const response = await authAPI.enable2FA(twoFaCode);
      const result = response.data.data || response.data;

      updateUser({ twoFactorEnabled: true });
      toast.success(result?.message || 'Two-factor authentication enabled successfully');

      setShow2faPanel(false);
      setTwoFaQr(null);
      setTwoFaSecret(null);
      setTwoFaCode('');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to enable 2FA';
      toast.error(message);
    } finally {
      setIs2faBusy(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFaCode || twoFaCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIs2faBusy(true);
    try {
      const response = await authAPI.disable2FA(twoFaCode);
      const result = response.data.data || response.data;

      updateUser({ twoFactorEnabled: false });
      toast.success(result?.message || 'Two-factor authentication disabled successfully');

      setShow2faPanel(false);
      setTwoFaQr(null);
      setTwoFaSecret(null);
      setTwoFaCode('');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to disable 2FA';
      toast.error(message);
    } finally {
      setIs2faBusy(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-700 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500/10 text-primary-500'
                : 'text-gray-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-3xl font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center border-2 border-dark-900 hover:bg-dark-600 transition-colors">
                    <Camera size={14} className="text-gray-400" />
                  </button>
                </div>
                <div>
                  <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Member since {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Connected Wallets</h3>
                  <p className="text-gray-400 text-sm mt-1">Link wallets by signing a verification message</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={connectEvmWallet} isLoading={walletsBusy}>
                  Connect MetaMask (EVM)
                </Button>
                <Button type="button" variant="outline" onClick={connectSolanaWallet} isLoading={walletsBusy}>
                  Connect Phantom (Solana)
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {linkedWallets.length === 0 ? (
                  <div className="text-sm text-gray-500">No wallets linked yet.</div>
                ) : (
                  linkedWallets.map((w: any) => (
                    <div
                      key={w._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-dark-800 rounded-xl"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium capitalize">{w.chain}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              w.verified ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                            }`}
                          >
                            {w.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 font-mono break-all">{truncateAddress(w.address)}</div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeLinkedWallet(w._id)}
                          isLoading={walletsBusy}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6 pt-0 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  leftIcon={<User size={18} />}
                  error={profileErrors.firstName?.message}
                  {...registerProfile('firstName')}
                />
                <Input
                  label="Last Name"
                  error={profileErrors.lastName?.message}
                  {...registerProfile('lastName')}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                leftIcon={<Mail size={18} />}
                hint="Email cannot be changed"
              />

              {!user?.emailVerified && (
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/30">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-yellow-100">
                    <AlertTriangle size={14} className="text-yellow-400" />
                    <span>Email not verified. Please verify to unlock all features.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!user?.email) return;
                      try {
                        await authAPI.resendVerification(user.email);
                        toast.success('Verification email sent. Check your inbox.');
                      } catch (error: any) {
                        toast.error(error?.response?.data?.message || 'Failed to resend verification email');
                      }
                    }}
                  >
                    Resend verification email
                  </Button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder={`${phoneDialCode} 234 567 8900`}
                  leftIcon={<Phone size={18} />}
                  error={profileErrors.phone?.message}
                  {...registerProfile('phone')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="date"
                      {...registerProfile('dateOfBirth')}
                      className="w-full pl-10 pr-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  {profileErrors.dateOfBirth && (
                    <p className="text-sm text-error mt-1">{profileErrors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                      {...registerProfile('country')}
                      onChange={(e) => {
                        registerProfile('country').onChange(e);
                        const country = countries.find(c => c.code === e.target.value);
                        if (country) {
                          setSelectedCountry(country);
                          setPhoneDialCode(country.dialCode);
                        }
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
                  {profileErrors.country && (
                    <p className="text-sm text-error mt-1">{profileErrors.country.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Occupation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                      {...registerProfile('occupation')}
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Annual Income Range
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                      {...registerProfile('annualIncomeRange')}
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Source of Funds
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                      {...registerProfile('sourceOfFunds')}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Investment Experience
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <select
                    {...registerProfile('investmentExperience')}
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

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isLoading}>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 pt-0 space-y-4">
              <Input
                label="Current Password"
                type="password"
                leftIcon={<Lock size={18} />}
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />
              <Input
                label="New Password"
                type="password"
                leftIcon={<Lock size={18} />}
                error={passwordErrors.newPassword?.message}
                hint="Min 8 chars with uppercase, lowercase, number & symbol"
                {...registerPassword('newPassword')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                leftIcon={<Lock size={18} />}
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Two-Factor Auth */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  user?.twoFactorEnabled
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleStart2FA}
                isLoading={is2faBusy}
              >
                <Shield size={18} className="mr-2" />
                {user?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </Button>

              {show2faPanel && (
                <div className="mt-4 p-4 rounded-xl bg-dark-800 border border-dark-700 space-y-4">
                  {!user?.twoFactorEnabled && (
                    <>
                      {twoFaQr && (
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={twoFaQr}
                              alt="2FA QR Code"
                              className="w-40 h-40 rounded-lg border border-dark-600 bg-dark-900"
                            />
                          </div>
                          <div className="text-sm text-gray-400 space-y-2">
                            <p>Scan this QR code with Google Authenticator or any TOTP app.</p>
                            {twoFaSecret && (
                              <p className="break-all text-xs text-gray-500">
                                Secret: <span className="font-mono">{twoFaSecret}</span>
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              After scanning, enter the 6-digit code from your app to confirm.
                            </p>
                          </div>
                        </div>
                      )}
                      <Input
                        label="2FA Code"
                        type="text"
                        placeholder="Enter 6-digit code from your app"
                        maxLength={6}
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => {
                            setShow2faPanel(false);
                            setTwoFaQr(null);
                            setTwoFaSecret(null);
                            setTwoFaCode('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleEnable2FA} isLoading={is2faBusy}>
                          Enable 2FA
                        </Button>
                      </div>
                    </>
                  )}

                  {user?.twoFactorEnabled && (
                    <>
                      <p className="text-sm text-gray-400">
                        To disable 2FA, enter a current 6-digit code from your authenticator app.
                      </p>
                      <Input
                        label="2FA Code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => {
                            setShow2faPanel(false);
                            setTwoFaCode('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={handleDisable2FA}
                          isLoading={is2faBusy}
                        >
                          Disable 2FA
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Active Sessions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Globe size={20} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Current Session</p>
                      <p className="text-gray-500 text-sm">Windows • Chrome • Active now</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Activity Log */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Security Activity Log</h3>
                <button className="text-sm text-primary-400 hover:text-primary-300">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { action: 'Login successful', location: 'Lagos, Nigeria', device: 'Chrome • Windows', time: '2 hours ago', type: 'success' },
                  { action: 'Password changed', location: 'Lagos, Nigeria', device: 'Chrome • Windows', time: '3 days ago', type: 'warning' },
                  { action: 'Login attempt blocked', location: 'Unknown', device: 'Firefox • Linux', time: '5 days ago', type: 'error' },
                  { action: '2FA enabled', location: 'Lagos, Nigeria', device: 'Chrome • Windows', time: '1 week ago', type: 'success' },
                  { action: 'Withdrawal approved', location: 'Lagos, Nigeria', device: 'Mobile Safari', time: '2 weeks ago', type: 'success' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-dark-800/50 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'success' 
                        ? 'bg-green-500/10 text-green-500' 
                        : activity.type === 'warning' 
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {activity.type === 'success' ? (
                        <CheckCircle size={16} />
                      ) : activity.type === 'warning' ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-500 text-sm truncate">
                        {activity.device} • {activity.location}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Display Language
              </label>
              <p className="text-gray-500 text-sm mb-4">
                Choose the language you want to use throughout the platform
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      language === lang.code
                        ? 'bg-primary-500/10 border-primary-500 text-white'
                        : 'bg-dark-800 border-dark-700 text-gray-400 hover:border-dark-600 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-medium">{lang.nativeName}</p>
                      <p className="text-xs text-gray-500">{lang.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              <p className="text-gray-500 text-sm mb-4">
                Choose your preferred color theme
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button className="flex items-center gap-3 p-4 rounded-xl border bg-primary-500/10 border-primary-500 text-white">
                  <Moon size={20} />
                  <span className="font-medium">Dark</span>
                </button>
                <button className="flex items-center gap-3 p-4 rounded-xl border bg-dark-800 border-dark-700 text-gray-400 hover:border-dark-600 cursor-not-allowed opacity-50">
                  <Sun size={20} />
                  <span className="font-medium">Light</span>
                  <span className="text-xs text-primary-500">(Coming soon)</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Currency Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Display</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              <p className="text-gray-500 text-sm mb-4">
                Choose how amounts are displayed
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { code: 'USD', symbol: '$', name: 'US Dollar' },
                  { code: 'EUR', symbol: '€', name: 'Euro' },
                  { code: 'GBP', symbol: '£', name: 'British Pound' },
                  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
                ].map((currency) => (
                  <button
                    key={currency.code}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      currency.code === 'USD'
                        ? 'bg-primary-500/10 border-primary-500 text-white'
                        : 'bg-dark-800 border-dark-700 text-gray-400 hover:border-dark-600 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl font-bold">{currency.symbol}</span>
                    <div className="text-left">
                      <p className="font-medium">{currency.code}</p>
                      <p className="text-xs text-gray-500">{currency.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
