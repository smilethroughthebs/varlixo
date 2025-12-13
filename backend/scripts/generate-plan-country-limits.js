/**
 * Generate country-specific investment plan limits
 *
 * This script reads existing investment plans (USD base min/max) and country rules (country -> currency),
 * then uses live FX rates (USD base) to generate per-country min/max values.
 *
 * It stores limits in plan.countryLimits as USD-equivalent numbers such that when the frontend displays
 * them in local currency (via FX conversion), they land on rounded "nice" local amounts.
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TARGET_COUNTRIES = [
  'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES',
  'BR', 'MX', 'ZA', 'IN',
  'SA', 'AE', 'QA', 'TR', 'EG',
  'KE', 'GH', 'ID', 'PH', 'VN', 'MY',
  'SG', 'AU', 'NZ',
  'CH', 'BE', 'NL',
  'SE', 'NO',
];

function stepFor(value) {
  const abs = Math.abs(value);
  if (abs < 100) return 1;
  if (abs < 1000) return 5;
  if (abs < 5000) return 10;
  if (abs < 20000) return 50;
  if (abs < 100000) return 100;
  if (abs < 500000) return 500;
  if (abs < 2000000) return 1000;
  if (abs < 10000000) return 5000;
  return 10000;
}

function roundUp(value, step) {
  if (!step) return value;
  return Math.ceil(value / step) * step;
}

function roundDown(value, step) {
  if (!step) return value;
  return Math.floor(value / step) * step;
}

function roundTo2(value) {
  return Math.round(value * 100) / 100;
}

async function fetchUsdRates() {
  // Primary: open.er-api.com
  try {
    const res = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 7000 });
    const rates = res.data?.rates;
    if (rates && typeof rates === 'object') {
      return { rates: { ...rates, USD: 1 }, provider: 'open.er-api.com' };
    }
  } catch {
    // ignore
  }

  // Fallback: exchangerate.host
  const res = await axios.get('https://api.exchangerate.host/latest', {
    params: { base: 'USD' },
    timeout: 7000,
  });
  const rates = res.data?.rates;
  if (!rates || typeof rates !== 'object') {
    throw new Error('Failed to fetch USD rates table from providers');
  }

  return { rates: { ...rates, USD: 1 }, provider: 'exchangerate.host' };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in .env');
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected');

  const planSchema = new mongoose.Schema({}, { strict: false, collection: 'investmentplans' });
  const Plan = mongoose.model('InvestmentPlan', planSchema);

  const countrySchema = new mongoose.Schema({}, { strict: false, collection: 'countryrules' });
  const CountryRules = mongoose.model('CountryRules', countrySchema);

  console.log('🌍 Fetching country rules...');
  const rules = await CountryRules.find({ country_code: { $in: TARGET_COUNTRIES } });
  const countryToCurrency = new Map();
  for (const r of rules) {
    const c = String(r.country_code || '').toUpperCase();
    const cur = String(r.currency || 'USD').toUpperCase();
    if (c) countryToCurrency.set(c, cur);
  }

  // Default any missing to USD
  for (const c of TARGET_COUNTRIES) {
    if (!countryToCurrency.has(c)) countryToCurrency.set(c, 'USD');
  }

  console.log('💱 Fetching FX rates (USD base)...');
  const { rates, provider } = await fetchUsdRates();
  console.log(`✅ FX rates loaded from ${provider}`);

  console.log('📦 Loading plans...');
  const plans = await Plan.find({});
  console.log(`✅ Found ${plans.length} plans`);

  let updated = 0;

  for (const plan of plans) {
    const minUsd = Number(plan.minInvestment);
    const maxUsd = Number(plan.maxInvestment);

    if (!isFinite(minUsd) || !isFinite(maxUsd) || minUsd < 0 || maxUsd <= 0) {
      continue;
    }

    const countryLimits = [];

    for (const country of TARGET_COUNTRIES) {
      const currency = countryToCurrency.get(country) || 'USD';
      const rate = Number(rates[currency]) || 1;

      // Convert current USD min/max into local
      const localMinRaw = minUsd * rate;
      const localMaxRaw = maxUsd * rate;

      const stepMin = stepFor(localMinRaw);
      const stepMax = stepFor(localMaxRaw);

      // Create rounded, "nice" local values
      const localMinNice = roundUp(localMinRaw, stepMin);
      const localMaxNice = roundDown(localMaxRaw, stepMax);

      const finalLocalMax = localMaxNice >= localMinNice ? localMaxNice : localMinNice;

      // Convert back to USD equivalents (so backend stays USD-based)
      const derivedMinUsd = roundTo2(localMinNice / rate);
      const derivedMaxUsd = roundTo2(finalLocalMax / rate);

      countryLimits.push({
        country,
        minInvestment: derivedMinUsd,
        maxInvestment: derivedMaxUsd,
      });
    }

    await Plan.updateOne(
      { _id: plan._id },
      { $set: { countryLimits } },
    );

    updated += 1;
  }

  console.log(`\n✅ Updated countryLimits for ${updated} plans`);

  await mongoose.disconnect();
  console.log('✅ Done');
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
