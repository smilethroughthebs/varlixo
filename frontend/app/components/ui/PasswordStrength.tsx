'use client';

/**
 * Password Strength Meter Component
 */

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[@$!%*?&]/.test(p) },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return 0;
    return requirements.filter((req) => req.test(password)).length;
  }, [password]);

  const getStrengthLabel = () => {
    if (strength === 0) return { text: 'Enter password', color: 'text-gray-500' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-500' };
    if (strength <= 3) return { text: 'Fair', color: 'text-yellow-500' };
    if (strength <= 4) return { text: 'Good', color: 'text-blue-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const getBarColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const strengthInfo = getStrengthLabel();

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3"
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Password strength</span>
          <span className={`text-xs font-medium ${strengthInfo.color}`}>
            {strengthInfo.text}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                level <= strength ? getBarColor() : 'bg-dark-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-2 ${
                passed ? 'text-green-500' : 'text-gray-500'
              }`}
            >
              {passed ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <X size={12} className="text-gray-600" />
              )}
              {req.label}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}









