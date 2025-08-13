import { Transform, Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsBoolean, IsNumber, MaxLength, IsEnum } from 'class-validator';

export class CreateProductoDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    codigo_producto?: string;

    @IsString()
    @MaxLength(200)
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descripcion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    foto?: string;

    @IsOptional()
    @IsEnum(["kg", "pieza"])
    unidad_venta: "kg" | "pieza";

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    peso_estimado?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    total_existencias?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true';
        return false;
    })
    activo?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true';
        return false;
    })
    requiere_pesaje?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true';
        return false;
    })
    usa_tamano?: boolean;

    @IsOptional()
    @IsEnum(["Chico", "Mediano", "Grande"])
    tamano?: "Chico" | "Mediano" | "Grande";

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value === 'true';
        return false;
    })
    variaciones_precio?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    temporada?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    proveedor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoriaCategoriaK?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    precioPrecioK?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    precio_por_kg?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    precio_por_pieza?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    peso_chico?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    peso_mediano?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    peso_grande?: number;
}