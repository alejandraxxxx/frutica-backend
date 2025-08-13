import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreatePagoDto {
  @IsNotEmpty()
  @IsNumber()
  pedidoId: number;

  @IsNotEmpty()
  @IsString()
  metodo: string;

  // userId lo vas a sacar del token (NO lo pongas aquí)
}
