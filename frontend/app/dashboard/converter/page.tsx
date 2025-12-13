'use client';

/**
 * ==============================================
 * VARLIXO - CRYPTO CONVERTER PAGE
 * ==============================================
 * Convert between cryptocurrencies and fiat currencies
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownUp,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Info,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { marketAPI } from '@/app/lib/api';

// Supported currencies
const currencies = [
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', icon: '🪙', type: 'crypto' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', icon: '💎', type: 'crypto' },
  { code: 'USDT', name: 'Tether', symbol: '₮', icon: '💵', type: 'crypto' },
  { code: 'BNB', name: 'BNB', symbol: 'BNB', icon: '🔶', type: 'crypto' },
  { code: 'SOL', name: 'Solana', symbol: 'SOL', icon: '☀️', type: 'crypto' },
  { code: 'XRP', name: 'XRP', symbol: 'XRP', icon: '💧', type: 'crypto' },
  { code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', icon: '🐕', type: 'crypto' },
  { code: 'ADA', name: 'Cardano', symbol: '₳', icon: '🔷', type: 'crypto' },
  { code: 'USD', name: 'US Dollar', symbol: '$', icon: '🇺🇸', type: 'fiat' },
  { code: 'EUR', name: 'Euro', symbol: '€', icon: '🇪🇺', type: 'fiat' },
  { code: 'GBP', name: 'British Pound', symbol: '£', icon: '🇬🇧', type: 'fiat' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', icon: '🇳🇬', type: 'fiat' },
];

// Mock exchange rates (will be updated from API)
const defaultRates: { [key: string]: number } = {
  BTC: 67234.50,
  ETH: 3521.80,
  USDT: 1.00,
  BNB: 584.20,
  SOL: 142.65,
  XRP: 0.52,
  DOGE: 0.12,
  ADA: 0.45,
  USD: 1,
  EUR: 1.08,
  GBP: 1.26,
  NGN: 0.00063,
};

export default function ConverterPage() {
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [fromAmount, setFromAmount] = useState('1');
  const [rates, setRates] = useState(defaultRates);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [recentConversions, setRecentConversions] = useState<any[]>([]);

  // Fetch live rates
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const response = await marketAPI.getCryptos(10);
      const data = response.data?.data?.data || response.data?.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        const newRates: { [key: string]: number } = { ...defaultRates };
        data.forEach((crypto: any) => {
          const code = crypto.symbol?.toUpperCase();
          if (code && newRates.hasOwnProperty(code)) {
            newRates[code] = crypto.current_price || crypto.price || defaultRates[code];
          }
        });
        setRates(newRates);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.log('Using default rates');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate conversion
  const convertedAmount = useMemo(() => {
    const amount = parseFloat(fromAmount) || 0;
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const usdValue = fromCurrency === 'USD' ? amount : amount * fromRate;
    const result = toCurrency === 'USD' ? usdValue : usdValue / toRate;
    
    return result;
  }, [fromAmount, fromCurrency, toCurrency, rates]);

  // Swap currencies
  const handleSwap = () => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    setFromAmount(convertedAmount.toFixed(8));
  };

  // Add to recent conversions
  const handleConvert = () => {
    const conversion = {
      from: { currency: fromCurrency, amount: parseFloat(fromAmount) },
      to: { currency: toCurrency, amount: convertedAmount },
      rate: rates[fromCurrency] / rates[toCurrency],
      timestamp: new Date(),
    };
    setRecentConversions([conversion, ...recentConversions.slice(0, 4)]);
  };

  const getCurrency = (code: string) => currencies.find(c => c.code === code) || currencies[0];

  // Format number based on value
  const formatNumber = (num: number, currency: string) => {
    const curr = getCurrency(currency);
    if (curr.type === 'fiat') {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (num < 0.01) return num.toFixed(8);
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Crypto Converter</h1>
          <p className="text-gray-400 mt-1">Convert between cryptocurrencies and fiat currencies</p>
        </div>
        <Button
          variant="ghost"
          onClick={fetchRates}
          isLoading={isLoading}
          leftIcon={<RefreshCw size={18} />}
        >
          Refresh Rates
        </Button>
      </div>

      {/* Main Converter Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-visible">
          <div className="p-6 md:p-8">
            {/* From Section */}
            <div className="space-y-3 mb-4">
              <label className="text-sm text-gray-400">From</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white text-2xl font-semibold placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="h-full appearance-none px-4 pr-10 bg-dark-700 border border-dark-600 rounded-xl text-white font-medium focus:outline-none focus:border-primary-500 cursor-pointer min-w-[140px]"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.icon} {curr.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{getCurrency(fromCurrency).name}</span>
                <span>•</span>
                <span>1 {fromCurrency} = ${rates[fromCurrency]?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleSwap}
                className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg shadow-primary-500/30 transition-all hover:scale-110"
              >
                <ArrowDownUp size={24} />
              </button>
            </div>

            {/* To Section */}
            <div className="space-y-3 mt-4">
              <label className="text-sm text-gray-400">To</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="w-full px-4 py-4 bg-dark-800 border border-dark-700 rounded-xl text-2xl font-semibold text-primary-400">
                    {formatNumber(convertedAmount, toCurrency)}
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="h-full appearance-none px-4 pr-10 bg-dark-700 border border-dark-600 rounded-xl text-white font-medium focus:outline-none focus:border-primary-500 cursor-pointer min-w-[140px]"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.icon} {curr.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{getCurrency(toCurrency).name}</span>
                <span>•</span>
                <span>1 {toCurrency} = ${rates[toCurrency]?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="mt-6 p-4 bg-dark-700/50 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Exchange Rate</span>
                <span className="text-white font-medium">
                  1 {fromCurrency} = {formatNumber(rates[fromCurrency] / rates[toCurrency], toCurrency)} {toCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock size={14} />
                  Last Updated
                </span>
                <span className="text-gray-500">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Convert Button */}
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleConvert}
            >
              <Sparkles size={20} className="mr-2" />
              Save Conversion
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Quick Conversions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Popular Pairs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-500" />
                Popular Pairs
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-3">
              {[
                { from: 'BTC', to: 'USD' },
                { from: 'ETH', to: 'USD' },
                { from: 'BTC', to: 'ETH' },
                { from: 'SOL', to: 'USD' },
                { from: 'BNB', to: 'USD' },
              ].map((pair, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                    setFromAmount('1');
                  }}
                  className="w-full flex items-center justify-between p-3 bg-dark-700/50 hover:bg-dark-700 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCurrency(pair.from).icon}</span>
                    <span className="text-white font-medium">{pair.from}/{pair.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {formatNumber(rates[pair.from] / rates[pair.to], pair.to)}
                    </span>
                    <ArrowRight size={16} className="text-gray-600 group-hover:text-primary-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Conversions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-primary-500" />
                Recent Conversions
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              {recentConversions.length > 0 ? (
                <div className="space-y-3">
                  {recentConversions.map((conv, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {conv.from.amount.toFixed(4)} {conv.from.currency}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conv.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-gray-600" />
                      <div className="text-right">
                        <p className="text-primary-400 font-medium">
                          {formatNumber(conv.to.amount, conv.to.currency)} {conv.to.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-dark-700 rounded-full flex items-center justify-center mb-4">
                    <ArrowDownUp size={24} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500">No recent conversions</p>
                  <p className="text-gray-600 text-sm">Convert currencies above to see history</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Live Rates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} className="text-primary-500" />
              Live Crypto Rates (USD)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">Currency</th>
                  <th className="text-right py-3 px-6 text-gray-400 font-medium">Price</th>
                  <th className="text-right py-3 px-6 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {currencies.filter(c => c.type === 'crypto').map((curr) => (
                  <tr key={curr.code} className="hover:bg-dark-800/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{curr.icon}</span>
                        <div>
                          <p className="text-white font-medium">{curr.name}</p>
                          <p className="text-gray-500 text-sm">{curr.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="text-white font-semibold text-lg">
                        ${rates[curr.code]?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFromCurrency(curr.code);
                          setToCurrency('USD');
                          setFromAmount('1');
                        }}
                      >
                        Convert
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl"
      >
        <div className="flex gap-3">
          <Info size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-primary-400 font-medium">About Exchange Rates</p>
            <p className="text-gray-400 text-sm mt-1">
              Exchange rates are fetched from CoinGecko and updated every minute. 
              Actual trading rates may vary slightly due to market volatility and fees.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}









