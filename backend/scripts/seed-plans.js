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

// Varlixo updated investment plans (as requested)
const plans = [
  {
    name: 'Starter Yield',
    slug: 'starter-yield',
    description: 'Perfect for beginners. Get started with just $100 and earn 7% daily returns.',
    shortDescription: '7% daily for 2 days',
    status: 'active',
    minInvestment: 100,
    maxInvestment: 1999,
    dailyReturnRate: 7,
    totalReturnRate: 14,
    durationDays: 2,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'low',
    category: 'crypto',
    icon: '🌱',
    color: '#10B981',
    sortOrder: 1,
    isFeatured: false,
    isPopular: false,
    features: ['2-day duration', '7% daily returns', 'Low capital required', 'Perfect for beginners', 'Daily payouts'],
    referralBonusPercent: 5,
    maxActiveInvestments: 5,
    totalSlots: 1000,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Prime Growth',
    slug: 'prime-growth',
    description: 'Accelerate your wealth with 9.5% daily returns over 3 days. Minimum investment of $2,000.',
    shortDescription: '9.5% daily for 3 days',
    status: 'active',
    minInvestment: 2000,
    maxInvestment: 4999,
    dailyReturnRate: 9.5,
    totalReturnRate: 28.5,
    durationDays: 3,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'low',
    category: 'crypto',
    icon: '📈',
    color: '#3B82F6',
    sortOrder: 2,
    isFeatured: true,
    isPopular: true,
    features: ['3-day duration', '9.5% daily returns', 'Moderate capital', 'Enhanced returns', 'Priority support'],
    referralBonusPercent: 6,
    maxActiveInvestments: 4,
    totalSlots: 800,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Elite Advance',
    slug: 'elite-advance',
    description: 'Premium tier offering 12% daily returns. Build significant wealth over 4 days with $5,000+.',
    shortDescription: '12% daily for 4 days',
    status: 'active',
    minInvestment: 5000,
    maxInvestment: 9999,
    dailyReturnRate: 12,
    totalReturnRate: 48,
    durationDays: 4,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'medium',
    category: 'crypto',
    icon: '⭐',
    color: '#F59E0B',
    sortOrder: 3,
    isFeatured: false,
    isPopular: true,
    features: ['4-day duration', '12% daily returns', 'Elite access', 'VIP support', 'Weekly reports', 'Risk management'],
    referralBonusPercent: 7,
    maxActiveInvestments: 3,
    totalSlots: 500,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Ultra Max',
    slug: 'ultra-max',
    description: 'Aggressive growth strategy with 15% daily returns over 5 days. For serious investors.',
    shortDescription: '15% daily for 5 days',
    status: 'active',
    minInvestment: 10000,
    maxInvestment: 15000,
    dailyReturnRate: 15,
    totalReturnRate: 75,
    durationDays: 5,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'high',
    category: 'crypto',
    icon: '🚀',
    color: '#EF4444',
    sortOrder: 4,
    isFeatured: false,
    isPopular: false,
    features: ['5-day duration', '15% daily returns', 'Premium tier', 'Dedicated manager', 'Priority payouts', 'Risk hedge option'],
    referralBonusPercent: 8,
    maxActiveInvestments: 2,
    totalSlots: 300,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Infinity Pro',
    slug: 'infinity-pro',
    description: 'The ultimate investment plan. 18.5% daily returns over 7 days for elite portfolio holders.',
    shortDescription: '18.5% daily for 7 days',
    status: 'active',
    minInvestment: 15001,
    maxInvestment: 25000,
    dailyReturnRate: 18.5,
    totalReturnRate: 129.5,
    durationDays: 7,
    principalReturn: true,
    payoutFrequency: 'daily',
    riskLevel: 'high',
    category: 'crypto',
    icon: '👑',
    color: '#8B5CF6',
    sortOrder: 5,
    isFeatured: true,
    isPopular: false,
    features: ['7-day duration', '18.5% daily returns', 'Exclusive access', 'Personal wealth advisor', 'Daily insights', 'Network access', 'Early withdrawal allowed'],
    referralBonusPercent: 10,
    maxActiveInvestments: 2,
    totalSlots: 100,
    usedSlots: 0,
    totalInvestors: 0,
    totalInvested: 0,
    totalPaidOut: 0,
  },
  {
    name: 'Flash Promo',
    slug: 'flash-promo',
    description: 'Limited time offer! 25% profit every 12 hours. Fast-paced returns for bold traders.',
    shortDescription: '25% profit every 12 hours',
    status: 'active',
    minInvestment: 5000,
    maxInvestment: 25000,
    dailyReturnRate: 50, // 25% per 12 hours = ~50% daily
    totalReturnRate: 100, // Over 2 days equivalent
    durationDays: 2,
    principalReturn: true,
    payoutFrequency: 'twice-daily', // Custom: every 12 hours
    riskLevel: 'very_high',
    category: 'crypto',
    icon: '⚡',
    color: '#EC4899',
    sortOrder: 6,
    isFeatured: true,
    isPopular: false,
    features: ['Limited slots', '25% every 12 hours', 'Ultra-fast returns', 'Exclusive deal', 'Instant payouts', 'Premium analytics'],
    referralBonusPercent: 9,
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
