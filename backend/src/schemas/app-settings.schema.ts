import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppSettingsDocument = AppSettings & Document;

@Schema({ timestamps: true })
export class AppSettings {
  @Prop({ required: true, unique: true, default: 'global' })
  key: string;

  @Prop({ default: 'Varlixo' })
  siteName: string;

  @Prop({ default: 'admin@varlixo.com' })
  adminEmail: string;

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: false })
  smsNotifications: boolean;

  @Prop({ default: false })
  twoFactorRequired: boolean;

  @Prop({ default: 100 })
  minDeposit: number;

  @Prop({ default: 50 })
  minWithdrawal: number;

  @Prop({ default: 2 })
  withdrawalFee: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedByAdminId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);

AppSettingsSchema.index({ key: 1 }, { unique: true });
