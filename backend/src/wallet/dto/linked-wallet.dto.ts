import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LinkedWalletChain } from '../../schemas/linked-wallet.schema';

export class RequestLinkedWalletNonceDto {
  @IsEnum(LinkedWalletChain)
  chain: LinkedWalletChain;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  label?: string;
}

export class VerifyLinkedWalletDto {
  @IsEnum(LinkedWalletChain)
  chain: LinkedWalletChain;

  @IsString()
  address: string;

  @IsString()
  signature: string;
}
