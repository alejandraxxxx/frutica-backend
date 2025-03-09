import { IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
    @IsOptional()
    @IsString()
    @MaxLength(45)
    nombre?: string;

    @IsString()
    @MaxLength(45)
    tabla: string;

    @IsInt()
    orden: number;

    @IsString()
    @MaxLength(45)
    descripcion: string;

    @IsOptional()
    @IsInt()
    clave?: number;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
