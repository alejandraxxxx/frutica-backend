import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum EstadoFactura {
    EMITIDA = 'emitida',
    PAGADA = 'pagada',
    CANCELADA = 'cancelada',
}


export class CreateFacturaDto {
    @IsNumber()
    pedidoId: number;

    @IsNumber()
    clienteId: number;

    @IsNumber()
    formaPagoId: number;

    @IsNumber()
    total: number;

    @IsEnum(EstadoFactura)
    estado: EstadoFactura;

}
