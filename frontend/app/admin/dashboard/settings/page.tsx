'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN SETTINGS PAGE
 * ==============================================
 * Admin panel settings and configuration
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Shield, Bell, Mail, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import toast from 'react-hot-toast';
import { adminAPI } from '@/app/lib/api';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Varlixo',
    adminEmail: 'admin@varlixo.com',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorRequired: false,
    minDeposit: 100,
    minWithdrawal: 50,
    withdrawalFee: 2,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminAPI.getSettings();
        const payload = res?.data;
        const data = payload?.data ?? payload;

        setSettings((prev) => ({
          ...prev,
          ...(data || {}),
        }));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load settings');
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminAPI.updateSettings({
        siteName: settings.siteName,
        adminEmail: settings.adminEmail,
        maintenanceMode: settings.maintenanceMode,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        twoFactorRequired: settings.twoFactorRequired,
        minDeposit: settings.minDeposit,
        minWithdrawal: settings.minWithdrawal,
        withdrawalFee: settings.withdrawalFee,
      });
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="text-primary-500" />
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSave} leftIcon={<Save size={18} />} disabled={isSaving}>
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} className="text-primary-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-400">Disable public access to the site</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} className="text-primary-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive email alerts for important events</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-400">Receive SMS alerts for critical events</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.smsNotifications ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.smsNotifications ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Security Settings */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-primary-500" />
              Security
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Require 2FA for All Users</p>
                <p className="text-sm text-gray-400">Force two-factor authentication</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, twoFactorRequired: !settings.twoFactorRequired })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.twoFactorRequired ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.twoFactorRequired ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Transaction Limits */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail size={20} className="text-primary-500" />
              Transaction Limits
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Deposit ($)</label>
              <input
                type="number"
                value={settings.minDeposit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minDeposit: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0,
                  })
                }
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Withdrawal ($)</label>
              <input
                type="number"
                value={settings.minWithdrawal}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minWithdrawal: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0,
                  })
                }
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Withdrawal Fee (%)</label>
              <input
                type="number"
                value={settings.withdrawalFee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    withdrawalFee: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0,
                  })
                }
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
