import { IsInt, IsDecimal, IsDate, IsEnum } from 'class-validator';

export class CreateFacturaDto {
    @IsDate()
    fecha_emision: Date;

    @IsDecimal()
    total: number;

    @IsEnum(['emitida', 'pagada', 'cancelada'])
    estado: string;

    @IsInt()
    pedidoPedidoK: number;

    @IsInt()
    clienteClientek: number;

    @IsInt()
    formaPagoFormaK: number;

    @IsInt()
    empleadoEmpleadoK: number;
}
