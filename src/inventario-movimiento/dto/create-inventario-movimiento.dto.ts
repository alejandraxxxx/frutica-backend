import { IsEnum, IsInt, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateInventarioMovimientoDto {
    @IsInt()
    productoId: number;

    @IsEnum(['entrada', 'salida'])
    tipo: string;

    @IsInt()
    @IsPositive()
    cantidad: number;

    @IsString()
    @MaxLength(100)
    descripcion: string;

    @IsInt()
    usuarioId: number;
}
