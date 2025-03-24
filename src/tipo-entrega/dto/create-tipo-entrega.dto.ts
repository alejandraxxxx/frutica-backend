import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, IsDate } from 'class-validator';

export class CreateTipoEntregaDto {
    @IsString()
    @MaxLength(20)
    metodo_entrega: string;

    @IsOptional()
    @IsNumber()
    direccionId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    repartidor?: string;

    @IsDate()
    fecha_envio: Date;

    @IsDate()
    fecha_estimada_entrega: Date;

    @IsString()
    hora_estimada_entrega: string;

    @IsNumber()
    costo_envio: number;

    @IsEnum(['pendiente', 'en camino', 'entregado', 'cancelado'])
    estado: string;
}

