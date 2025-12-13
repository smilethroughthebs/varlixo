import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OnchainIndexerStateDocument = OnchainIndexerState & Document;

@Schema({ timestamps: true })
export class OnchainIndexerState {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop()
  lastProcessedBlock?: number;

  @Prop()
  lastProcessedSlot?: number;

  @Prop()
  lastProcessedSignature?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OnchainIndexerStateSchema = SchemaFactory.createForClass(OnchainIndexerState);
