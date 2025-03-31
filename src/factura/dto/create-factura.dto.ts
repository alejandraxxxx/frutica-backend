import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFacturaDto {
    @IsNumber()
    pedidoId: number;

    @IsNumber()
    clienteId: number;

    @IsNumber()
    formaPagoId: number;

    @IsNumber()
    total: number;

    @IsEnum(['emitida', 'pagada', 'cancelada'])
    estado: string;
}
