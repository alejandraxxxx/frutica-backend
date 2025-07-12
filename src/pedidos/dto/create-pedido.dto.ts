import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoEntregaEnum } from 'src/tipo-entrega/dto/create-tipo-entrega.dto';

export class CreatePedidoDto {
  @IsEnum(TipoEntregaEnum, {
    message: 'tipo_entrega debe ser "Entrega a domicilio" o "Pasar a recoger"',
  })
  tipo_entrega: TipoEntregaEnum;

  @Type(() => Number)
  @IsNumber({}, { message: 'formaPagoId debe ser un número' })
  formaPagoId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'direccionId debe ser un número' })
  direccionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'usuarioId debe ser un número' })
  usuarioId?: number;

  @IsOptional()
  @IsString({ message: 'comentario debe ser un texto' })
  comentario?: string;

  @IsString({ message: 'fecha_entrega debe ser una cadena' })
  fecha_entrega: string;

  @IsString({ message: 'horario_entrega debe ser una cadena' })
  horario_entrega: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'costo_envio debe ser un número' })
  costo_envio: number;
}
