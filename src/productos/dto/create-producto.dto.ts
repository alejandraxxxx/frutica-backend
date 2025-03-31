import { Type } from 'class-transformer';
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
    unidad_venta: "kg" | "pieza"; // Se vende por kg o unidad
    
    @Type(() => Number)
    @IsNumber()
    precio_estimado: number; // ✅ Precio base del producto


    @IsOptional()
    @IsNumber()
    peso_estimado?: number; // Agregar este campo al DTO

    @IsOptional()
    @IsInt()
    total_existencias: number;

    @IsOptional()
    @IsBoolean()
    activo: boolean;

    @IsOptional()
    @IsBoolean()
    requiere_pesaje: boolean;

    @IsOptional()
    @IsBoolean()
    usa_tamano: boolean;

    @IsOptional()
    @IsEnum(["Chico", "Mediano", "Grande"])
    tamano?: "Chico" | "Mediano" | "Grande";

    @IsOptional()
    @IsBoolean()
    variaciones_precio: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    temporada?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    proveedor: string;

    @IsOptional()
    @IsInt()
    categoriaCategoriaK?: number;

    @IsOptional()
    @IsInt()
    precioPrecioK?: number;

    @IsOptional()
    @IsNumber()
    precio_por_kg?: number;

    @IsOptional()
    @IsNumber()
    precio_por_pieza?: number;

    
    @IsOptional()
    @IsNumber()
    peso_chico?: number;

    @IsOptional()
    @IsNumber()
    peso_mediano?: number;

    @IsOptional()
    @IsNumber()
    peso_grande?: number;


}
