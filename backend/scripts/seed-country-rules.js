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
  {
    country_code: 'IT',
    currency: 'EUR',
    currency_symbol: '€',
    currency_locale: 'it-IT',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['SEPA', 'CARD', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 22,
    notes: 'Italy - Europe',
  },
  {
    country_code: 'ES',
    currency: 'EUR',
    currency_symbol: '€',
    currency_locale: 'es-ES',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['SEPA', 'CARD', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 21,
    notes: 'Spain - Europe',
  },
  {
    country_code: 'BE',
    currency: 'EUR',
    currency_symbol: '€',
    currency_locale: 'nl-BE',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['SEPA', 'CARD', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 21,
    notes: 'Belgium - Europe',
  },
  {
    country_code: 'NL',
    currency: 'EUR',
    currency_symbol: '€',
    currency_locale: 'nl-NL',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['SEPA', 'CARD', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 21,
    notes: 'Netherlands - Europe',
  },
  {
    country_code: 'SE',
    currency: 'SEK',
    currency_symbol: 'kr',
    currency_locale: 'sv-SE',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 25,
    notes: 'Sweden - Europe',
  },
  {
    country_code: 'NO',
    currency: 'NOK',
    currency_symbol: 'kr',
    currency_locale: 'nb-NO',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 25,
    notes: 'Norway - Europe',
  },
  {
    country_code: 'CH',
    currency: 'CHF',
    currency_symbol: 'CHF',
    currency_locale: 'de-CH',
    kyc_level: 'id_plus_proof_of_address',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 8,
    notes: 'Switzerland - Europe',
  },
  {
    country_code: 'NZ',
    currency: 'NZD',
    currency_symbol: 'NZ$',
    currency_locale: 'en-NZ',
    kyc_level: 'id_only',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 15,
    notes: 'New Zealand - Oceania',
  },
  {
    country_code: 'SA',
    currency: 'SAR',
    currency_symbol: '﷼',
    currency_locale: 'ar-SA',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 15,
    notes: 'Saudi Arabia - Middle East',
  },
  {
    country_code: 'AE',
    currency: 'AED',
    currency_symbol: 'د.إ',
    currency_locale: 'ar-AE',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 5,
    notes: 'United Arab Emirates - Middle East',
  },
  {
    country_code: 'QA',
    currency: 'QAR',
    currency_symbol: 'ر.ق',
    currency_locale: 'ar-QA',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: false,
    tax_rate_percent: 0,
    notes: 'Qatar - Middle East',
  },
  {
    country_code: 'TR',
    currency: 'TRY',
    currency_symbol: '₺',
    currency_locale: 'tr-TR',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 20,
    notes: 'Turkey - Europe/Asia',
  },
  {
    country_code: 'EG',
    currency: 'EGP',
    currency_symbol: 'E£',
    currency_locale: 'ar-EG',
    kyc_level: 'id_plus_selfie',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 14,
    notes: 'Egypt - Africa',
  },
  {
    country_code: 'KE',
    currency: 'KES',
    currency_symbol: 'KSh',
    currency_locale: 'en-KE',
    kyc_level: 'id_only',
    payment_hints: ['MPESA', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 16,
    notes: 'Kenya - Africa',
  },
  {
    country_code: 'GH',
    currency: 'GHS',
    currency_symbol: 'GH₵',
    currency_locale: 'en-GH',
    kyc_level: 'id_only',
    payment_hints: ['MOBILE_MONEY', 'BANK_TRANSFER', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 15,
    notes: 'Ghana - Africa',
  },
  {
    country_code: 'ID',
    currency: 'IDR',
    currency_symbol: 'Rp',
    currency_locale: 'id-ID',
    kyc_level: 'id_only',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 11,
    notes: 'Indonesia - Asia',
  },
  {
    country_code: 'PH',
    currency: 'PHP',
    currency_symbol: '₱',
    currency_locale: 'en-PH',
    kyc_level: 'id_only',
    payment_hints: ['BANK_TRANSFER', 'GCASH', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 12,
    notes: 'Philippines - Asia',
  },
  {
    country_code: 'VN',
    currency: 'VND',
    currency_symbol: '₫',
    currency_locale: 'vi-VN',
    kyc_level: 'id_only',
    payment_hints: ['BANK_TRANSFER', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: true,
    tax_rate_percent: 10,
    notes: 'Vietnam - Asia',
  },
  {
    country_code: 'MY',
    currency: 'MYR',
    currency_symbol: 'RM',
    currency_locale: 'ms-MY',
    kyc_level: 'id_only',
    payment_hints: ['BANK_TRANSFER', 'FPX', 'CARD', 'CRYPTO'],
    is_blocked: false,
    tax_enabled: false,
    tax_rate_percent: 0,
    notes: 'Malaysia - Asia',
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
