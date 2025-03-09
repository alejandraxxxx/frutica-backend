import { IsString, IsOptional, IsInt, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreatePrecioDto {
    @IsString()
    @MaxLength(50)
    nombre: string;

    @IsOptional()
    @IsNumber()
    precio_unit_mayoreo?: number;

    @IsOptional()
    @IsNumber()
    precio_unit_menudeo?: number;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    orden?: string;

    @IsBoolean()
    obligatorio: boolean;

    @IsBoolean()
    activo: boolean;

    @IsBoolean()
    variacion: boolean;

    @IsOptional()
    @IsNumber()
    monto_variacion?: number;
}
