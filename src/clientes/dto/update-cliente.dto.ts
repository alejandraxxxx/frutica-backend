import {IsString, IsOptional, IsInt, IsBoolean, IsEmail, IsDate,MaxLength, IsNumber} from 'class-validator';

export class UpdateClienteDto {
    @IsOptional()
    @IsInt()
    tipo_persona?: number;  // 0 física, 1 moral

    @IsOptional()
    @IsString()
    @MaxLength(100)
    nombre?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    apellido_paterno?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    apellido_materno?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    rfc?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    alias?: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    razon_social?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    regimen_fiscal?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email_alterno?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    tipo_registro?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    uso_factura?: string;

    @IsOptional()
    @IsDate()
    fecha_nacimiento?: Date;

    @IsOptional()
    @IsInt()
    genero?: number;

    @IsOptional()
    @IsDate()
    fecha_ultima_venta?: Date;

    @IsOptional()
    @IsString()
    foto?: string;  // Base64 o URL de la imagen

    @IsOptional()
    @IsInt()
    usuario_creacion?: number;

    @IsOptional()
    @IsDate()
    fecha_creacion?: Date;

    @IsOptional()
    @IsInt()
    sucursal_creacion?: number;

    @IsOptional()
    @IsInt()
    num_ventas?: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    num_telefonos?: string;

    @IsOptional()
    @IsNumber()
    num_ventas_monto?: number;

    @IsOptional()
    @IsInt()
    num_comentarios?: number;

    @IsOptional()
    @IsBoolean()
    misma_direccion_factura?: boolean;

    @IsOptional()
    @IsDate()
    fecha_ultima_modificacion?: Date;

    @IsOptional()
    @IsInt()
    estatus?: number;  // 1 activo, 0 inactivo

    @IsOptional()
    @IsString()
    @MaxLength(500)
    comentarios?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @IsOptional()
    @IsInt()
    entrega_habitual?: number;

    @IsOptional()
    @IsInt()
    pago_habitual?: number;

    @IsOptional()
    @IsBoolean()
    user_verificado?: boolean;

    @IsOptional()
    @IsInt()
    usuarioUsuarioK?: number;
}
