import { PartialType } from '@nestjs/mapped-types';
import { CreateCarritoDto } from './create-carrito.dto';

// dto/update-carrito.dto.ts
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateCarritoDto {
  @IsInt()
  usuarioId: number;

  @IsInt()
  productoId: number;

  @IsNumber()
  @IsPositive()
  nuevaCantidad: number;

  @IsEnum(['kg', 'pieza'])
  tipo_medida: 'kg' | 'pieza';

  @IsOptional()
  @IsNumber()
  peso_personalizado?: number;
}

