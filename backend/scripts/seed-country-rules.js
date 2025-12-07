/**
 * Seed Varlixo Country Rules
 * Creates country-specific settings including currency mapping, KYC levels, and payment hints
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const countryRules = [
  {
    country_code: 'BR',
    currency: 'BRL',
    currency_symbol: 'R$',
    currency_locale: 'pt-BR',
    kyc_level: 'id_only',
    payment_hints: ['PIX', 'BOLETO', 'TRANSFERÊNCIA', 'CRIPTOMOEDA'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 15,
    notes: 'Brazil - Major Latin American market',
  },
  {
    country_code: 'NG',
    currency: 'NGN',
    currency_symbol: '₦',
    currency_locale: 'en-NG',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'USSD', 'CRYPTO', 'OPAY', 'PAYSTACK'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 20,
    notes: 'Nigeria - Major African market',
  },
  {
    country_code: 'US',
    currency: 'USD',
    currency_symbol: '$',
    currency_locale: 'en-US',
    kyc_level: 'basic',
    payment_hints: ['ACH', 'WIRE', 'CARD', 'CRYPTO', 'PAYPAL'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 25,
    notes: 'United States - Primary market',
  },
  {
    country_code: 'GB',
    currency: 'GBP',
    currency_symbol: '£',
    currency_locale: 'en-GB',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['FASTER_PAYMENTS', 'SEPA', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 20,
    notes: 'United Kingdom - European market',
  },
  {
    country_code: 'IN',
    currency: 'INR',
    currency_symbol: '₹',
    currency_locale: 'en-IN',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['UPI', 'BANK_TRANSFER', 'NEFT', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 18,
    notes: 'India - Emerging market',
  },
  {
    country_code: 'DE',
    currency: 'EUR',
    currency_symbol: '€',
    currency_locale: 'de-DE',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['SEPA', 'CARD', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 19,
    notes: 'Germany - Europe',
  },
  {
    country_code: 'FR',
    currency: 'EUR',
    currency_symbol: '€',
    currency_locale: 'fr-FR',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['SEPA', 'CARD', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 20,
    notes: 'France - Europe',
  },
  {
    country_code: 'CA',
    currency: 'CAD',
    currency_symbol: 'C$',
    currency_locale: 'en-CA',
    kyc_level: 'id_only',
    payment_hints: ['INTERAC', 'WIRE', 'ACH', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 13,
    notes: 'Canada - North America',
  },
  {
    country_code: 'AU',
    currency: 'AUD',
    currency_symbol: 'A$',
    currency_locale: 'en-AU',
    kyc_level: 'id_only',
    payment_hints: ['NPP', 'BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 10,
    notes: 'Australia - Oceania',
  },
  {
    country_code: 'JP',
    currency: 'JPY',
    currency_symbol: '¥',
    currency_locale: 'ja-JP',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'CONVENIENCE_STORE', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 10,
    notes: 'Japan - Asia-Pacific',
  },
  {
    country_code: 'SG',
    currency: 'SGD',
    currency_symbol: 'S$',
    currency_locale: 'en-SG',
    kyc_level: 'id_only',
    payment_hints: ['PAYNOW', 'BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: false,
    tax_rate_percent: 0,
    notes: 'Singapore - Southeast Asia',
  },
  {
    country_code: 'ZA',
    currency: 'ZAR',
    currency_symbol: 'R',
    currency_locale: 'en-ZA',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'CRYPTO', 'EFT'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 15,
    notes: 'South Africa - Africa',
  },
  {
    country_code: 'MX',
    currency: 'MXN',
    currency_symbol: '$',
    currency_locale: 'es-MX',
    kyc_level: 'id_only',
    payment_hints: ['SPEI', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 16,
    notes: 'Mexico - Latin America',
  },
];

async function seedCountryRules() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create flexible model
    const schema = new mongoose.Schema({}, { strict: false, collection: 'countryrules' });
    const Model = mongoose.model('CountryRules', schema);

    // Check how many exist
    const existing = await Model.countDocuments();
    console.log(`📊 Found ${existing} existing country rules`);

    // Clear existing or update
    if (existing > 0) {
      console.log('🔄 Updating existing country rules...');
      for (const rule of countryRules) {
        await Model.findOneAndUpdate(
          { country_code: rule.country_code },
          rule,
          { upsert: true, new: true }
        );
      }
    } else {
      console.log('➕ Inserting new country rules...');
      await Model.insertMany(countryRules);
    }

    const final = await Model.countDocuments();
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║             COUNTRY RULES SEEDING COMPLETE               ║
╠═══════════════════════════════════════════════════════════╣
║  Total Country Rules: ${String(final).padEnd(41)}║
║  Countries Seeded: ${String(countryRules.length).padEnd(44)}║
╚═══════════════════════════════════════════════════════════╝
    `);

    console.log('\n📋 Seeded Countries:');
    countryRules.forEach(rule => {
      console.log(`   ✓ ${rule.country_code} - ${rule.currency} (${rule.kyc_level})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding country rules:', error.message);
    process.exit(1);
  }
}

seedCountryRules();
