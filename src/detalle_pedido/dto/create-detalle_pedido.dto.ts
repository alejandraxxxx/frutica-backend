import { IsInt, IsDecimal, IsString, IsOptional } from 'class-validator';

export class CreateDetallePedidoDto {
    @IsInt()
    cantidad: number;

    @IsDecimal()
    precio_unitario: number;

    @IsDecimal()
    subtotal: number;

    @IsString()
    estado: string;

    @IsOptional()
    @IsInt()
    pedidoPedidoK?: number;
}
