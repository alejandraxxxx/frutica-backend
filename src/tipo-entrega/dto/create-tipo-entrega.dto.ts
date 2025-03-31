import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTipoEntregaDto {
  @IsEnum(['Entrega a domicilio', 'Pasar a recoger'])
  metodo_entrega: 'Entrega a domicilio' | 'Pasar a recoger';

  @IsNumber()
  direccionId: number;

  @IsOptional()
  @IsString()
  repartidor?: string;

  @IsDateString()
  fecha_estimada_entrega: string;

  @IsString()
  hora_estimada_entrega: string;

  @IsNumber()
  costo_envio: number;

  @IsOptional()
  @IsEnum(['pendiente', 'en camino', 'entregado', 'cancelado'])
  estado?: 'pendiente' | 'en camino' | 'entregado' | 'cancelado';
}
