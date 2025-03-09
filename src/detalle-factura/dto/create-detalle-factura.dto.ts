import { IsInt, IsDecimal, IsOptional } from 'class-validator';

export class CreateDetalleFacturaDto {
    @IsInt()
    cantidad: number;

    @IsDecimal()
    precio_unitario: number;

    @IsDecimal()
    subtotal: number;

    @IsOptional()
    @IsInt()
    facturaFacturaK?: number;

    @IsOptional()
    @IsInt()
    productoProductoK?: number;
}

