import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
