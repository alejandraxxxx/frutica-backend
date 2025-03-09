import { IsString, IsEmail, IsOptional, IsInt, IsBoolean, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateUsuarioDto {
    @IsString()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @MaxLength(45)
    apellido_paterno: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    apellido_materno?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    telefono?: string;

    @IsString()
    @MaxLength(45)
    username: string;

    @IsEmail()
    @MaxLength(60)
    email: string;

    @IsString()
    @IsNotEmpty({ message: "La contraseña no puede estar vacía." })  // ✅ Asegura que la contraseña esté presente
    @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    @MaxLength(255)
    password_hash: string;

    @IsOptional()
    @IsBoolean()
    login_facebook?: boolean;

    @IsOptional()
    @IsBoolean()
    login_google?: boolean;

    @IsOptional()
    @IsBoolean()
    login_normal?: boolean;

    @IsString()
    @MaxLength(45)
    rol_ENUM: string;

    @IsString()
    @MaxLength(45)
    estado_ENUM: string;

    @IsInt()
    sucursal_k: number;

    @IsOptional()
    @IsString()
    @MaxLength(15)
    registrado_desde?: string;

    @IsOptional()
    @IsBoolean()
    pago_habitual?: boolean;

    @IsOptional()
    @IsBoolean()
    entrega_habitual?: boolean;

    @IsOptional()
    @IsBoolean()
    user_verificado?: boolean;
}
