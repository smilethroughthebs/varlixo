/**
 * ==============================================
 * VARLIXO - COUNTRY RULES SCHEMA
 * ==============================================
 * Stores country-specific settings including:
 * - Currency mapping
 * - KYC verification requirements
 * - Payment method hints
 * - Tax rates
 * - Geo-blocking rules
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum KycLevel {
  BASIC = 'basic', // No KYC required
  ID_ONLY = 'id_only', // ID document required
  ID_PLUS_SELFIE = 'id_plus_selfie', // ID + Selfie required
  ID_PLUS_PROOF_OF_ADDRESS = 'id_plus_proof_of_address', // ID + Address proof
}

export type CountryRulesDocument = CountryRules & Document;

@Schema({ timestamps: true })
export class CountryRules {
  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    match: /^[A-Z]{2}$/,
  })
  country_code: string; // ISO2 code (e.g., BR, US, NG)

  @Prop({ required: true, uppercase: true })
  currency: string; // ISO4217 currency code (e.g., BRL, USD, NGN)

  @Prop({ default: 'USD' })
  currency_symbol: string; // Display symbol (e.g., R$, $, ₦)

  @Prop()
  currency_locale: string; // Locale for formatting (e.g., pt-BR, en-US)

  @Prop({
    type: String,
    enum: Object.values(KycLevel),
    default: KycLevel.BASIC,
  })
  kyc_level: KycLevel; // KYC requirement level for this country

  @Prop({ type: [String], default: [] })
  payment_hints: string[]; // Suggested payment methods (PIX, BOLETO, UPI, etc.)

  @Prop({ default: false })
  is_blocked: boolean; // Whether this country is geo-blocked

  @Prop({ default: false })
  tax_enabled: boolean; // Whether to display tax estimates

  @Prop({ default: 0 })
  tax_rate_percent: number; // Tax rate percentage for display only

  @Prop({ type: Object, default: {} })
  kyc_requirements: {
    id_document_required?: boolean;
    selfie_required?: boolean;
    address_proof_required?: boolean;
    max_daily_withdrawal?: number;
    max_transaction_amount?: number;
  };

  @Prop({ default: false })
  requires_gdpr_consent: boolean; // Whether GDPR consent is required

  @Prop()
  blocked_reason: string; // Reason for blocking (if is_blocked = true)

  @Prop()
  notes: string; // Admin notes

  // Tracking
  @Prop({ type: String, ref: 'User' })
  updated_by_admin: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CountryRulesSchema = SchemaFactory.createForClass(CountryRules);

// Indexes
CountryRulesSchema.index({ country_code: 1 });
CountryRulesSchema.index({ is_blocked: 1 });
CountryRulesSchema.index({ kyc_level: 1 });
