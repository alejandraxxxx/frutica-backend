
import { IsString, IsOptional, IsDate,IsBoolean, IsNumber, IsNotEmpty, IsInt, IsDateString,} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDatosPersonaleDto {
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    tipo_persona?: number;

    @IsString()
    @IsNotEmpty()
    rfc: string;

    @IsString()
    @IsOptional()
    alias?: string;

    @IsString()
    @IsOptional()
    razon_social?: string;

    @IsString()
    @IsOptional()
    regimen_fiscal?: string;

    @IsString()
    @IsOptional()
    uso_factura?: string;

    @IsDateString()
    @IsOptional()
    fecha_nacimiento?: Date;

    @IsInt()
    @Type(() => Number)
    @IsOptional()
    genero?: number;

    @IsDateString()
    @IsOptional()
    fecha_ultima_venta?: Date;

    @IsOptional()
    foto?: any; // Puedes cambiarlo a `string` o `Buffer` si manejas imágenes en base64 o buffers

    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    usuarioId: number; // Relación con Usuario (asumimos que vendrá como ID)

    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    num_ventas: number;

    @IsInt()
    @Type(() => Number)
    @IsOptional()
    num_comentarios?: number;

    @IsBoolean()
    @IsOptional()
    misma_direccion_factura?: boolean;

    @IsDateString()
    @IsNotEmpty()
    fecha_ultima_modificacion: Date;

    @IsInt()
    @Type(() => Number)
    @IsOptional()
    estatus?: number;

    @IsString()
    @IsOptional()
    comentarios?: string;
}
