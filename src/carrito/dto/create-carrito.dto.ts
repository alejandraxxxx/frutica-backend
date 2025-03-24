import { IsInt, IsNumber, IsOptional } from "class-validator";

export class CreateCarritoDto {
    @IsInt()
    usuarioId: number;

    @IsInt()
    productoId: number;

    @IsInt()
    cantidad: number;

    @IsOptional()
    @IsNumber()
    peso_seleccionado?: number;
}
