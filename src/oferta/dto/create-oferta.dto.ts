// src/oferta/dto/create-oferta.dto.ts

import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOfertaDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  precio_oferta: number;

  @IsOptional()
  @IsNumber()
  porcentaje_descuento?: number;

  @IsDateString()
  inicio: string;

  @IsDateString()
  fin: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
