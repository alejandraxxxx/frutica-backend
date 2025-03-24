import { IsString, IsOptional, IsInt, IsBoolean, IsNumber, MaxLength, IsEnum } from 'class-validator';

export class CreateProductoDto {
    @IsString()
    @MaxLength(50)
    codigo_producto: string;

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
    @IsNumber()
    precio_estimado: number; // ✅ Precio base del producto

    @IsOptional()
    @IsEnum(["kg", "unidad"])
    unidad_venta: "kg" | "unidad"; // ✅ Se vende por kg o unidad

    @IsOptional()
    @IsNumber()
    peso_estimado?: number; // ✅ Agregar este campo al DTO

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
}
