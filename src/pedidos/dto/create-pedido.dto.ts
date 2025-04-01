import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';

export enum TipoEntregaEnum {
  DOMICILIO = 'Entrega a domicilio',
  RECOGER = 'Pasar a recoger',
}

export class CreatePedidoDto {
  @IsEnum(TipoEntregaEnum, {
    message: 'tipo_entrega debe ser "Entrega a domicilio" o "Pasar a recoger"',
  })
  tipo_entrega: TipoEntregaEnum;

  @IsNumber({}, { message: 'formaPagoId debe ser un número' })
  formaPagoId: number;

  @IsOptional()
  @IsNumber({}, { message: 'direccionId debe ser un número' })
  direccionId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'usuarioId debe ser un número' })
  usuarioId?: number;

  @IsOptional()
  @IsString({ message: 'comentario debe ser un texto' })
  comentario?: string;

  @IsString({ message: 'fecha_entrega debe ser una cadena' })
  fecha_entrega: string;

  @IsString({ message: 'horario_entrega debe ser una cadena' })
  horario_entrega: string;

  @IsNumber({}, { message: 'costo_envio debe ser un número' })
  costo_envio: number;
}
