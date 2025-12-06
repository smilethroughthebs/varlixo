/**
 * Seed Varlixo Investment Plans
 * Creates unique investment plans for the platform
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// NOTE: The backend is TypeScript; compiled `dist/` may not exist locally.
// Use a flexible Mongoose model (strict: false) so this script can run
// without building the project. The model targets the `investmentplans`
// collection used by the backend `InvestmentPlan` model.

// Varlixo unique plans
const plans = [
  {
    name: 'Momentum',
    slug: 'momentum',
    description: 'Quick entry plan for agile investors building momentum',
    shortDescription: 'Fast returns, short duration',
    status: 'active',
    minInvestment: 50,
    maxInvestment: 2999,
    dailyReturnRate: 1.2,
    totalReturnRate: 36,
    durationDays: 30,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'low',
    category: 'crypto',
    icon: '🚀',
    color: '#FF6B6B',
    sortOrder: 1,
    isFeatured: false,
    isPopular: false,
    features: ['30-day duration', 'Daily payouts', 'Low capital required', '24/7 support', 'Auto-reinvest option'],
    referralBonusPercent: 5,
    maxActiveInvestments: 5,
    totalSlots: 1000,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Velocity',
    slug: 'velocity',
    description: 'Balanced growth plan for steady wealth accumulation',
    shortDescription: 'Optimal growth, flexible terms',
    status: 'active',
    minInvestment: 3000,
    maxInvestment: 19999,
    dailyReturnRate: 2.1,
    totalReturnRate: 105,
    durationDays: 50,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'medium',
    category: 'crypto',
    icon: '⚡',
    color: '#4ECDC4',
    sortOrder: 2,
    isFeatured: true,
    isPopular: true,
    features: ['50-day duration', 'Enhanced returns', 'Weekly reports', 'Priority support', 'Compound option', 'Risk management'],
    referralBonusPercent: 7,
    maxActiveInvestments: 3,
    totalSlots: 500,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Apex',
    slug: 'apex',
    description: 'Premium plan for elite investors seeking maximum wealth generation',
    shortDescription: 'Maximum returns, VIP treatment',
    status: 'active',
    minInvestment: 20000,
    maxInvestment: null, // Unlimited
    dailyReturnRate: 3.5,
    totalReturnRate: 245,
    durationDays: 70,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'high',
    category: 'crypto',
    icon: '👑',
    color: '#FFD93D',
    sortOrder: 3,
    isFeatured: false,
    isPopular: false,
    features: ['70-day duration', 'Maximum returns', 'VIP concierge', 'Personal manager', 'Daily insights', 'Early withdrawal option', 'Exclusive network', 'Priority everything'],
    referralBonusPercent: 10,
    maxActiveInvestments: 2,
    totalSlots: 100,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Surge',
    slug: 'surge',
    description: 'Explosive growth opportunity for bold investors',
    shortDescription: 'Limited slots, ultra-high returns',
    status: 'active',
    minInvestment: 10000,
    maxInvestment: 50000,
    dailyReturnRate: 4.0,
    totalReturnRate: 120,
    durationDays: 30,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'very_high',
    category: 'crypto',
    icon: '🔥',
    color: '#FF1493',
    sortOrder: 4,
    isFeatured: false,
    isPopular: false,
    features: ['30-day sprint', 'Explosive returns', 'Limited availability', 'Exclusive access', 'Instant payouts', 'Premium analytics'],
    referralBonusPercent: 8,
    maxActiveInvestments: 1,
    totalSlots: 50,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
];

async function seedPlans() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create a flexible model so we don't need the compiled TS model
    const planSchema = new mongoose.Schema({}, { strict: false, collection: 'investmentplans' });
    const Model = mongoose.model('InvestmentPlan', planSchema);

    // Clear existing plans
    await Model.deleteMany({});
    console.log('🗑️  Cleared existing plans');

    // Insert new plans
    const result = await Model.insertMany(plans);
    console.log(`\n✅ Successfully created ${result.length} investment plans:\n`);

    result.forEach((plan, idx) => {
      console.log(`${idx + 1}. ${plan.name}`);
      console.log(`   Daily Return: ${plan.dailyReturnRate}% | Duration: ${plan.durationDays} days | Total: ${plan.totalReturnRate}%`);
      console.log(`   Investment: $${plan.minInvestment} - ${plan.maxInvestment || 'Unlimited'}`);
      console.log(`   Referral Bonus: ${plan.referralBonusPercent}%\n`);
    });

    console.log('🎉 Plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error.message);
    process.exit(1);
  }
}

seedPlans();
