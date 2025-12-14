/**
 * ==============================================
 * VARLIXO - WALLET DTOs
 * ==============================================
 * Validation DTOs for wallet operations.
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  Min,
  Max,
  Length,
  ValidateIf,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TransactionStatus, TransactionType } from '../../schemas/transaction.schema';
import { PaymentMethod } from '../../schemas/transaction.schema';

// Create deposit request DTO
export class CreateDepositDto {
  @IsNumber()
  @Min(10, { message: 'Minimum deposit is $10' })
  @Max(1000000, { message: 'Maximum deposit is $1,000,000' })
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  cryptoCurrency?: string;

  @IsOptional()
  @IsString()
  userNote?: string;
}

// Upload deposit proof DTO
export class UploadDepositProofDto {
  @IsString()
  @IsNotEmpty()
  depositId: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

// Create withdrawal request DTO
export class CreateWithdrawalDto {
  @IsNumber()
  @Min(50, { message: 'Minimum withdrawal is $50' })
  @Max(100000, { message: 'Maximum withdrawal is $100,000' })
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // Crypto withdrawal fields
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsString()
  network?: string;

  // Bank withdrawal fields
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsOptional()
  @IsString()
  swiftCode?: string;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  userNote?: string;

  // 2FA verification
  @IsOptional()
  @IsString()
  @Length(6, 6)
  twoFactorCode?: string;
}

export class GetTransactionsDto extends PaginationDto {
  @IsOptional()
  @ValidateIf((o) => o.type !== undefined && o.type !== '')
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @ValidateIf((o) => o.status !== undefined && o.status !== '')
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @ValidateIf((o) => o.startDate !== undefined && o.startDate !== '')
  @IsString()
  startDate?: string;

  @IsOptional()
  @ValidateIf((o) => o.endDate !== undefined && o.endDate !== '')
  @IsString()
  endDate?: string;
}

// Transfer between wallets (internal)
export class InternalTransferDto {
  @IsNumber()
  @Min(1, { message: 'Minimum transfer is $1' })
  amount: number;

  @IsString()
  @IsNotEmpty()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  twoFactorCode?: string;
}




