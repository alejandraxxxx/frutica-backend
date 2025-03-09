import { IsString, IsOptional, IsInt, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateProductoDto {
    @IsString()
    @MaxLength(50)
    codigo_producto: string;

    @IsString()
    @MaxLength(200)
    nombre: string;

    @IsBoolean()
    texto_plano: boolean;

    @IsInt()
    seccion: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    foto?: string;

    @IsString()
    @MaxLength(30)
    disponibilidad: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    temporada?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    clave?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    color?: string;

    @IsString()
    @MaxLength(45)
    proveedor: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    tamano?: string;

    @IsString()
    @MaxLength(45)
    tipo: string;

    @IsString()
    @MaxLength(45)
    unidad_medida: string;

    @IsInt()
    total_existencias: number;

    @IsInt()
    estatus: number;

    @IsOptional()
    @IsBoolean()
    requiere_pesaje?: boolean;

    @IsOptional()
    @IsInt()
    num_lotes?: number;

    @IsOptional()
    fecha_ultima_venta?: Date;

    @IsOptional()
    fecha_ultima_compra?: Date;

    @IsOptional()
    fecha_actualizacion?: Date;

    @IsInt()
    num_comentarios: number;

    @IsInt()
    numero_ventas: number;

    @IsInt()
    numero_compras: number;

    @IsInt()
    precioPrecioK: number;

    @IsInt()
    categoriaCategoriaK: number;

    @IsBoolean()
    mayoreo: boolean;

    @IsOptional()
    @IsInt()
    piezas_minimas?: number;
}

