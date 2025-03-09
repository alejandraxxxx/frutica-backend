import { IsString, IsOptional,  IsInt, IsBoolean, IsEmail, IsDate, 
    MaxLength,Min, IsNumber } from 'class-validator';

export class CreateClienteDto {
    @IsInt()
    tipo_persona: number;  // 0 física, 1 moral

    @IsString()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @MaxLength(45)
    apellido_paterno: string;

    @IsString()
    @MaxLength(45)
    apellido_materno: string;

    @IsString()
    @MaxLength(20)
    rfc: string;

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

    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email_alterno?: string;

    @IsString()
    @MaxLength(30)
    tipo_registro: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    uso_factura?: string;

    @IsOptional()
    @IsDate()
    fecha_nacimiento?: Date;

    @IsOptional()
    @IsInt()
    genero?: number; // 0 masculino, 1 femenino

    @IsOptional()
    @IsDate()
    fecha_ultima_venta?: Date;

    @IsOptional()
    @IsString()
    foto?: string;  // Base64 o URL de la imagen

    @IsInt()
    usuario_creacion: number;

    @IsDate()
    fecha_creacion: Date;

    @IsInt()
    sucursal_creacion: number;

    @IsInt()
    num_ventas: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    num_telefonos?: string;

    @IsNumber()
    num_ventas_monto: number;

    @IsOptional()
    @IsInt()
    num_comentarios?: number;

    @IsOptional()
    @IsBoolean()
    misma_direccion_factura?: boolean;

    @IsOptional()
    @IsDate()
    fecha_ultima_modificacion?: Date;

    @IsInt()
    estatus: number;  // 1 activo, 0 inactivo

    @IsOptional()
    @IsString()
    @MaxLength(500)
    comentarios?: string;

    @IsBoolean()
    activo: boolean;

    @IsInt()
    entrega_habitual: number;  // 0 tienda, 1 domicilio

    @IsInt()
    pago_habitual: number;  // 0 efectivo, 1 transferencia

    @IsBoolean()
    user_verificado: boolean;

    @IsInt()
    usuarioUsuarioK: number;  // Relación con usuario
}
