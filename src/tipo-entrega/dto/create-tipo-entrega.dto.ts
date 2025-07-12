import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum TipoEntregaEnum {
  DOMICILIO = 'Entrega a domicilio',
  RECOGER = 'Pasar a recoger',
}

export class CreateTipoEntregaDto {
  @IsEnum(TipoEntregaEnum, {
    message: 'metodo_entrega debe ser "Entrega a domicilio" o "Pasar a recoger"',
  })
  metodo_entrega: TipoEntregaEnum; // 👈 Este campo sí debe existir

  @IsNumber({}, { message: 'direccionId debe ser un número' })
  direccionId: number;

  @IsOptional()
  @IsString({ message: 'repartidor debe ser un texto' })
  repartidor?: string; // 👈 También hace falta que esté aquí

  @IsString({ message: 'fecha_estimada_entrega debe ser una fecha' })
  fecha_estimada_entrega: string;

  @IsString({ message: 'hora_estimada_entrega debe ser una hora' })
  hora_estimada_entrega: string;

  @IsNumber({}, { message: 'costo_envio debe ser un número' })
  costo_envio: number;

  @IsOptional()
  @IsEnum(['pendiente', 'en camino', 'entregado', 'cancelado'], {
    message: 'estado debe ser uno válido',
  })
  estado?: 'pendiente' | 'en camino' | 'entregado' | 'cancelado';
}
