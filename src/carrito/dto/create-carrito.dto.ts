import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateCarritoDto {
  @IsInt()
  usuarioId: number;

  @IsInt()
  productoId: number;

  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsEnum(['kg', 'pieza'])
  tipo_medida: 'kg' | 'pieza';

  @IsOptional()
  @IsNumber()
  peso_personalizado?: number;

  @IsOptional()
  @IsEnum(['Chico', 'Mediano', 'Grande'])
  tamano?: 'Chico' | 'Mediano' | 'Grande';

}
