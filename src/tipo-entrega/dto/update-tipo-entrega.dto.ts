import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoEntregaEnum } from './create-tipo-entrega.dto'; // 👈 importa el mismo enum

export class UpdateTipoEntregaDto {
  @IsOptional()
  @IsEnum(TipoEntregaEnum, {
    message: 'metodo_entrega debe ser "Entrega a domicilio" o "Pasar a recoger"',
  })
  metodo_entrega?: TipoEntregaEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  direccionId?: number;

  @IsOptional()
  @IsString()
  repartidor?: string;

  @IsOptional()
  @IsDateString()
  fecha_estimada_entrega?: string;

  @IsOptional()
  @IsString()
  hora_estimada_entrega?: string;

  @IsOptional()
  @IsNumber()
  costo_envio?: number;

  @IsOptional()
  @IsEnum(['pendiente', 'en camino', 'entregado', 'cancelado'], {
    message: 'estado debe ser "pendiente", "en camino", "entregado" o "cancelado"',
  })
  estado?: 'pendiente' | 'en camino' | 'entregado' | 'cancelado';
}
