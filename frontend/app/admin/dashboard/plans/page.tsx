'use client';

/**
 * ==============================================
 * VARLIXO - ADMIN PLANS MANAGEMENT PAGE
 * ==============================================
 * Admin panel for creating and managing investment plans
 * with country-specific limits
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Globe, 
  DollarSign,
  Save,
  X,
  Check,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Money from '@/app/components/ui/Money';
import toast from 'react-hot-toast';
import api, { adminAPI } from '@/app/lib/api';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Country data (30 countries, excluding Nigeria)
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IN', name: 'India' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'UAE' },
  { code: 'TR', name: 'Turkey' },
  { code: 'EG', name: 'Egypt' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
];

interface InvestmentPlan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  dailyReturnRate: number;
  totalReturnRate: number;
  durationDays: number;
  status: 'active' | 'inactive' | 'coming_soon';
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  marketLinked?: boolean;
  marketAssetId?: string;
  marketBaseDailyRate?: number;
  marketAlpha?: number;
  marketMinDailyRate?: number;
  marketMaxDailyRate?: number;
  countryLimits?: Array<{
    country: string;
    minInvestment: number;
    maxInvestment: number;
  }>;
  availableCountries?: string[];
}

interface CountryLimit {
  country: string;
  minInvestment: string;
  maxInvestment: string;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryLimits, setCountryLimits] = useState<CountryLimit[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    minInvestment: '',
    maxInvestment: '',
    dailyReturnRate: '',
    totalReturnRate: '',
    durationDays: '',
    category: 'stocks',
    riskLevel: 'medium',
    status: 'active',
    marketLinked: false,
    marketAssetId: '',
    marketBaseDailyRate: '',
    marketAlpha: '',
    marketMinDailyRate: '',
    marketMaxDailyRate: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await adminAPI.getPlans();
      setPlans(response.data.data?.plans || []);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      minInvestment: '',
      maxInvestment: '',
      dailyReturnRate: '',
      totalReturnRate: '',
      durationDays: '',
      category: 'stocks',
      riskLevel: 'medium',
      status: 'active',
      marketLinked: false,
      marketAssetId: '',
      marketBaseDailyRate: '',
      marketAlpha: '',
      marketMinDailyRate: '',
      marketMaxDailyRate: '',
    });
    setCountryLimits([]);
    setAvailableCountries([]);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        ...formData,
        minInvestment: parseFloat(formData.minInvestment),
        maxInvestment: parseFloat(formData.maxInvestment),
        dailyReturnRate: parseFloat(formData.dailyReturnRate),
        totalReturnRate: parseFloat(formData.totalReturnRate),
        durationDays: parseInt(formData.durationDays),
        marketLinked: Boolean(formData.marketLinked),
        marketAssetId: formData.marketAssetId?.trim() || undefined,
        marketBaseDailyRate: formData.marketBaseDailyRate !== '' ? parseFloat(formData.marketBaseDailyRate) : undefined,
        marketAlpha: formData.marketAlpha !== '' ? parseFloat(formData.marketAlpha) : undefined,
        marketMinDailyRate: formData.marketMinDailyRate !== '' ? parseFloat(formData.marketMinDailyRate) : undefined,
        marketMaxDailyRate: formData.marketMaxDailyRate !== '' ? parseFloat(formData.marketMaxDailyRate) : undefined,
        countryLimits: countryLimits.map(limit => ({
          country: limit.country,
          minInvestment: parseFloat(limit.minInvestment),
          maxInvestment: parseFloat(limit.maxInvestment),
        })).filter(limit => !isNaN(limit.minInvestment) && !isNaN(limit.maxInvestment)),
        availableCountries: availableCountries.length > 0 ? availableCountries : [],
      };

      if (editingPlan) {
        await adminAPI.updatePlan(editingPlan._id, planData);
        toast.success('Plan updated successfully');
      } else {
        await adminAPI.createPlan(planData);
        toast.success('Plan created successfully');
      }

      setShowCreateModal(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      minInvestment: plan.minInvestment.toString(),
      maxInvestment: plan.maxInvestment.toString(),
      dailyReturnRate: plan.dailyReturnRate.toString(),
      totalReturnRate: plan.totalReturnRate.toString(),
      durationDays: plan.durationDays.toString(),
      category: plan.category,
      riskLevel: plan.riskLevel,
      status: plan.status,
      marketLinked: Boolean(plan.marketLinked),
      marketAssetId: plan.marketAssetId || '',
      marketBaseDailyRate: typeof plan.marketBaseDailyRate === 'number' ? String(plan.marketBaseDailyRate) : '',
      marketAlpha: typeof plan.marketAlpha === 'number' ? String(plan.marketAlpha) : '',
      marketMinDailyRate: typeof plan.marketMinDailyRate === 'number' ? String(plan.marketMinDailyRate) : '',
      marketMaxDailyRate: typeof plan.marketMaxDailyRate === 'number' ? String(plan.marketMaxDailyRate) : '',
    });
    
    if (plan.countryLimits) {
      setCountryLimits(plan.countryLimits.map(limit => ({
        country: limit.country,
        minInvestment: limit.minInvestment.toString(),
        maxInvestment: limit.maxInvestment.toString(),
      })));
    }

    setAvailableCountries(Array.isArray(plan.availableCountries) ? plan.availableCountries : []);
    
    setShowCreateModal(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await adminAPI.deletePlan(planId);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const addCountryLimit = () => {
    setCountryLimits([...countryLimits, { country: '', minInvestment: '', maxInvestment: '' }]);
  };

  const removeCountryLimit = (index: number) => {
    setCountryLimits(countryLimits.filter((_, i) => i !== index));
  };

  const updateCountryLimit = (index: number, field: keyof CountryLimit, value: string) => {
    const newLimits = [...countryLimits];
    newLimits[index][field] = value;
    setCountryLimits(newLimits);
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Plans</h1>
          <p className="text-gray-400">Manage investment plans and country-specific limits</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          leftIcon={<Plus size={20} />}
        >
          Create Plan
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={20} />}
          />
        </div>
      </div>

      {/* Plans List */}
      <div className="grid gap-4">
        {filteredPlans.map((plan) => (
          <Card key={plan._id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    plan.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Min/Max:</span>
                    <p className="text-white">
                      <Money valueUsd={plan.minInvestment} className="text-white" showUsdEquivalent={false} /> -{' '}
                      <Money valueUsd={plan.maxInvestment} className="text-white" showUsdEquivalent={false} />
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Daily Return:</span>
                    <p className="text-green-400">{plan.dailyReturnRate}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="text-white">{plan.durationDays} days</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Risk:</span>
                    <p className="text-orange-400">{plan.riskLevel}</p>
                  </div>
                </div>
                {plan.countryLimits && plan.countryLimits.length > 0 && (
                  <div className="mt-3 p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={16} className="text-blue-400" />
                      <span className="text-sm text-blue-400">Country-specific limits ({plan.countryLimits.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {plan.countryLimits.slice(0, 3).map((limit, index) => (
                        <span key={index} className="text-xs bg-dark-700 px-2 py-1 rounded">
                          {countries.find(c => c.code === limit.country)?.name || limit.country}: ${limit.minInvestment}-${limit.maxInvestment}
                        </span>
                      ))}
                      {plan.countryLimits.length > 3 && (
                        <span className="text-xs bg-dark-700 px-2 py-1 rounded">
                          +{plan.countryLimits.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                  leftIcon={<Edit size={16} />}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(plan._id)}
                  leftIcon={<Trash2 size={16} />}
                  className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  leftIcon={<X size={20} />}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="plan-name"
                  required
                />
              </div>

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />

              {/* Investment Parameters */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Min Investment ($)"
                  type="number"
                  value={formData.minInvestment}
                  onChange={(e) => setFormData({...formData, minInvestment: e.target.value})}
                  required
                />
                <Input
                  label="Max Investment ($)"
                  type="number"
                  value={formData.maxInvestment}
                  onChange={(e) => setFormData({...formData, maxInvestment: e.target.value})}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Daily Return Rate (%)"
                  type="number"
                  step="0.01"
                  value={formData.dailyReturnRate}
                  onChange={(e) => setFormData({...formData, dailyReturnRate: e.target.value})}
                  required
                />
                <Input
                  label="Total Return Rate (%)"
                  type="number"
                  step="0.01"
                  value={formData.totalReturnRate}
                  onChange={(e) => setFormData({...formData, totalReturnRate: e.target.value})}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Duration (days)"
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="stocks">Stocks</option>
                    <option value="crypto">Crypto</option>
                    <option value="forex">Forex</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="commodities">Commodities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({...formData, riskLevel: e.target.value as any})}
                    className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>

              <div className="p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">Country availability</p>
                    <p className="text-gray-400 text-sm">
                      If none are selected, the plan is available globally.
                    </p>
                  </div>
                  {availableCountries.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAvailableCountries([])}
                      className="text-xs text-gray-300 hover:text-white underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {countries.map((c) => {
                    const checked = availableCountries.includes(c.code);
                    return (
                      <label
                        key={c.code}
                        className="flex items-center gap-2 text-sm text-gray-300 bg-dark-800/60 border border-dark-600 rounded-lg px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAvailableCountries((prev) => Array.from(new Set([...prev, c.code])));
                            } else {
                              setAvailableCountries((prev) => prev.filter((x) => x !== c.code));
                            }
                          }}
                          className="h-4 w-4 rounded border-dark-500 bg-dark-600 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Selected: {availableCountries.length === 0 ? 'Global' : `${availableCountries.length} countries`}
                </p>
              </div>

              <div className="p-4 bg-dark-700 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Market-linked payouts</p>
                    <p className="text-gray-400 text-sm">Adjust daily rate based on asset price movement</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.marketLinked)}
                    onChange={(e) => setFormData({ ...formData, marketLinked: e.target.checked })}
                    className="h-5 w-5 rounded border-dark-500 bg-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                </div>

                {formData.marketLinked ? (
                  <div className="space-y-4">
                    <Input
                      label="Market Asset ID (CoinGecko)"
                      value={formData.marketAssetId}
                      onChange={(e) => setFormData({ ...formData, marketAssetId: e.target.value })}
                      placeholder="e.g. bitcoin, ethereum"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Base Daily Rate (%)"
                        type="number"
                        step="0.01"
                        value={formData.marketBaseDailyRate}
                        onChange={(e) => setFormData({ ...formData, marketBaseDailyRate: e.target.value })}
                        placeholder="e.g. 1.2"
                      />
                      <Input
                        label="Alpha (multiplier)"
                        type="number"
                        step="0.01"
                        value={formData.marketAlpha}
                        onChange={(e) => setFormData({ ...formData, marketAlpha: e.target.value })}
                        placeholder="e.g. 0.1"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Min Daily Rate (%)"
                        type="number"
                        step="0.01"
                        value={formData.marketMinDailyRate}
                        onChange={(e) => setFormData({ ...formData, marketMinDailyRate: e.target.value })}
                        placeholder="e.g. 0"
                      />
                      <Input
                        label="Max Daily Rate (%)"
                        type="number"
                        step="0.01"
                        value={formData.marketMaxDailyRate}
                        onChange={(e) => setFormData({ ...formData, marketMaxDailyRate: e.target.value })}
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Country-Specific Limits */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Globe size={20} />
                    Country-Specific Limits
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCountryLimit}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Country Limit
                  </Button>
                </div>

                {countryLimits.length === 0 ? (
                  <div className="p-4 bg-dark-700 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">No country-specific limits added. This plan will use default limits for all countries.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {countryLimits.map((limit, index) => (
                      <div key={index} className="grid md:grid-cols-4 gap-3 p-4 bg-dark-700 rounded-lg">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Country</label>
                          <select
                            value={limit.country}
                            onChange={(e) => updateCountryLimit(index, 'country', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Select country</option>
                            {countries.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Min Investment"
                          type="number"
                          value={limit.minInvestment}
                          onChange={(e) => updateCountryLimit(index, 'minInvestment', e.target.value)}
                          placeholder="0"
                        />
                        <Input
                          label="Max Investment"
                          type="number"
                          value={limit.maxInvestment}
                          onChange={(e) => updateCountryLimit(index, 'maxInvestment', e.target.value)}
                          placeholder="0"
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCountryLimit(index)}
                            leftIcon={<Trash2 size={16} />}
                            className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftIcon={<Save size={20} />}
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
