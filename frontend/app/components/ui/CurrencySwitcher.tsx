'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DollarSign, Check, MapPin } from 'lucide-react';
import { useCurrencyStore } from '@/app/lib/currency-store';
import { api } from '@/app/lib/api';

interface CurrencySwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function CurrencySwitcher({ variant = 'default', className = '' }: CurrencySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [supported, setSupported] = useState<string[]>(['USD']);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { currencyCode, currencyMode, setPreferredCurrency, setCurrencyMode } = useCurrencyStore();

  useEffect(() => {
    const loadSupported = async () => {
      try {
        const res = await api.get('/currency/supported');
        const payload = res.data?.data || res.data;
        const inner = payload?.data || payload;
        const list: string[] = inner?.currencies || ['USD'];
        if (Array.isArray(list) && list.length > 0) {
          setSupported(list);
        }
      } catch {
        // ignore
      }
    };

    loadSupported();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSelect = async (code: string) => {
    await setPreferredCurrency(code);
    setIsOpen(false);
  };

  const onSelectAuto = async () => {
    await setCurrencyMode('auto');
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
        >
          <span className="text-xs font-semibold">{currencyCode}</span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-44 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50"
            >
              <div className="py-2 max-h-72 overflow-y-auto">
                <button
                  onClick={onSelectAuto}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    currencyMode === 'auto'
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <span className="font-medium inline-flex items-center gap-2">
                    <MapPin size={16} className="text-primary-500" />
                    Auto
                  </span>
                  {currencyMode === 'auto' && <Check size={16} className="text-primary-500" />}
                </button>

                {supported.map((code) => (
                  <button
                    key={code}
                    onClick={() => onSelect(code)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      currencyMode === 'manual' && currencyCode === code
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <span className="font-medium">{code}</span>
                    {currencyMode === 'manual' && currencyCode === code && (
                      <Check size={16} className="text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700/50 border border-dark-600 text-gray-300 hover:text-white hover:border-dark-500 transition-all"
      >
        <DollarSign size={18} className="text-primary-500" />
        <span className="font-semibold">{currencyCode}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-2xl shadow-xl z-50"
          >
            <div className="p-2 max-h-80 overflow-y-auto">
              <button
                onClick={onSelectAuto}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  currencyMode === 'auto'
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
              >
                <span className="font-medium inline-flex items-center gap-2">
                  <MapPin size={16} className="text-primary-500" />
                  Auto (by location)
                </span>
                {currencyMode === 'auto' && (
                  <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>

              {supported.map((code) => (
                <button
                  key={code}
                  onClick={() => onSelect(code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    currencyMode === 'manual' && currencyCode === code
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <span className="font-medium">{code}</span>
                  {currencyMode === 'manual' && currencyCode === code && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
