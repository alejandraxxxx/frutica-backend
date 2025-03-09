import { IsString, IsEnum, IsInt, IsOptional, MaxLength } from 'class-validator';

export class CreateInventarioMovimientoDto {
    @IsEnum(['entrada', 'salida'])
    tipo: 'entrada' | 'salida';

    @IsInt()
    cantidad: number;

    @IsString()
    @MaxLength(100)
    descripcion: string;

    @IsOptional()
    @IsInt()
    productoProductoK?: number;

    @IsOptional()
    @IsInt()
    usuarioUsuarioK?: number;
}
