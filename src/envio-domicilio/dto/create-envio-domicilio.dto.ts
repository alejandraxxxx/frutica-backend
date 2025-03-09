import { IsString, IsInt, IsDecimal, IsOptional, IsDate, IsEnum } from 'class-validator';

export class CreateEnvioDomicilioDto {
    @IsString()
    repartidor: string;

    @IsDate()
    fecha_envio: Date;

    @IsDate()
    fecha_estimada_entrega: Date;

    @IsDecimal()
    costo_envio: number;

    @IsEnum(['pendiente', 'en camino', 'entregado', 'cancelado'])
    estado: string;

    @IsInt()
    direccionDireccionK: number;
}
